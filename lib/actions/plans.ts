"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
    createPlanSchema,
    updatePlanSchema,
    deletePlanSchema,
    type CreatePlanInput,
    type UpdatePlanInput,
    type DeletePlanInput,
} from "@/lib/validations/plan";
import { checkPartnerAccess } from "./partners";

export async function getPlans(userId?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    let targetUserId = session.user.id;

    if (userId && userId !== session.user.id) {
        const hasAccess = await checkPartnerAccess(userId);
        if (!hasAccess) throw new Error("Unauthorized access to partner data");
        targetUserId = userId;
    }

    return prisma.workoutPlan.findMany({
        where: { userId: targetUserId },
        orderBy: { updatedAt: "desc" },
        include: {
            exercises: {
                include: { exercise: true },
                orderBy: { order: "asc" },
            },
            _count: { select: { exercises: true } },
        },
    });
}

export async function getPlan(id: string, userId?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    let targetUserId = session.user.id;

    if (userId && userId !== session.user.id) {
        const hasAccess = await checkPartnerAccess(userId);
        if (!hasAccess) throw new Error("Unauthorized access to partner data");
        targetUserId = userId;
    }

    const plan = await prisma.workoutPlan.findFirst({
        where: { id, userId: targetUserId },
        include: {
            exercises: {
                include: { exercise: true },
                orderBy: { order: "asc" },
            },
        },
    });

    return plan;
}

export async function createPlan(data: CreatePlanInput, targetUserId?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    let userId = session.user.id;

    if (targetUserId && targetUserId !== session.user.id) {
        const hasAccess = await checkPartnerAccess(targetUserId);
        if (!hasAccess) throw new Error("Unauthorized access to partner data");
        userId = targetUserId;
    }

    const validated = createPlanSchema.parse(data);

    const plan = await prisma.workoutPlan.create({
        data: {
            name: validated.name,
            description: validated.description,
            userId,
            exercises: {
                create: validated.exerciseIds.map((exerciseId, index) => ({
                    exerciseId,
                    order: index + 1,
                })),
            },
        },
        include: {
            exercises: {
                include: { exercise: true },
                orderBy: { order: "asc" },
            },
        },
    });

    revalidatePath("/plans");
    if (targetUserId) {
        revalidatePath(`/partners/${targetUserId}/plans`);
    }
    return plan;
}

export async function updatePlan(data: UpdatePlanInput, targetUserId?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    let userId = session.user.id;

    if (targetUserId && targetUserId !== session.user.id) {
        const hasAccess = await checkPartnerAccess(targetUserId);
        if (!hasAccess) throw new Error("Unauthorized access to partner data");
        userId = targetUserId;
    }

    const validated = updatePlanSchema.parse(data);

    // Build update data
    const updateData: { name?: string; description?: string | null } = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.description !== undefined) updateData.description = validated.description;

    // Update plan and exercises in a transaction
    const plan = await prisma.$transaction(async (tx) => {
        // Update plan details
        await tx.workoutPlan.update({
            where: { id: validated.id, userId },
            data: updateData,
        });

        // If exercises are being updated, replace them
        if (validated.exerciseIds) {
            // Delete existing exercises
            await tx.workoutPlanExercise.deleteMany({
                where: { workoutPlanId: validated.id },
            });

            // Create new exercises
            await tx.workoutPlanExercise.createMany({
                data: validated.exerciseIds.map((exerciseId, index) => ({
                    workoutPlanId: validated.id,
                    exerciseId,
                    order: index + 1,
                })),
            });
        }

        // Return full plan with exercises
        return tx.workoutPlan.findFirst({
            where: { id: validated.id },
            include: {
                exercises: {
                    include: { exercise: true },
                    orderBy: { order: "asc" },
                },
            },
        });
    });

    revalidatePath("/plans");
    revalidatePath(`/plans/${validated.id}`);
    if (targetUserId) {
        revalidatePath(`/partners/${targetUserId}/plans`);
        revalidatePath(`/partners/${targetUserId}/plans/${validated.id}`);
    }
    return plan;
}

export async function deletePlan(data: DeletePlanInput, targetUserId?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    let userId = session.user.id;

    if (targetUserId && targetUserId !== session.user.id) {
        const hasAccess = await checkPartnerAccess(targetUserId);
        if (!hasAccess) throw new Error("Unauthorized access to partner data");
        userId = targetUserId;
    }

    const validated = deletePlanSchema.parse(data);

    await prisma.workoutPlan.delete({
        where: { id: validated.id, userId },
    });

    revalidatePath("/plans");
    if (targetUserId) {
        revalidatePath(`/partners/${targetUserId}/plans`);
    }
}

export async function startWorkoutFromPlan(planId: string, targetUserId?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    let userId = session.user.id;

    if (targetUserId && targetUserId !== session.user.id) {
        const hasAccess = await checkPartnerAccess(targetUserId);
        if (!hasAccess) throw new Error("Unauthorized access to partner data");
        userId = targetUserId;
    }

    // Get the plan with exercises
    const plan = await prisma.workoutPlan.findFirst({
        where: { id: planId, userId },
        include: {
            exercises: {
                include: { exercise: true },
                orderBy: { order: "asc" },
            },
        },
    });

    if (!plan) throw new Error("Plan not found");

    // Create date-only value for today
    const dateOnly = new Date();
    dateOnly.setUTCHours(0, 0, 0, 0);

    // Create a new workout session with the plan's name
    const workout = await prisma.workoutSession.create({
        data: {
            name: plan.name,
            date: dateOnly,
            status: "IN_PROGRESS",
            userId,
        },
    });

    revalidatePath("/");
    revalidatePath("/workouts");
    if (targetUserId) {
        revalidatePath(`/partners/${targetUserId}/workouts`);
    }

    return {
        workout,
        exerciseIds: plan.exercises.map((e: { exerciseId: string }) => e.exerciseId),
    };
}

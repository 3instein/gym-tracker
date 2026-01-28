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

export async function getPlans() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return prisma.workoutPlan.findMany({
        where: { userId: session.user.id },
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

export async function getPlan(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const plan = await prisma.workoutPlan.findFirst({
        where: { id, userId: session.user.id },
        include: {
            exercises: {
                include: { exercise: true },
                orderBy: { order: "asc" },
            },
        },
    });

    return plan;
}

export async function createPlan(data: CreatePlanInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = createPlanSchema.parse(data);

    const plan = await prisma.workoutPlan.create({
        data: {
            name: validated.name,
            description: validated.description,
            userId: session.user.id,
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
    return plan;
}

export async function updatePlan(data: UpdatePlanInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;
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
    return plan;
}

export async function deletePlan(data: DeletePlanInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = deletePlanSchema.parse(data);

    await prisma.workoutPlan.delete({
        where: { id: validated.id, userId: session.user.id },
    });

    revalidatePath("/plans");
}

export async function startWorkoutFromPlan(planId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Get the plan with exercises
    const plan = await prisma.workoutPlan.findFirst({
        where: { id: planId, userId: session.user.id },
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
            userId: session.user.id,
        },
    });

    revalidatePath("/");
    revalidatePath("/workouts");

    return {
        workout,
        exerciseIds: plan.exercises.map((e: { exerciseId: string }) => e.exerciseId),
    };
}

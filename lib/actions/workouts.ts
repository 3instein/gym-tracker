"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
    createWorkoutSchema,
    updateWorkoutSchema,
    completeWorkoutSchema,
    deleteWorkoutSchema,
    type CreateWorkoutInput,
    type UpdateWorkoutInput,
    type CompleteWorkoutInput,
    type DeleteWorkoutInput,
} from "@/lib/validations/workout";
import { checkPartnerAccess } from "./partners";

export async function getWorkouts(limit?: number, userId?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    let targetUserId = session.user.id;

    if (userId && userId !== session.user.id) {
        const hasAccess = await checkPartnerAccess(userId);
        if (!hasAccess) throw new Error("Unauthorized access to partner data");
        targetUserId = userId;
    }

    return prisma.workoutSession.findMany({
        where: { userId: targetUserId },
        orderBy: { date: "desc" },
        take: limit,
        include: {
            sets: {
                include: { exercise: true },
                orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
            },
            _count: { select: { sets: true } },
        },
    });
}

export async function getWorkout(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const workout = await prisma.workoutSession.findUnique({
        where: { id },
        include: {
            sets: {
                include: { exercise: true },
                orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
            },
        },
    });

    if (!workout) return null;

    if (workout.userId !== session.user.id) {
        const hasAccess = await checkPartnerAccess(workout.userId);
        if (!hasAccess) throw new Error("Unauthorized access to partner workout");
    }

    return workout;
}

export async function getActiveWorkout() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return prisma.workoutSession.findFirst({
        where: {
            userId: session.user.id,
            status: "IN_PROGRESS",
        },
        include: {
            sets: {
                include: { exercise: true },
                orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createWorkout(data: CreateWorkoutInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = createWorkoutSchema.parse(data);

    // Parse date and create date-only value
    const date = new Date(validated.date);
    const dateOnly = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    const workout = await prisma.workoutSession.create({
        data: {
            name: validated.name,
            date: dateOnly,
            notes: validated.notes,
            status: "IN_PROGRESS",
            userId: session.user.id,
        },
    });

    revalidatePath("/");
    revalidatePath("/workouts");
    return workout;
}

export async function updateWorkout(data: UpdateWorkoutInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = updateWorkoutSchema.parse(data);

    const updateData: Record<string, unknown> = {};

    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.duration !== undefined) updateData.duration = validated.duration;
    if (validated.notes !== undefined) updateData.notes = validated.notes;
    if (validated.status !== undefined) updateData.status = validated.status;

    if (validated.date) {
        const date = new Date(validated.date);
        updateData.date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    }

    const workout = await prisma.workoutSession.update({
        where: { id: validated.id, userId: session.user.id },
        data: updateData,
    });

    revalidatePath("/");
    revalidatePath("/workouts");
    revalidatePath(`/workouts/${validated.id}`);
    return workout;
}

export async function completeWorkout(data: CompleteWorkoutInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = completeWorkoutSchema.parse(data);

    const workout = await prisma.workoutSession.update({
        where: { id: validated.id, userId: session.user.id },
        data: {
            status: "COMPLETED",
            duration: validated.duration,
            notes: validated.notes,
        },
    });

    revalidatePath("/");
    revalidatePath("/workouts");
    revalidatePath(`/workouts/${validated.id}`);
    return workout;
}

export async function deleteWorkout(data: DeleteWorkoutInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = deleteWorkoutSchema.parse(data);

    await prisma.workoutSession.delete({
        where: { id: validated.id, userId: session.user.id },
    });

    revalidatePath("/");
    revalidatePath("/workouts");
}

export async function getWorkoutStats(userId?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    let targetUserId = session.user.id;

    if (userId && userId !== session.user.id) {
        const hasAccess = await checkPartnerAccess(userId);
        if (!hasAccess) throw new Error("Unauthorized access to partner data");
        targetUserId = userId;
    }

    const [totalWorkouts, thisWeekWorkouts, totalSets] = await Promise.all([
        prisma.workoutSession.count({
            where: { userId: targetUserId, status: "COMPLETED" },
        }),
        prisma.workoutSession.count({
            where: {
                userId: targetUserId,
                status: "COMPLETED",
                date: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
        }),
        prisma.set.count({
            where: {
                workoutSession: { userId: targetUserId },
            },
        }),
    ]);

    return {
        totalWorkouts,
        thisWeekWorkouts,
        totalSets,
    };
}

export async function duplicateWorkout(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const workout = await prisma.workoutSession.findFirst({
        where: { id, userId: session.user.id },
        include: {
            sets: {
                orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
            },
        },
    });

    if (!workout) throw new Error("Workout not found");

    const dateOnly = new Date();
    dateOnly.setUTCHours(0, 0, 0, 0);

    const newWorkout = await prisma.workoutSession.create({
        data: {
            name: workout.name ? `${workout.name}` : "Workout Session",
            date: dateOnly,
            status: "IN_PROGRESS",
            userId: session.user.id,
            sets: {
                createMany: {
                    data: workout.sets.map((set) => ({
                        exerciseId: set.exerciseId,
                        setNumber: set.setNumber,
                        reps: set.reps,
                        weight: set.weight,
                        isWarmup: set.isWarmup,
                        notes: set.notes,
                    })),
                },
            },
        },
    });

    revalidatePath("/");
    revalidatePath("/workouts");
    return newWorkout;
}

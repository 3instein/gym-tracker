"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
    createExerciseSchema,
    updateExerciseSchema,
    deleteExerciseSchema,
    type CreateExerciseInput,
    type UpdateExerciseInput,
    type DeleteExerciseInput,
} from "@/lib/validations/exercise";
import { checkPartnerAccess } from "./partners";

export async function getExercises(userId?: string) {
    // We still check for session to ensure the user is logged in
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    let targetUserId = session.user.id;

    if (userId && userId !== session.user.id) {
        const hasAccess = await checkPartnerAccess(userId);
        if (!hasAccess) throw new Error("Unauthorized access to partner data");
        targetUserId = userId;
    }

    // Fetch all exercises (public access)
    const exercises = await prisma.exercise.findMany({
        orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    // Fetch stats for the target user (self or partner)
    const stats = await prisma.set.groupBy({
        by: ['exerciseId'],
        where: {
            workoutSession: {
                userId: targetUserId
            }
        },
        _max: {
            weight: true,
            reps: true
        }
    });

    // Create a map for faster lookup
    const statsMap = new Map(stats.map(s => [s.exerciseId, {
        maxWeight: Number(s._max.weight) || 0,
        maxReps: s._max.reps || 0
    }]));

    // Combine data
    return exercises.map(exercise => ({
        ...exercise,
        stats: statsMap.get(exercise.id) || { maxWeight: 0, maxReps: 0 }
    }));
}

export async function getExercisesByCategory(category: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return prisma.exercise.findMany({
        where: {
            category: category as never,
        },
        orderBy: { name: "asc" },
    });
}

export async function getExercise(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return prisma.exercise.findFirst({
        where: { id },
    });
}

export async function createExercise(data: CreateExerciseInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = createExerciseSchema.parse(data);

    const exercise = await prisma.exercise.create({
        data: {
            ...validated,
            userId: session.user.id,
        },
    });

    revalidatePath("/");
    revalidatePath("/exercises");
    return exercise;
}

export async function updateExercise(data: UpdateExerciseInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = updateExerciseSchema.parse(data);

    const exercise = await prisma.exercise.update({
        where: { id: validated.id, userId: session.user.id },
        data: {
            name: validated.name,
            category: validated.category,
            description: validated.description,
        },
    });

    revalidatePath("/");
    revalidatePath("/exercises");
    return exercise;
}

export async function deleteExercise(data: DeleteExerciseInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = deleteExerciseSchema.parse(data);

    await prisma.exercise.delete({
        where: { id: validated.id, userId: session.user.id },
    });

    revalidatePath("/");
    revalidatePath("/exercises");
}

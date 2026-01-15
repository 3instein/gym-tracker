"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
    createSetSchema,
    updateSetSchema,
    deleteSetSchema,
    quickAddSetSchema,
    type CreateSetInput,
    type UpdateSetInput,
    type DeleteSetInput,
    type QuickAddSetInput,
} from "@/lib/validations/set";

export async function getSetsForWorkout(workoutSessionId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify the workout belongs to the user
    const workout = await prisma.workoutSession.findFirst({
        where: { id: workoutSessionId, userId: session.user.id },
    });

    if (!workout) throw new Error("Workout not found");

    return prisma.set.findMany({
        where: { workoutSessionId },
        include: { exercise: true },
        orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
    });
}

export async function createSet(data: CreateSetInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = createSetSchema.parse(data);

    // Verify the workout belongs to the user
    const workout = await prisma.workoutSession.findFirst({
        where: { id: validated.workoutSessionId, userId: session.user.id },
    });

    if (!workout) throw new Error("Workout not found");

    const set = await prisma.set.create({
        data: {
            workoutSessionId: validated.workoutSessionId,
            exerciseId: validated.exerciseId,
            setNumber: validated.setNumber,
            reps: validated.reps,
            weight: validated.weight,
            rpe: validated.rpe,
            notes: validated.notes,
            isWarmup: validated.isWarmup,
        },
        include: { exercise: true },
    });

    revalidatePath("/");
    revalidatePath(`/workouts/${validated.workoutSessionId}`);
    return set;
}

export async function quickAddSet(data: QuickAddSetInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = quickAddSetSchema.parse(data);

    // Verify the workout belongs to the user
    const workout = await prisma.workoutSession.findFirst({
        where: { id: validated.workoutSessionId, userId: session.user.id },
    });

    if (!workout) throw new Error("Workout not found");

    // Get the next set number for this exercise in this workout
    const lastSet = await prisma.set.findFirst({
        where: {
            workoutSessionId: validated.workoutSessionId,
            exerciseId: validated.exerciseId,
        },
        orderBy: { setNumber: "desc" },
    });

    const nextSetNumber = (lastSet?.setNumber ?? 0) + 1;

    const set = await prisma.set.create({
        data: {
            workoutSessionId: validated.workoutSessionId,
            exerciseId: validated.exerciseId,
            setNumber: nextSetNumber,
            reps: validated.reps,
            weight: validated.weight,
        },
        include: { exercise: true },
    });

    revalidatePath("/");
    revalidatePath(`/workouts/${validated.workoutSessionId}`);
    return set;
}

export async function updateSet(data: UpdateSetInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = updateSetSchema.parse(data);

    // Verify the set belongs to a workout owned by the user
    const existingSet = await prisma.set.findFirst({
        where: { id: validated.id },
        include: { workoutSession: true },
    });

    if (!existingSet || existingSet.workoutSession.userId !== session.user.id) {
        throw new Error("Set not found");
    }

    const updateData: Record<string, unknown> = {};
    if (validated.reps !== undefined) updateData.reps = validated.reps;
    if (validated.weight !== undefined) updateData.weight = validated.weight;
    if (validated.rpe !== undefined) updateData.rpe = validated.rpe;
    if (validated.notes !== undefined) updateData.notes = validated.notes;
    if (validated.isWarmup !== undefined) updateData.isWarmup = validated.isWarmup;

    const set = await prisma.set.update({
        where: { id: validated.id },
        data: updateData,
        include: { exercise: true },
    });

    revalidatePath("/");
    revalidatePath(`/workouts/${existingSet.workoutSessionId}`);
    return set;
}

export async function deleteSet(data: DeleteSetInput) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = deleteSetSchema.parse(data);

    // Verify the set belongs to a workout owned by the user
    const existingSet = await prisma.set.findFirst({
        where: { id: validated.id },
        include: { workoutSession: true },
    });

    if (!existingSet || existingSet.workoutSession.userId !== session.user.id) {
        throw new Error("Set not found");
    }

    await prisma.set.delete({
        where: { id: validated.id },
    });

    revalidatePath("/");
    revalidatePath(`/workouts/${existingSet.workoutSessionId}`);
}

export async function getLastSetForExercise(exerciseId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Get the most recent set for this exercise
    return prisma.set.findFirst({
        where: {
            exerciseId,
            workoutSession: { userId: session.user.id },
        },
        orderBy: { createdAt: "desc" },
    });
}

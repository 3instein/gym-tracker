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

export async function getExercises() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return prisma.exercise.findMany({
        where: { userId: session.user.id },
        orderBy: [{ category: "asc" }, { name: "asc" }],
    });
}

export async function getExercisesByCategory(category: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return prisma.exercise.findMany({
        where: {
            userId: session.user.id,
            category: category as never,
        },
        orderBy: { name: "asc" },
    });
}

export async function getExercise(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return prisma.exercise.findFirst({
        where: { id, userId: session.user.id },
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

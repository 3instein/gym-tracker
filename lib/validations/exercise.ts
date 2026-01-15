import { z } from "zod";

// Category enum matching Prisma schema
export const categoryEnum = z.enum([
    "CHEST",
    "BACK",
    "SHOULDERS",
    "BICEPS",
    "TRICEPS",
    "LEGS",
    "CORE",
    "CARDIO",
    "FULL_BODY",
    "OTHER",
]);

export type Category = z.infer<typeof categoryEnum>;

// Create exercise schema
export const createExerciseSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    category: categoryEnum,
    description: z.string().max(500, "Description is too long").optional(),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;

// Update exercise schema
export const updateExerciseSchema = z.object({
    id: z.string().cuid(),
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    category: categoryEnum,
    description: z.string().max(500, "Description is too long").optional(),
});

export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;

// Delete exercise schema
export const deleteExerciseSchema = z.object({
    id: z.string().cuid(),
});

export type DeleteExerciseInput = z.infer<typeof deleteExerciseSchema>;

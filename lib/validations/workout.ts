import { z } from "zod";

// Workout status enum matching Prisma schema
export const workoutStatusEnum = z.enum([
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
]);

export type WorkoutStatus = z.infer<typeof workoutStatusEnum>;

// Create workout session schema
export const createWorkoutSchema = z.object({
    name: z.string().max(100, "Name is too long").optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    notes: z.string().max(1000, "Notes are too long").optional(),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

// Update workout session schema
export const updateWorkoutSchema = z.object({
    id: z.string().cuid(),
    name: z.string().max(100, "Name is too long").optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }).optional(),
    duration: z.number().int().positive().optional(),
    notes: z.string().max(1000, "Notes are too long").optional(),
    status: workoutStatusEnum.optional(),
});

export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

// Complete workout schema
export const completeWorkoutSchema = z.object({
    id: z.string().cuid(),
    duration: z.number().int().positive().optional(),
    notes: z.string().max(1000, "Notes are too long").optional(),
});

export type CompleteWorkoutInput = z.infer<typeof completeWorkoutSchema>;

// Delete workout schema
export const deleteWorkoutSchema = z.object({
    id: z.string().cuid(),
});

export type DeleteWorkoutInput = z.infer<typeof deleteWorkoutSchema>;

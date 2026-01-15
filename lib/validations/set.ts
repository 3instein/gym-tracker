import { z } from "zod";

// Create set schema
export const createSetSchema = z.object({
    workoutSessionId: z.string().cuid(),
    exerciseId: z.string().cuid(),
    setNumber: z.number().int().positive(),
    reps: z.number().int().min(0, "Reps must be 0 or more").max(999, "Reps value too high"),
    weight: z.number().min(0, "Weight must be 0 or more").max(9999, "Weight value too high"),
    rpe: z.number().int().min(1).max(10).optional(),
    notes: z.string().max(200, "Notes are too long").optional(),
    isWarmup: z.boolean().default(false),
});

export type CreateSetInput = z.infer<typeof createSetSchema>;

// Update set schema
export const updateSetSchema = z.object({
    id: z.string().cuid(),
    reps: z.number().int().min(0, "Reps must be 0 or more").max(999, "Reps value too high").optional(),
    weight: z.number().min(0, "Weight must be 0 or more").max(9999, "Weight value too high").optional(),
    rpe: z.number().int().min(1).max(10).optional().nullable(),
    notes: z.string().max(200, "Notes are too long").optional().nullable(),
    isWarmup: z.boolean().optional(),
});

export type UpdateSetInput = z.infer<typeof updateSetSchema>;

// Delete set schema
export const deleteSetSchema = z.object({
    id: z.string().cuid(),
});

export type DeleteSetInput = z.infer<typeof deleteSetSchema>;

// Quick add set (simplified version for fast logging)
export const quickAddSetSchema = z.object({
    workoutSessionId: z.string().cuid(),
    exerciseId: z.string().cuid(),
    reps: z.number().int().min(0).max(999),
    weight: z.number().min(0).max(9999),
});

export type QuickAddSetInput = z.infer<typeof quickAddSetSchema>;

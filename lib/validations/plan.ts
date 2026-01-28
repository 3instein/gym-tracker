import { z } from "zod";

// Schema for creating a workout plan
export const createPlanSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().max(500).optional(),
    exerciseIds: z.array(z.string()).min(1, "At least one exercise is required"),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;

// Schema for updating a workout plan
export const updatePlanSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required").max(100).optional(),
    description: z.string().max(500).optional().nullable(),
    exerciseIds: z.array(z.string()).min(1, "At least one exercise is required").optional(),
});

export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

// Schema for deleting a workout plan
export const deletePlanSchema = z.object({
    id: z.string(),
});

export type DeletePlanInput = z.infer<typeof deletePlanSchema>;

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExercisePicker } from "@/components/workouts/exercise-picker";
import { PlanExerciseList } from "@/components/plans/plan-exercise-list";
import { Loader2, Plus, ClipboardList } from "lucide-react";
import { createPlan, updatePlan } from "@/lib/actions/plans";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Exercise {
    id: string;
    name: string;
    category: string;
    description?: string | null;
}

interface PlanExercise {
    id: string;
    order: number;
    exercise: Exercise;
}

interface Plan {
    id: string;
    name: string;
    description: string | null;
    exercises: PlanExercise[];
}

interface PartnerPlanFormProps {
    plan?: Plan;
    exercises: Exercise[];
    userId: string;
    partnerName: string;
    className?: string;
}

export function PartnerPlanForm({ plan, exercises, userId, partnerName, className }: PartnerPlanFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Form state
    const [name, setName] = useState(plan?.name ?? "");
    const [description, setDescription] = useState(plan?.description ?? "");
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(
        plan?.exercises.map((pe) => pe.exercise) ?? []
    );

    // Validation errors
    const [errors, setErrors] = useState<{ name?: string; exercises?: string }>({});

    const handleAddExercises = (exercisesToAdd: Exercise[]) => {
        // Add exercises that aren't already in the list
        const existingIds = new Set(selectedExercises.map((e) => e.id));
        const newExercises = exercisesToAdd.filter((e) => !existingIds.has(e.id));
        setSelectedExercises([...selectedExercises, ...newExercises]);
        setErrors({ ...errors, exercises: undefined });
    };

    const handleRemoveExercise = (exerciseId: string) => {
        setSelectedExercises(selectedExercises.filter((e) => e.id !== exerciseId));
    };

    const handleReorderExercises = (reorderedExercises: Exercise[]) => {
        setSelectedExercises(reorderedExercises);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        const newErrors: { name?: string; exercises?: string } = {};
        if (!name.trim()) newErrors.name = "Name is required";
        if (selectedExercises.length === 0) newErrors.exercises = "Add at least one exercise";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        startTransition(async () => {
            try {
                if (plan) {
                    await updatePlan({
                        id: plan.id,
                        name: name.trim(),
                        description: description.trim() || null,
                        exerciseIds: selectedExercises.map((e) => e.id),
                    }, userId);
                    toast.success("Plan updated!");
                } else {
                    await createPlan({
                        name: name.trim(),
                        description: description.trim() || undefined,
                        exerciseIds: selectedExercises.map((e) => e.id),
                    }, userId);
                    toast.success("Plan created!");
                }
                router.push(`/partners/${userId}/plans`);
            } catch (error) {
                console.error("Failed to save plan:", error);
                toast.error("Failed to save plan");
            }
        });
    };

    return (
        <Card className={cn("card-electric", className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-electric" />
                    <span className="text-gradient-electric">
                        {plan ? "Edit" : "Create"} Plan for {partnerName}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Plan name */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Plan Name
                        </label>
                        <Input
                            id="name"
                            placeholder="e.g., Push Day, Leg Day"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (errors.name) setErrors({ ...errors, name: undefined });
                            }}
                            className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium">
                            Description (optional)
                        </label>
                        <Textarea
                            id="description"
                            placeholder="Describe this workout plan..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Exercises */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Exercises</h3>
                            <ExercisePicker exercises={exercises} onSelect={handleAddExercises}>
                                <Button type="button" variant="outline" className="cursor-pointer">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Exercise
                                </Button>
                            </ExercisePicker>
                        </div>

                        {errors.exercises && (
                            <p className="text-sm text-destructive">{errors.exercises}</p>
                        )}

                        <PlanExerciseList
                            exercises={selectedExercises}
                            onRemove={handleRemoveExercise}
                            onReorder={handleReorderExercises}
                        />
                    </div>

                    {/* Submit button */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(`/partners/${userId}/plans`)}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 btn-electric cursor-pointer"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {plan ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                plan ? "Update Plan" : "Create Plan"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ClipboardList, Plus } from "lucide-react";
import { createPlan, updatePlan } from "@/lib/actions/plans";
import { ExercisePicker } from "@/components/workouts/exercise-picker";
import { PlanExerciseList } from "./plan-exercise-list";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Exercise {
    id: string;
    name: string;
    category: string;
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

interface PlanFormProps {
    plan?: Plan;
    exercises: Exercise[];
    className?: string;
}

export function PlanForm({ plan, exercises, className }: PlanFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState(plan?.name || "");
    const [description, setDescription] = useState(plan?.description || "");
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(
        plan?.exercises.map((e) => e.exercise) || []
    );

    const handleAddExercises = (newExercises: Exercise[]) => {
        setSelectedExercises((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const uniqueNew = newExercises.filter((e) => !existingIds.has(e.id));
            return [...prev, ...uniqueNew];
        });
    };

    const handleRemoveExercise = (id: string) => {
        setSelectedExercises((prev) => prev.filter((e) => e.id !== id));
    };

    const handleReorderExercises = (newOrder: Exercise[]) => {
        setSelectedExercises(newOrder);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Please enter a plan name");
            return;
        }

        if (selectedExercises.length === 0) {
            toast.error("Please add at least one exercise");
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
                    });
                    toast.success("Plan updated!");
                } else {
                    await createPlan({
                        name: name.trim(),
                        description: description.trim() || undefined,
                        exerciseIds: selectedExercises.map((e) => e.id),
                    });
                    toast.success("Plan created!");
                }
                router.push("/plans");
            } catch (error) {
                console.error("Failed to save plan:", error);
                toast.error("Failed to save plan");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
            <Card className="card-electric">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-electric shadow-electric animate-electric-pulse">
                        <ClipboardList className="h-8 w-8 text-background" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl text-gradient-electric">
                            {plan ? "Edit Plan" : "Create New Plan"}
                        </CardTitle>
                        <CardDescription>
                            {plan
                                ? "Update your workout plan template"
                                : "Build a reusable workout plan template"}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Plan Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Push Day, Leg Day, Upper Body"
                            className="input-electric"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your workout plan..."
                            className="input-electric resize-none"
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Exercise selection */}
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

                <PlanExerciseList
                    exercises={selectedExercises}
                    onRemove={handleRemoveExercise}
                    onReorder={handleReorderExercises}
                />
            </div>

            {/* Submit button */}
            <Button
                type="submit"
                disabled={isPending}
                className="w-full h-14 text-lg font-semibold btn-electric cursor-pointer"
            >
                {isPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <ClipboardList className="mr-2 h-5 w-5" />
                )}
                {plan ? "Save Changes" : "Create Plan"}
            </Button>
        </form>
    );
}

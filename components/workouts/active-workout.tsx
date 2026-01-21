"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, X, Loader2, Zap, Plus, Dumbbell } from "lucide-react";
import { format } from "date-fns";
import { completeWorkout, deleteWorkout } from "@/lib/actions/workouts";
import { ExercisePicker } from "./exercise-picker";
import { SetLogger } from "./set-logger";
import { Timer } from "./timer";
import { RestTimer } from "./rest-timer";

import { MuscleFilter, type Category } from "./muscle-filter";

interface Exercise {
    id: string;
    name: string;
    category: string;
}

interface Set {
    id: string;
    setNumber: number;
    reps: number;
    weight: string | number;
    isWarmup: boolean;
    exercise: Exercise;
}

interface Workout {
    id: string;
    name: string | null;
    date: Date;
    status: string;
    sets: Set[];
    createdAt: Date;
}

interface ActiveWorkoutProps {
    workout: Workout;
    exercises: Exercise[];
}

export function ActiveWorkout({ workout, exercises }: ActiveWorkoutProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [addedExercises, setAddedExercises] = useState<Exercise[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category>("ALL");

    // Group sets by exercise
    const setsByExercise = workout.sets.reduce((acc, set) => {
        const exerciseId = set.exercise.id;
        if (!acc[exerciseId]) {
            acc[exerciseId] = {
                exercise: set.exercise,
                sets: [],
            };
        }
        acc[exerciseId].sets.push(set);
        return acc;
    }, {} as Record<string, { exercise: Exercise; sets: Set[] }>);

    // Get all unique exercises (from sets + newly added)
    const allExercises = [
        ...Object.values(setsByExercise).map((g) => g.exercise),
        ...addedExercises.filter(
            (e) => !Object.keys(setsByExercise).includes(e.id)
        ),
    ];

    // Filter exercises by category
    const filteredExercises = allExercises.filter((exercise) => {
        if (selectedCategory === "ALL") return true;
        return exercise.category === selectedCategory;
    });

    // Get unique categories available in the current workout
    const categoriesInWorkout = Array.from(
        new Set(allExercises.map((e) => e.category))
    );

    const handleAddExercises = (newExercises: Exercise[]) => {
        setAddedExercises((prev) => {
            const currentIds = new Set([
                ...Object.keys(setsByExercise),
                ...prev.map((e) => e.id),
            ]);
            const filteredNew = newExercises.filter((e) => !currentIds.has(e.id));
            return [...prev, ...filteredNew];
        });
    };

    const handleRemoveExercise = (exerciseId: string) => {
        setAddedExercises((prev) => prev.filter((e) => e.id !== exerciseId));
    };

    const handleCompleteWorkout = () => {
        startTransition(async () => {
            try {
                // Calculate duration in minutes
                const duration = Math.round(
                    (Date.now() - new Date(workout.createdAt).getTime()) / 1000 / 60
                );

                await completeWorkout({
                    id: workout.id,
                    duration: Math.max(1, duration), // Ensure at least 1 minute
                });
                router.push("/workouts");
            } catch (error) {
                console.error("Failed to complete workout:", error);
            }
        });
    };

    const handleCancelWorkout = () => {
        startTransition(async () => {
            try {
                await deleteWorkout({ id: workout.id });
                router.push("/");
            } catch (error) {
                console.error("Failed to cancel workout:", error);
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Workout header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="h-6 w-6 text-electric animate-glow" />
                        <span className="text-gradient-electric">
                            {workout.name || "Workout Session"}
                        </span>
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Timer startTime={workout.createdAt} />
                        <span>{format(new Date(workout.date), "EEEE, MMMM d, yyyy")}</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ExercisePicker exercises={exercises} onSelect={handleAddExercises} />
                    <Button
                        onClick={handleCompleteWorkout}
                        disabled={isPending || workout.sets.length === 0}
                        className="font-semibold btn-electric"
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="mr-2 h-4 w-4" />
                        )}
                        Complete
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                disabled={isPending}
                                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Cancel workout?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will delete the current workout and all logged sets. This
                                    action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Keep Workout</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleCancelWorkout}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    Yes, Cancel Workout
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <Separator />

            {/* Muscle Group Filter */}
            {allExercises.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground px-1">Filter by muscle group</p>
                    <MuscleFilter
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        categoriesInWorkout={categoriesInWorkout}
                    />
                </div>
            )}

            {/* Exercise list */}
            {allExercises.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ExercisePicker exercises={exercises} onSelect={handleAddExercises}>
                        <button className="flex h-20 w-20 items-center justify-center rounded-2xl bg-electric/10 mb-4 animate-electric-pulse hover:bg-electric/20 transition-colors cursor-pointer">
                            <Plus className="h-10 w-10 text-electric" />
                        </button>
                    </ExercisePicker>
                    <h3 className="text-xl font-semibold mb-2">Add your first exercise</h3>
                    <p className="text-muted-foreground mb-4">
                        Click the button above to start logging sets
                    </p>
                </div>
            ) : filteredExercises.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted rounded-2xl">
                    <Dumbbell className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-1">No exercises found</h3>
                    <p className="text-sm text-muted-foreground">
                        Try a different filter or add a new exercise
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {filteredExercises.map((exercise) => {
                        const exerciseSets = setsByExercise[exercise.id]?.sets || [];
                        return (
                            <SetLogger
                                key={exercise.id}
                                workoutSessionId={workout.id}
                                exercise={exercise}
                                sets={exerciseSets}
                                onRemoveExercise={
                                    exerciseSets.length === 0 && addedExercises.find((e) => e.id === exercise.id)
                                        ? () => handleRemoveExercise(exercise.id)
                                        : undefined
                                }
                            />
                        );
                    })}
                </div>
            )}

            {/* Fixed Rest Timer */}
            <RestTimer className="fixed bottom-6 right-6 z-50 w-72 shadow-2xl ring-1 ring-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" />
        </div>
    );
}

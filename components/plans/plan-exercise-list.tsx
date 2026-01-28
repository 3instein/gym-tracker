"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grip, Trash2 } from "lucide-react";

interface Exercise {
    id: string;
    name: string;
    category: string;
}

interface PlanExerciseListProps {
    exercises: Exercise[];
    onRemove: (id: string) => void;
    onReorder: (exercises: Exercise[]) => void;
}

const categoryColors: Record<string, string> = {
    CHEST: "bg-red-500/20 text-red-400",
    BACK: "bg-blue-500/20 text-blue-400",
    SHOULDERS: "bg-yellow-500/20 text-yellow-400",
    BICEPS: "bg-purple-500/20 text-purple-400",
    TRICEPS: "bg-pink-500/20 text-pink-400",
    LEGS: "bg-green-500/20 text-green-400",
    CORE: "bg-orange-500/20 text-orange-400",
    CARDIO: "bg-cyan-500/20 text-cyan-400",
    FULL_BODY: "bg-electric/20 text-electric",
    OTHER: "bg-gray-500/20 text-gray-400",
};

export function PlanExerciseList({ exercises, onRemove, onReorder }: PlanExerciseListProps) {
    const moveUp = (index: number) => {
        if (index === 0) return;
        const newExercises = [...exercises];
        [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
        onReorder(newExercises);
    };

    const moveDown = (index: number) => {
        if (index === exercises.length - 1) return;
        const newExercises = [...exercises];
        [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
        onReorder(newExercises);
    };

    if (exercises.length === 0) {
        return (
            <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground">
                        No exercises added yet. Add exercises to your plan.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Exercises ({exercises.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {exercises.map((exercise, index) => (
                    <div
                        key={exercise.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors group"
                    >
                        {/* Order controls */}
                        <div className="flex flex-col gap-0.5">
                            <button
                                type="button"
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                className="p-0.5 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move up"
                            >
                                <Grip className="h-3 w-3 rotate-90" />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveDown(index)}
                                disabled={index === exercises.length - 1}
                                className="p-0.5 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title="Move down"
                            >
                                <Grip className="h-3 w-3 rotate-90" />
                            </button>
                        </div>

                        {/* Order number */}
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-electric/20 text-electric text-xs font-semibold">
                            {index + 1}
                        </span>

                        {/* Exercise info */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{exercise.name}</p>
                            <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${categoryColors[exercise.category] || categoryColors.OTHER}`}
                            >
                                {exercise.category.replace("_", " ")}
                            </span>
                        </div>

                        {/* Remove button */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemove(exercise.id)}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

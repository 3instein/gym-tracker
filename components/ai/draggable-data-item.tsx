"use client";

import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Dumbbell, Calendar, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Category } from "@prisma/client";

export type DataItemType = "exercise" | "workout" | "plan";

export interface ExerciseData {
    type: "exercise";
    id: string;
    name: string;
    category: Category;
    stats?: {
        maxWeight: number;
        maxReps: number;
    };
}

export interface WorkoutData {
    type: "workout";
    id: string;
    name: string | null;
    date: string;
    exercises: { name: string; sets: number; maxWeight: number; totalReps: number }[];
}

export interface PlanData {
    type: "plan";
    id: string;
    name: string;
    exercises: { name: string; category: string }[];
}

export type DraggableData = ExerciseData | WorkoutData | PlanData;

const categoryColors: Record<Category, string> = {
    CHEST: "bg-red-500/10 text-red-500",
    BACK: "bg-blue-500/10 text-blue-500",
    SHOULDERS: "bg-yellow-500/10 text-yellow-500",
    BICEPS: "bg-purple-500/10 text-purple-500",
    TRICEPS: "bg-pink-500/10 text-pink-500",
    LEGS: "bg-green-500/10 text-green-500",
    CORE: "bg-orange-500/10 text-orange-500",
    CARDIO: "bg-cyan-500/10 text-cyan-500",
    FULL_BODY: "bg-indigo-500/10 text-indigo-500",
    OTHER: "bg-gray-500/10 text-gray-500",
};

export function DraggableDataItem({ data }: { data: DraggableData }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `${data.type}-${data.id}`,
        data,
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg border bg-card cursor-grab relative overflow-hidden",
                "hover:bg-accent/50 hover:border-primary/30 transition-all",
                "select-none touch-none",
                isDragging && "opacity-50 ring-2 ring-primary"
            )}
        >
            <div className="shrink-0">
                {data.type === "exercise" && <Dumbbell className="h-4 w-4 text-muted-foreground" />}
                {data.type === "workout" && <Calendar className="h-4 w-4 text-muted-foreground" />}
                {data.type === "plan" && <ClipboardList className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0 pr-16">
                {data.type === "exercise" && (
                    <>
                        <p className="font-medium text-sm truncate">{data.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={cn("text-xs", categoryColors[data.category])}>
                                {data.category}
                            </Badge>
                        </div>
                        {data.stats && (data.stats.maxWeight > 0 || data.stats.maxReps > 0) && (
                            <div className="absolute top-2.5 right-3 flex flex-col items-end gap-0">
                                {data.stats.maxWeight > 0 && (
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-sm font-bold text-foreground">{data.stats.maxWeight}</span>
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">kg</span>
                                    </div>
                                )}
                                {data.stats.maxReps > 0 && (
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-sm font-bold text-foreground">{data.stats.maxReps}</span>
                                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">reps</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
                {data.type === "workout" && (
                    <>
                        <p className="font-medium text-sm truncate">
                            {data.name || new Date(data.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.exercises.length} exercise{data.exercises.length !== 1 ? "s" : ""}
                        </p>
                    </>
                )}
                {data.type === "plan" && (
                    <>
                        <p className="font-medium text-sm truncate">{data.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.exercises.length} exercise{data.exercises.length !== 1 ? "s" : ""}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

// Helper function to convert dragged data to text for the prompt
export function dataToPromptText(data: DraggableData): string {
    switch (data.type) {
        case "exercise":
            const stats = data.stats;
            if (stats && (stats.maxWeight > 0 || stats.maxReps > 0)) {
                return `[Exercise: ${data.name} (${data.category}) - Max Weight: ${stats.maxWeight}kg, Max Reps: ${stats.maxReps}]`;
            }
            return `[Exercise: ${data.name} (${data.category})]`;
        case "workout":
            const exerciseList = data.exercises
                .map((e) => `  - ${e.name}: ${e.sets} sets, max ${e.maxWeight}kg, ${e.totalReps} total reps`)
                .join("\n");
            return `[Workout on ${new Date(data.date).toLocaleDateString()}:\n${exerciseList}]`;
        case "plan":
            const planExercises = data.exercises
                .map((e) => `  - ${e.name} (${e.category})`)
                .join("\n");
            return `[Plan: ${data.name}\n${planExercises}]`;
    }
}

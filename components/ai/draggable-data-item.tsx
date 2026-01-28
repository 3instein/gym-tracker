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
}

export interface WorkoutData {
    type: "workout";
    id: string;
    name: string | null;
    date: string;
    exercises: { name: string; sets: number }[];
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
                "flex items-center gap-3 p-3 rounded-lg border bg-card cursor-grab",
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
            <div className="flex-1 min-w-0">
                {data.type === "exercise" && (
                    <>
                        <p className="font-medium text-sm truncate">{data.name}</p>
                        <Badge variant="outline" className={cn("text-xs mt-1", categoryColors[data.category])}>
                            {data.category}
                        </Badge>
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
            return `[Exercise: ${data.name} (${data.category})]`;
        case "workout":
            const exerciseList = data.exercises
                .map((e) => `  - ${e.name}: ${e.sets} sets`)
                .join("\n");
            return `[Workout on ${new Date(data.date).toLocaleDateString()}:\n${exerciseList}]`;
        case "plan":
            const planExercises = data.exercises
                .map((e) => `  - ${e.name} (${e.category})`)
                .join("\n");
            return `[Plan: ${data.name}\n${planExercises}]`;
    }
}

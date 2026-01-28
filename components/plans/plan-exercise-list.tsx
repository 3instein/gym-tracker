"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, Trash2 } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

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

interface SortableExerciseItemProps {
    exercise: Exercise;
    index: number;
    onRemove: (id: string) => void;
}

function SortableExerciseItem({ exercise, index, onRemove }: SortableExerciseItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: exercise.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-3 p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors group",
                isDragging && "opacity-50 ring-2 ring-electric shadow-lg z-50"
            )}
        >
            {/* Drag handle */}
            <button
                type="button"
                {...attributes}
                {...listeners}
                className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-accent cursor-grab active:cursor-grabbing touch-none"
                title="Drag to reorder"
            >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Order number */}
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-electric/20 text-electric text-xs font-semibold shrink-0">
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
                className="h-8 w-8 md:opacity-0 md:group-hover:opacity-100 text-destructive hover:text-destructive cursor-pointer shrink-0"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}

export function PlanExerciseList({ exercises, onRemove, onReorder }: PlanExerciseListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement required before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = exercises.findIndex((e) => e.id === active.id);
            const newIndex = exercises.findIndex((e) => e.id === over.id);
            const newOrder = arrayMove(exercises, oldIndex, newIndex);
            onReorder(newOrder);
        }
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
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    <span>Exercises ({exercises.length})</span>
                    <span className="text-xs font-normal">Drag to reorder</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={exercises.map((e) => e.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {exercises.map((exercise, index) => (
                            <SortableExerciseItem
                                key={exercise.id}
                                exercise={exercise}
                                index={index}
                                onRemove={onRemove}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </CardContent>
        </Card>
    );
}

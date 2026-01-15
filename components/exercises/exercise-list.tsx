"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Trash2, Dumbbell, Loader2 } from "lucide-react";
import { deleteExercise } from "@/lib/actions/exercises";
import { ExerciseForm } from "./exercise-form";
import { cn } from "@/lib/utils";
import { type Category } from "@/lib/validations/exercise";

interface Exercise {
    id: string;
    userId: string;
    name: string;
    category: string;
    description: string | null;
}

interface ExerciseListProps {
    exercises: Exercise[];
    currentUserId?: string;
}

const categories: { value: string; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "CHEST", label: "Chest" },
    { value: "BACK", label: "Back" },
    { value: "SHOULDERS", label: "Shoulders" },
    { value: "BICEPS", label: "Biceps" },
    { value: "TRICEPS", label: "Triceps" },
    { value: "LEGS", label: "Legs" },
    { value: "CORE", label: "Core" },
    { value: "CARDIO", label: "Cardio" },
    { value: "FULL_BODY", label: "Full Body" },
    { value: "OTHER", label: "Other" },
];

const categoryColors: Record<string, string> = {
    CHEST: "bg-red-500/20 text-red-400 border-red-500/30",
    BACK: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    SHOULDERS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    BICEPS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    TRICEPS: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    LEGS: "bg-green-500/20 text-green-400 border-green-500/30",
    CORE: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    CARDIO: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    FULL_BODY: "bg-electric/20 text-electric border-electric/30",
    OTHER: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function ExerciseList({ exercises, currentUserId }: ExerciseListProps) {
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const filteredExercises =
        selectedCategory === "ALL"
            ? exercises
            : exercises.filter((e) => e.category === selectedCategory);

    const handleDelete = (id: string) => {
        setDeletingId(id);
        startTransition(async () => {
            try {
                await deleteExercise({ id });
            } catch (error) {
                console.error("Failed to delete exercise:", error);
            } finally {
                setDeletingId(null);
            }
        });
    };

    return (
        <div className="space-y-4">
            {/* Category tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <ScrollArea className="w-full">
                    <TabsList className="inline-flex h-auto gap-2 bg-transparent p-0">
                        {categories.map((cat) => (
                            <TabsTrigger
                                key={cat.value}
                                value={cat.value}
                                className={cn(
                                    "rounded-xl border px-4 py-2 data-[state=active]:border-electric data-[state=active]:bg-electric/10 data-[state=active]:text-electric",
                                    "border-border/50 hover:border-border"
                                )}
                            >
                                {cat.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </ScrollArea>

                <TabsContent value={selectedCategory} className="mt-4">
                    {filteredExercises.length === 0 ? (
                        <Card className="card-electric">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-electric/10 mb-4">
                                    <Dumbbell className="h-8 w-8 text-electric" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {selectedCategory === "ALL"
                                        ? "Add your first exercise to get started"
                                        : `No ${selectedCategory.toLowerCase().replace("_", " ")} exercises yet`}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {filteredExercises.map((exercise) => (
                                <Card
                                    key={exercise.id}
                                    className="card-electric group transition-all duration-200 hover:-translate-y-1"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-foreground">
                                                        {exercise.name}
                                                    </h3>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-xs",
                                                        categoryColors[exercise.category] || categoryColors.OTHER
                                                    )}
                                                >
                                                    {exercise.category.replace("_", " ")}
                                                </Badge>
                                                {exercise.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {exercise.description}
                                                    </p>
                                                )}
                                            </div>
                                            {exercise.userId === currentUserId && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ExerciseForm
                                                        exercise={{
                                                            ...exercise,
                                                            category: exercise.category as Category,
                                                        }}
                                                    />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                {deletingId === exercise.id && isPending ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete exercise?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete &quot;{exercise.name}&quot; and
                                                                    remove it from any future workouts. This action cannot be
                                                                    undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(exercise.id)}
                                                                    className="bg-destructive hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

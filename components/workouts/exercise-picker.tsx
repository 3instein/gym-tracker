"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Dumbbell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
    id: string;
    name: string;
    category: string;
}

interface ExercisePickerProps {
    exercises: Exercise[];
    onSelect: (exercise: Exercise) => void;
    isLoading?: boolean;
}

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

export function ExercisePicker({ exercises, onSelect, isLoading }: ExercisePickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredExercises = exercises.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase())
    );

    // Group by category
    const groupedExercises = filteredExercises.reduce((acc, exercise) => {
        const category = exercise.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(exercise);
        return acc;
    }, {} as Record<string, Exercise[]>);

    const handleSelect = (exercise: Exercise) => {
        onSelect(exercise);
        setOpen(false);
        setSearch("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="btn-electric" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Plus className="mr-2 h-4 w-4" />
                    )}
                    Add Exercise
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-border/50 bg-card/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-gradient-electric flex items-center gap-2">
                        <Dumbbell className="h-5 w-5" />
                        Add Exercise to Workout
                    </DialogTitle>
                    <DialogDescription>
                        Select an exercise from your library to add to this workout.
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search exercises..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 input-electric"
                    />
                </div>

                {/* Exercise list */}
                <ScrollArea className="h-[400px] pr-4">
                    {exercises.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-electric/10 mb-4">
                                <Dumbbell className="h-8 w-8 text-electric" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No exercises yet</h3>
                            <p className="text-muted-foreground text-sm">
                                Create exercises in your library first
                            </p>
                        </div>
                    ) : filteredExercises.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Search className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No exercises match your search</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedExercises).map(([category, exerciseList]) => (
                                <div key={category}>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                        {category.replace("_", " ")}
                                    </h4>
                                    <div className="space-y-2">
                                        {exerciseList.map((exercise) => (
                                            <button
                                                key={exercise.id}
                                                onClick={() => handleSelect(exercise)}
                                                className="w-full flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-3 text-left transition-all duration-200 hover:border-electric/30 hover:bg-accent/30"
                                            >
                                                <span className="font-medium">{exercise.name}</span>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-xs",
                                                        categoryColors[category] || categoryColors.OTHER
                                                    )}
                                                >
                                                    {category.replace("_", " ")}
                                                </Badge>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

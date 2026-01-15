"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, Dumbbell, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
    id: string;
    name: string;
    category: string;
}

interface ExercisePickerProps {
    exercises: Exercise[];
    onSelect: (exercises: Exercise[]) => void;
    isLoading?: boolean;
    children?: React.ReactNode;
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

export function ExercisePicker({ exercises, onSelect, isLoading, children }: ExercisePickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

    const handleToggle = (exerciseId: string) => {
        setSelectedIds((prev) =>
            prev.includes(exerciseId)
                ? prev.filter((id) => id !== exerciseId)
                : [...prev, exerciseId]
        );
    };

    const handleAddSelected = () => {
        const selectedExercises = exercises.filter((e) => selectedIds.includes(e.id));
        onSelect(selectedExercises);
        setOpen(false);
        setSearch("");
        setSelectedIds([]);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                setSearch("");
                setSelectedIds([]);
            }
        }}>
            <DialogTrigger asChild>
                {children ? (
                    children
                ) : (
                    <Button className="btn-electric" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        Add Exercise
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-border/50 bg-card/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-gradient-electric flex items-center gap-2">
                        <Dumbbell className="h-5 w-5" />
                        Add Exercises to Workout
                    </DialogTitle>
                    <DialogDescription>
                        Select one or more exercises from your library to add to this workout.
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
                                        {exerciseList.map((exercise) => {
                                            const isSelected = selectedIds.includes(exercise.id);
                                            return (
                                                <button
                                                    key={exercise.id}
                                                    onClick={() => handleToggle(exercise.id)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer",
                                                        isSelected
                                                            ? "border-electric bg-electric/10 shadow-[0_0_15px_-3px_rgba(0,163,255,0.3)]"
                                                            : "border-border/50 bg-card/50 hover:border-electric/30 hover:bg-accent/30"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "flex h-5 w-5 items-center justify-center rounded-md border transition-colors",
                                                            isSelected ? "bg-electric border-electric text-white" : "border-muted-foreground/30"
                                                        )}>
                                                            {isSelected && <Check className="h-3.5 w-3.5" />}
                                                        </div>
                                                        <span className="font-medium">{exercise.name}</span>
                                                    </div>
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
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 sm:flex-none">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddSelected}
                        disabled={selectedIds.length === 0}
                        className="btn-electric flex-1 sm:flex-none"
                    >
                        Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}Exercise{selectedIds.length !== 1 ? "s" : ""}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


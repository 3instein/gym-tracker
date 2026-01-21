"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2, Loader2, Check } from "lucide-react";
import { quickAddSet, deleteSet, getLastSetForExercise } from "@/lib/actions/sets";
import { cn } from "@/lib/utils";

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
}

interface SetLoggerProps {
    workoutSessionId: string;
    exercise: Exercise;
    sets: Set[];
    onRemoveExercise?: () => void;
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

export function SetLogger({
    workoutSessionId,
    exercise,
    sets,
    onRemoveExercise,
}: SetLoggerProps) {
    const [isPending, startTransition] = useTransition();
    const [reps, setReps] = useState<string>(() =>
        sets.length > 0 ? String(sets[sets.length - 1].reps) : "10"
    );
    const [weight, setWeight] = useState<string>(() => {
        if (sets.length > 0) {
            const val = Number(sets[sets.length - 1].weight);
            return val === 0 ? "" : String(val);
        }
        return "";
    });
    const [lastSet, setLastSet] = useState<{ reps: number; weight: number } | null>(null);

    // Sync with props during render if the number of sets changes (e.g., set added or deleted)
    const [prevSetsLength, setPrevSetsLength] = useState(sets.length);
    if (sets.length !== prevSetsLength) {
        setPrevSetsLength(sets.length);
        if (sets.length > 0) {
            const last = sets[sets.length - 1];
            setReps(String(last.reps));
            setWeight(Number(last.weight) === 0 ? "" : String(last.weight));
        }
    }

    // Fetch last set from previous sessions ONLY if we have no sets today
    const isEmpty = sets.length === 0;
    useEffect(() => {
        if (isEmpty) {
            async function fetchLastSet() {
                try {
                    const last = await getLastSetForExercise(exercise.id);
                    if (last) {
                        setLastSet({ reps: last.reps, weight: Number(last.weight) });
                        // Only set defaults if user hasn't started logging today
                        setReps(String(last.reps));
                        setWeight(Number(last.weight) === 0 ? "" : String(last.weight));
                    }
                } catch (error) {
                    console.error("Failed to fetch last set:", error);
                }
            }
            fetchLastSet();
        }
    }, [exercise.id, isEmpty]);

    const handleAddSet = () => {
        startTransition(async () => {
            try {
                await quickAddSet({
                    workoutSessionId,
                    exerciseId: exercise.id,
                    reps: Number(reps) || 0,
                    weight: Number(weight) || 0,
                });
            } catch (error) {
                console.error("Failed to add set:", error);
            }
        });
    };

    const handleDeleteSet = (setId: string) => {
        startTransition(async () => {
            try {
                await deleteSet({ id: setId });
            } catch (error) {
                console.error("Failed to delete set:", error);
            }
        });
    };

    const adjustReps = (delta: number) => {
        setReps((prev) => {
            const val = Math.max(0, (Number(prev) || 0) + delta);
            return val === 0 ? "" : String(val);
        });
    };

    const adjustWeight = (delta: number) => {
        setWeight((prev) => {
            const val = Math.max(0, (Number(prev) || 0) + delta);
            return val === 0 ? "" : String(val);
        });
    };

    return (
        <Card className="card-electric overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-xs",
                                categoryColors[exercise.category] || categoryColors.OTHER
                            )}
                        >
                            {exercise.category.replace("_", " ")}
                        </Badge>
                    </div>
                    {onRemoveExercise && sets.length === 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRemoveExercise}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                {lastSet && sets.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                        Last time: {lastSet.reps} reps × {lastSet.weight}kg
                    </p>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Logged sets */}
                {sets.length > 0 && (
                    <div className="space-y-2">
                        {sets.map((set) => (
                            <div
                                key={set.id}
                                className="flex items-center justify-between rounded-lg bg-accent/30 px-3 py-2"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-electric/20 text-electric text-sm font-bold">
                                        {set.setNumber}
                                    </div>
                                    <span className="text-sm">
                                        <span className="font-semibold">{set.reps}</span> reps ×{" "}
                                        <span className="font-semibold">{Number(set.weight)}</span>kg
                                    </span>
                                    {set.isWarmup && (
                                        <Badge variant="outline" className="text-xs">
                                            Warmup
                                        </Badge>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSet(set.id)}
                                    disabled={isPending}
                                    className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add set controls */}
                <div className="flex items-center gap-4">
                    {/* Reps control */}
                    <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">Reps</label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => adjustReps(-1)}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                                type="number"
                                value={reps}
                                onChange={(e) => setReps(e.target.value)}
                                className="h-10 text-center font-semibold input-electric [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => adjustReps(1)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Weight control */}
                    <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => adjustWeight(-2.5)}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                                type="number"
                                step="0.5"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="h-10 text-center font-semibold input-electric [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => adjustWeight(2.5)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Add set button */}
                <Button
                    onClick={handleAddSet}
                    disabled={isPending}
                    className="w-full btn-electric h-11"
                >
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Check className="mr-2 h-4 w-4" />
                    )}
                    Log Set {sets.length + 1}
                </Button>
            </CardContent>
        </Card>
    );
}

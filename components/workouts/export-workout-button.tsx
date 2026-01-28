"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SerializedSet {
    exerciseId: string;
    exercise: {
        name: string;
    };
    setNumber: number;
    reps: number;
    weight: string;
    isWarmup: boolean;
    notes: string | null;
}

interface SerializedWorkout {
    id: string;
    name: string | null;
    date: Date | string;
    duration: number | null;
    notes: string | null;
    sets: SerializedSet[];
}

interface ExportWorkoutButtonProps {
    workout: SerializedWorkout;
}

export function ExportWorkoutButton({ workout }: ExportWorkoutButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            const lines: string[] = [];

            // Header
            lines.push(`# ${workout.name || "Workout Session"}`);
            lines.push(`**Date:** ${new Date(workout.date).toLocaleDateString()}`);
            if (workout.duration) {
                const hours = Math.floor(workout.duration / 60);
                const minutes = workout.duration % 60;
                lines.push(`**Duration:** ${hours}h ${minutes}m`);
            }
            if (workout.notes) {
                lines.push(`\n**Notes:**\n${workout.notes}`);
            }

            lines.push("\n## Exercise Log");

            // Group sets by exercise
            const setsByExercise = workout.sets.reduce((acc: Record<string, { name: string, sets: SerializedSet[] }>, set: SerializedSet) => {
                if (!acc[set.exerciseId]) {
                    acc[set.exerciseId] = {
                        name: set.exercise.name,
                        sets: [],
                    };
                }
                acc[set.exerciseId].sets.push(set);
                return acc;
            }, {});

            // Format exercises
            Object.values(setsByExercise).forEach((exercise) => {
                lines.push(`\n### ${exercise.name}`);
                exercise.sets.forEach((set) => {
                    const weight = Number(set.weight) > 0 ? `${set.weight}kg` : "Bodyweight";
                    const reps = `${set.reps} reps`;
                    const metrics = [weight, reps];

                    if (set.isWarmup) metrics.push("(Warmup)");

                    lines.push(`- Set ${set.setNumber}: ${metrics.join(" x ")}`);
                    if (set.notes) {
                        lines.push(`  > Note: ${set.notes}`);
                    }
                });
            });

            // Add summary footer
            lines.push("\n---\n*Exported from Gym Tracker*");

            await navigator.clipboard.writeText(lines.join("\n"));

            setCopied(true);
            toast.success("Workout data copied to clipboard!");

            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
            toast.error("Failed to copy to clipboard");
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            onClick={handleCopy}
            disabled={copied}
        >
            {copied ? (
                <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                </>
            ) : (
                <>
                    <Copy className="mr-2 h-4 w-4" />
                    Export for AI
                </>
            )}
        </Button>
    );
}

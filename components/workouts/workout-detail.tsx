"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Dumbbell, ChevronLeft, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteWorkout } from "@/lib/actions/workouts";
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
    exercise: Exercise;
}

interface Workout {
    id: string;
    name: string | null;
    date: Date;
    status: string;
    duration: number | null;
    sets: Set[];
}

interface WorkoutDetailProps {
    workout: Workout;
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

export function WorkoutDetail({ workout }: WorkoutDetailProps) {
    const router = useRouter();
    const [, startTransition] = useTransition();

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

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await deleteWorkout({ id: workout.id });
                router.push("/workouts");
            } catch (error) {
                console.error("Failed to delete workout:", error);
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Back button */}
            <Button variant="ghost" asChild className="gap-2">
                <Link href="/workouts">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Workouts
                </Link>
            </Button>

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gradient-electric">
                            {workout.name || "Workout Session"}
                        </h2>
                        <Badge
                            variant="outline"
                            className={cn(
                                workout.status === "COMPLETED"
                                    ? "border-green-500/30 bg-green-500/10 text-green-400"
                                    : "border-red-500/30 bg-red-500/10 text-red-400"
                            )}
                        >
                            {workout.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(workout.date), "EEEE, MMMM d, yyyy")}
                        </span>
                        {workout.duration && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {workout.duration} min
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Dumbbell className="h-4 w-4" />
                            {workout.sets.length} sets
                        </span>
                    </div>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Workout
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete workout?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this workout and all logged sets.
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Separator />

            {/* Exercise summary */}
            <div className="grid gap-4 md:grid-cols-2">
                {Object.values(setsByExercise).map(({ exercise, sets }) => (
                    <Card key={exercise.id} className="card-electric">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
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
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {sets.map((set) => (
                                    <div
                                        key={set.id}
                                        className="flex items-center gap-3 rounded-lg bg-accent/30 px-3 py-2"
                                    >
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-electric/20 text-electric text-sm font-bold">
                                            {set.setNumber}
                                        </div>
                                        <span className="text-sm">
                                            <span className="font-semibold">{set.reps}</span> reps ×{" "}
                                            <span className="font-semibold">{Number(set.weight)}</span>
                                            kg
                                        </span>
                                        {set.isWarmup && (
                                            <Badge variant="outline" className="text-xs">
                                                Warmup
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

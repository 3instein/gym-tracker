"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Dumbbell, ChevronRight, Play } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { duplicateWorkout } from "@/lib/actions/workouts";
import { cn } from "@/lib/utils";

interface Exercise {
    id: string;
    name: string;
    category: string;
}

interface Set {
    id: string;
    exerciseId: string;
    setNumber: number;
    reps: number;
    weight: string | number;
    isWarmup: boolean;
    exercise: Exercise;
}

interface Workout {
    id: string;
    name: string | null;
    date: Date | string;
    status: string;
    duration: number | null;
    sets: Set[];
    plan?: {
        exercises: {
            exercise: {
                category: string;
            };
        }[];
    } | null;
    _count: {
        sets: number;
    };
}

interface WorkoutCardProps {
    workout: Workout;
    categoryColors: Record<string, string>;
}

export function WorkoutCard({ workout, categoryColors }: WorkoutCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleCardClick = () => {
        router.push(`/workouts/${workout.id}`);
    };

    const handleRepeatClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        startTransition(async () => {
            try {
                const newWorkout = await duplicateWorkout(workout.id);
                router.push(`/workouts/${newWorkout.id}`);
            } catch (error) {
                console.error("Failed to duplicate workout:", error);
            }
        });
    };

    const getWorkoutCategories = (workout: Workout) => {
        let categories = workout.sets.map((s) => s.exercise.category);

        if (categories.length === 0 && workout.plan?.exercises) {
            categories = workout.plan.exercises.map((e) => e.exercise.category);
        }

        return [...new Set(categories)].slice(0, 3);
    };

    return (
        <Card
            onClick={handleCardClick}
            className="card-electric group transition-all duration-200 hover:-translate-y-1 hover:shadow-electric-sm cursor-pointer"
        >
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg group-hover:text-electric transition-colors">
                                {workout.name || "Workout Session"}
                            </h3>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-xs",
                                    workout.status === "COMPLETED"
                                        ? "border-green-500/30 bg-green-500/10 text-green-400"
                                        : workout.status === "IN_PROGRESS"
                                            ? "border-electric/30 bg-electric/10 text-electric animate-pulse"
                                            : "border-red-500/30 bg-red-500/10 text-red-400"
                                )}
                            >
                                {workout.status.replace("_", " ")}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(workout.date), "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                                <Dumbbell className="h-4 w-4" />
                                {workout._count.sets} sets
                            </span>
                            {workout.duration && (
                                <span>{workout.duration} min</span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {getWorkoutCategories(workout).map((category) => (
                                <Badge
                                    key={category}
                                    variant="outline"
                                    className={cn(
                                        "text-xs",
                                        categoryColors[category] || categoryColors.OTHER
                                    )}
                                >
                                    {category.replace("_", " ")}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-full text-muted-foreground hover:text-electric hover:bg-electric/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            onClick={handleRepeatClick}
                            disabled={isPending}
                        >
                            <Play className={cn("h-5 w-5 fill-current", isPending && "animate-pulse")} />
                        </Button>
                        <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-electric transition-colors" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

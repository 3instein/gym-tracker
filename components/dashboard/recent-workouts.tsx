"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Dumbbell, ChevronRight, Zap } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Set {
    id: string;
    reps: number;
    weight: string | number;
    exercise: {
        id: string;
        name: string;
        category: string;
    };
}

interface Workout {
    id: string;
    name: string | null;
    date: Date;
    status: string;
    duration: number | null;
    sets: Set[];
    _count: { sets: number };
}

interface RecentWorkoutsProps {
    workouts: Workout[];
    viewAllLink?: string;
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

export function RecentWorkouts({ workouts, viewAllLink = "/workouts" }: RecentWorkoutsProps) {
    // Get unique exercise categories from sets
    const getWorkoutCategories = (sets: Set[]) => {
        const categories = [...new Set(sets.map((s) => s.exercise.category))];
        return categories.slice(0, 3); // Show max 3 categories
    };

    if (workouts.length === 0) {
        return (
            <Card className="card-electric">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-electric" />
                        Recent Workouts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-electric/10 mb-4">
                            <Zap className="h-8 w-8 text-electric animate-glow" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Start your first workout and track your progress
                        </p>
                        {/* Only show start button if it's my own workouts (default link) */}
                        {viewAllLink === "/workouts" && (
                            <Button asChild className="btn-electric">
                                <Link href="/workouts/new">
                                    <Zap className="mr-2 h-4 w-4" />
                                    Start Workout
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="card-electric">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-electric" />
                    Recent Workouts
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                    <Link href={viewAllLink} className="text-electric hover:text-electric-glow">
                        View all
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                    <div className="space-y-2 p-4 pt-0">
                        {workouts.map((workout) => (
                            <Link
                                key={workout.id}
                                href={`/workouts/${workout.id}`}
                                className="block"
                            >
                                <div className="group rounded-xl border border-border/50 bg-card/50 p-4 transition-all duration-200 hover:border-electric/30 hover:bg-accent/30 hover:shadow-electric-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-foreground group-hover:text-electric transition-colors">
                                                    {workout.name || "Workout"}
                                                </h3>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-xs",
                                                        workout.status === "COMPLETED"
                                                            ? "border-green-500/30 bg-green-500/10 text-green-400"
                                                            : workout.status === "IN_PROGRESS"
                                                                ? "border-electric/30 bg-electric/10 text-electric"
                                                                : "border-red-500/30 bg-red-500/10 text-red-400"
                                                    )}
                                                >
                                                    {workout.status.replace("_", " ")}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {format(new Date(workout.date), "MMM d, yyyy")}
                                                </span>
                                                <span>
                                                    {workout._count.sets} sets
                                                </span>
                                                {workout.duration && (
                                                    <span>{workout.duration} min</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {getWorkoutCategories(workout.sets).map((category) => (
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
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-electric transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

import { auth } from "@/lib/auth";
import { getWorkouts } from "@/lib/actions/workouts";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Zap, Calendar, Dumbbell, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

export default async function WorkoutsPage() {
    const session = await auth();
    const workouts = await getWorkouts();

    // Serialize workouts for date formatting
    const serializedWorkouts = workouts.map((w) => ({
        ...w,
        sets: w.sets.map((s) => ({
            ...s,
            weight: s.weight.toString(),
        })),
    }));

    // Get unique categories from sets
    const getWorkoutCategories = (sets: typeof serializedWorkouts[0]["sets"]) => {
        const categories = [...new Set(sets.map((s) => s.exercise.category))];
        return categories.slice(0, 3);
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <Header user={session?.user} title="Workouts" />
                <main className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <History className="h-6 w-6 text-electric" />
                                <span className="text-gradient-electric">Workout History</span>
                            </h2>
                            <p className="text-muted-foreground">
                                View and manage all your workout sessions.
                            </p>
                        </div>
                        <Button asChild className="btn-electric">
                            <Link href="/workouts/new">
                                <Zap className="mr-2 h-4 w-4" />
                                New Workout
                            </Link>
                        </Button>
                    </div>

                    {/* Workouts list */}
                    {serializedWorkouts.length === 0 ? (
                        <Card className="card-electric">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-electric/10 mb-4">
                                    <Dumbbell className="h-10 w-10 text-electric animate-glow" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No workouts yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Start your first workout and track your progress
                                </p>
                                <Button asChild className="btn-electric">
                                    <Link href="/workouts/new">
                                        <Zap className="mr-2 h-4 w-4" />
                                        Start First Workout
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {serializedWorkouts.map((workout) => (
                                <Link key={workout.id} href={`/workouts/${workout.id}`}>
                                    <Card className="card-electric group transition-all duration-200 hover:-translate-y-1 hover:shadow-electric-sm">
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-2">
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
                                                <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-electric transition-colors" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

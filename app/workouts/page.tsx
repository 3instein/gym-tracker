import { auth } from "@/lib/auth";
import { getWorkouts } from "@/lib/actions/workouts";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { History, Zap, Dumbbell } from "lucide-react";
import Link from "next/link";
import { WorkoutCard } from "@/components/workouts/workout-card";

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

    // Serialize workouts for client components
    const serializedWorkouts = workouts.map((w: any) => ({
        ...w,
        sets: w.sets.map((s: any) => ({
            ...s,
            weight: s.weight.toString(),
        })),
    }));

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
                            {serializedWorkouts.map((workout: any) => (
                                <WorkoutCard
                                    key={workout.id}
                                    workout={workout}
                                    categoryColors={categoryColors}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

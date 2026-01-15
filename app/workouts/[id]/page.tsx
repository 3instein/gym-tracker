import { auth } from "@/lib/auth";
import { getWorkout } from "@/lib/actions/workouts";
import { getExercises } from "@/lib/actions/exercises";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ActiveWorkout } from "@/components/workouts/active-workout";
import { WorkoutDetail } from "@/components/workouts/workout-detail";
import { notFound } from "next/navigation";

interface WorkoutPageProps {
    params: Promise<{ id: string }>;
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
    const { id } = await params;
    const session = await auth();
    const [workout, exercises] = await Promise.all([
        getWorkout(id),
        getExercises(),
    ]);

    if (!workout) {
        notFound();
    }

    // Serialize workout for client components
    const serializedWorkout = {
        ...workout,
        sets: workout.sets.map((s) => ({
            ...s,
            weight: s.weight.toString(),
        })),
    };

    const isActive = workout.status === "IN_PROGRESS";

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <Header
                    user={session?.user}
                    title={isActive ? "Active Workout" : workout.name || "Workout Details"}
                />
                <main className="p-6">
                    {isActive ? (
                        <ActiveWorkout workout={serializedWorkout} exercises={exercises} />
                    ) : (
                        <WorkoutDetail workout={serializedWorkout} />
                    )}
                </main>
            </div>
        </div>
    );
}

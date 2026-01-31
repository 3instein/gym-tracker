import { auth } from "@/lib/auth";
import { getWorkout } from "@/lib/actions/workouts";
import { getLastSetsForUser } from "@/lib/actions/sets";
import { getExercises } from "@/lib/actions/exercises";
import { ExportWorkoutButton } from "@/components/workouts/export-workout-button";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ActiveWorkout } from "@/components/workouts/active-workout";
import { WorkoutDetail } from "@/components/workouts/workout-detail";
import { notFound } from "next/navigation";

interface WorkoutPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function WorkoutPage({ params, searchParams }: WorkoutPageProps) {
    const { id } = await params;
    const { initialExercises } = await searchParams;
    const session = await auth();
    const [workout, exercises, lastSets] = await Promise.all([
        getWorkout(id),
        getExercises(),
        getLastSetsForUser(),
    ]);

    if (!workout) {
        notFound();
    }

    // Filter initial exercises from URL param
    let initialAddedExercises: typeof exercises = [];
    if (typeof initialExercises === "string") {
        const exerciseIds = initialExercises.split(",");
        initialAddedExercises = exercises.filter((e) => exerciseIds.includes(e.id));
    }

    // Serialize workout for client components using JSON stringify/parse to ensure no Decimals remain
    const serializedWorkout = JSON.parse(JSON.stringify({
        ...workout,
        sets: workout.sets.map((s) => ({
            ...s,
            weight: s.weight.toString(),
            // Ensure no other potential decimal fields slip through
        })),
    }));

    const isActive = workout.status === "IN_PROGRESS";

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <Header
                    user={session?.user}
                    title={isActive ? "Active Workout" : workout.name || "Workout Details"}
                    actions={<ExportWorkoutButton workout={serializedWorkout} />}
                />
                <main className="p-6">
                    {isActive ? (
                        <ActiveWorkout
                            workout={serializedWorkout}
                            exercises={exercises}
                            initialAddedExercises={initialAddedExercises}
                            lastSets={lastSets}
                        />
                    ) : (
                        <WorkoutDetail workout={serializedWorkout} />
                    )}
                </main>
            </div>
        </div>
    );
}

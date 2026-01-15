import { auth } from "@/lib/auth";
import { getExercises } from "@/lib/actions/exercises";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ExerciseList } from "@/components/exercises/exercise-list";
import { ExerciseForm } from "@/components/exercises/exercise-form";
import { Dumbbell } from "lucide-react";

export default async function ExercisesPage() {
    const session = await auth();
    const exercises = await getExercises();

    return (
        <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
            <Sidebar />
            <div className="flex-1 md:ml-64 min-w-0">
                <Header user={session?.user} title="Exercises" />
                <main className="p-4 sm:p-6 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Dumbbell className="h-6 w-6 text-electric" />
                                <span className="text-gradient-electric">Exercise Library</span>
                            </h2>
                            <p className="text-muted-foreground">
                                Browse the community library or create your own custom exercises.
                            </p>
                        </div>
                        <ExerciseForm triggerClassName="w-full sm:w-auto" />
                    </div>

                    {/* Exercise list */}
                    <ExerciseList exercises={exercises} currentUserId={session?.user?.id} />
                </main>
            </div>
        </div>
    );
}

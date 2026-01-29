import { auth } from "@/lib/auth";
import { getExercises } from "@/lib/actions/exercises";
import { getWorkouts } from "@/lib/actions/workouts";
import { getPlans } from "@/lib/actions/plans";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AIAssistant } from "@/components/ai/ai-assistant";
import { Bot } from "lucide-react";

export default async function AIPage() {
    const session = await auth();

    // Fetch user data for the AI assistant
    const [exercises, workouts, plans] = await Promise.all([
        getExercises(),
        getWorkouts(10), // Get last 10 workouts
        getPlans(),
    ]);

    // Serialize data for client component (convert Decimal to number, Date to string)
    const serializedWorkouts = workouts.map((w) => ({
        id: w.id,
        name: w.name,
        date: w.date,
        sets: w.sets.map((s) => ({
            weight: Number(s.weight),
            reps: s.reps,
            exercise: {
                name: s.exercise.name,
            },
        })),
    }));

    const serializedPlans = plans.map((p) => ({
        id: p.id,
        name: p.name,
        exercises: p.exercises.map((e) => ({
            exercise: {
                name: e.exercise.name,
                category: e.exercise.category,
            },
        })),
    }));

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64 flex flex-col h-screen">
                <Header user={session?.user} title="AI Assistant" />
                <main className="p-4 md:p-6 flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0 mb-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Bot className="h-6 w-6 text-electric" />
                                <span className="text-gradient-electric">AI Assistant</span>
                            </h2>
                            <p className="text-muted-foreground">
                                Ask questions about your gym data. Click to prompt exercises, workouts, or plans.
                                <span className="block mt-1 text-xs sm:inline sm:mt-0 sm:ml-1 opacity-70">
                                    (Switch to desktop for full manual prompting)
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* AI Assistant */}
                    <div className="flex-1 min-h-0">
                        <AIAssistant
                            exercises={exercises}
                            workouts={serializedWorkouts}
                            plans={serializedPlans}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}

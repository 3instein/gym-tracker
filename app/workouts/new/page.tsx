import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { NewWorkoutForm } from "@/components/workouts/new-workout-form";

export default async function NewWorkoutPage() {
    const session = await auth();

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <Header user={session?.user} title="New Workout" />
                <main className="p-6 w-full flex items-center justify-center min-h-[calc(100vh-64px)]">
                    <NewWorkoutForm className="w-full max-w-full" />
                </main>
            </div>
        </div>
    );
}

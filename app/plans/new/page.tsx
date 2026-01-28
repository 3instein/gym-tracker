import { auth } from "@/lib/auth";
import { getExercises } from "@/lib/actions/exercises";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PlanForm } from "@/components/plans/plan-form";

export default async function NewPlanPage() {
    const session = await auth();
    const exercises = await getExercises();

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <Header user={session?.user} title="New Plan" />
                <main className="p-6">
                    <div className="max-w-2xl mx-auto">
                        <PlanForm exercises={exercises} />
                    </div>
                </main>
            </div>
        </div>
    );
}

import { auth } from "@/lib/auth";
import { getPlan } from "@/lib/actions/plans";
import { getExercises } from "@/lib/actions/exercises";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PlanForm } from "@/components/plans/plan-form";
import { notFound } from "next/navigation";

interface EditPlanPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
    const { id } = await params;
    const session = await auth();
    const [plan, exercises] = await Promise.all([
        getPlan(id),
        getExercises(),
    ]);

    if (!plan) {
        notFound();
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <Header user={session?.user} title="Edit Plan" />
                <main className="p-6">
                    <div className="max-w-2xl mx-auto">
                        <PlanForm plan={plan} exercises={exercises} />
                    </div>
                </main>
            </div>
        </div>
    );
}

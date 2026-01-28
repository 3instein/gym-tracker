import { auth } from "@/lib/auth";
import { getPlans } from "@/lib/actions/plans";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { WeeklyPlanTimeline } from "@/components/plans/weekly-plan-timeline";
import { PlanTabs } from "@/components/plans/plan-tabs";

export default async function PlansTimelinePage() {
    const session = await auth();
    const plans = await getPlans();

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 md:ml-64 flex flex-col h-full">
                <Header user={session?.user} title="Workout Plans" />
                <main className="flex-1 p-4 md:p-6 space-y-6 flex flex-col min-h-0">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <ClipboardList className="h-6 w-6 text-electric" />
                                <span className="text-gradient-electric">Workout Plans</span>
                            </h2>
                            <p className="text-muted-foreground">
                                Manage your weekly workout schedule.
                            </p>
                        </div>
                        <Button asChild className="btn-electric cursor-pointer">
                            <Link href="/plans/new">
                                <Plus className="mr-2 h-4 w-4" />
                                New Plan
                            </Link>
                        </Button>
                    </div>

                    <div className="shrink-0">
                        <PlanTabs />
                    </div>

                    {/* Weekly Timeline */}
                    <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
                        <WeeklyPlanTimeline plans={plans} />
                    </div>
                </main>
            </div>
        </div>
    );
}

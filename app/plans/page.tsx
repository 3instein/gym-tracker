import { auth } from "@/lib/auth";
import { getPlans } from "@/lib/actions/plans";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { PlanCard } from "@/components/plans/plan-card";
import { WeeklyPlanTimeline } from "@/components/plans/weekly-plan-timeline";

export default async function PlansPage() {
    const session = await auth();
    const plans = await getPlans();

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <Header user={session?.user} title="Workout Plans" />
                <main className="p-4 md:p-6 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <ClipboardList className="h-6 w-6 text-electric" />
                                <span className="text-gradient-electric">Workout Plans</span>
                            </h2>
                            <p className="text-muted-foreground">
                                Create and manage reusable workout templates.
                            </p>
                        </div>
                        <Button asChild className="btn-electric cursor-pointer">
                            <Link href="/plans/new">
                                <Plus className="mr-2 h-4 w-4" />
                                New Plan
                            </Link>
                        </Button>
                    </div>

                    {/* Weekly Timeline */}
                    {plans.length > 0 && <WeeklyPlanTimeline plans={plans} />}

                    {/* Plans list */}
                    {plans.length === 0 ? (
                        <Card className="card-electric">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-electric/10 mb-4">
                                    <ClipboardList className="h-10 w-10 text-electric animate-glow" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No plans yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Create your first workout plan template to get started
                                </p>
                                <Button asChild className="btn-electric cursor-pointer">
                                    <Link href="/plans/new">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create First Plan
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {plans.map((plan) => (
                                <PlanCard key={plan.id} plan={plan} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

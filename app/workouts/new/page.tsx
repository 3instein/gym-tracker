import { auth } from "@/lib/auth";
import { getPlans } from "@/lib/actions/plans";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { NewWorkoutForm } from "@/components/workouts/new-workout-form";
import { UsePlanDialog } from "@/components/plans/use-plan-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Zap } from "lucide-react";
import Link from "next/link";

export default async function NewWorkoutPage() {
    const session = await auth();
    const plans = await getPlans();

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <Header user={session?.user} title="New Workout" />
                <main className="p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Start from Plan option */}
                        {plans.length > 0 && (
                            <Card className="card-electric">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/10">
                                            <ClipboardList className="h-5 w-5 text-electric" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Start from Plan</CardTitle>
                                            <CardDescription>
                                                Use a saved workout plan as your template
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <UsePlanDialog plans={plans}>
                                        <Button className="btn-electric cursor-pointer">
                                            <Zap className="mr-2 h-4 w-4" />
                                            Choose a Plan
                                        </Button>
                                    </UsePlanDialog>
                                </CardContent>
                            </Card>
                        )}

                        {/* Divider when plans exist */}
                        {plans.length > 0 && (
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-sm text-muted-foreground px-2">or</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>
                        )}

                        {/* Regular new workout form */}
                        <NewWorkoutForm className="max-w-lg mx-auto" />

                        {/* Link to create plans if none exist */}
                        {plans.length === 0 && (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Want to save time? Create a workout plan template.
                                </p>
                                <Button variant="link" asChild className="cursor-pointer">
                                    <Link href="/plans/new">
                                        <ClipboardList className="mr-2 h-4 w-4" />
                                        Create a Plan
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

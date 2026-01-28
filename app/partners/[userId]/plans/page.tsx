import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPlans } from "@/lib/actions/plans";
import { checkPartnerAccess } from "@/lib/actions/partners";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PartnerPlanCard } from "./partner-plan-card";

export default async function PartnerPlansPage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const hasAccess = await checkPartnerAccess(userId);
    if (!hasAccess) {
        redirect("/partners");
    }

    const partnerUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!partnerUser) {
        notFound();
    }

    const plans = await getPlans(userId);

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <Header user={session.user} title={`${partnerUser.name}'s Plans`} />
                <main className="p-4 md:p-6 space-y-6">
                    {/* Back button and header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/partners/${userId}`}>
                                <Button variant="ghost" size="icon" className="cursor-pointer">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <ClipboardList className="h-6 w-6 text-electric" />
                                    <span className="text-gradient-electric">Workout Plans</span>
                                </h2>
                                <p className="text-muted-foreground">
                                    Manage {partnerUser.name}&apos;s workout plan templates.
                                </p>
                            </div>
                        </div>
                        <Button asChild className="btn-electric cursor-pointer">
                            <Link href={`/partners/${userId}/plans/new`}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Plan
                            </Link>
                        </Button>
                    </div>

                    {/* Plans list */}
                    {plans.length === 0 ? (
                        <Card className="card-electric">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-electric/10 mb-4">
                                    <ClipboardList className="h-10 w-10 text-electric animate-glow" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No plans yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Create a workout plan for {partnerUser.name}
                                </p>
                                <Button asChild className="btn-electric cursor-pointer">
                                    <Link href={`/partners/${userId}/plans/new`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create First Plan
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {plans.map((plan) => (
                                <PartnerPlanCard
                                    key={plan.id}
                                    plan={plan}
                                    userId={userId}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPlans } from "@/lib/actions/plans";
import { checkPartnerAccess } from "@/lib/actions/partners";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { WeeklyPlanTimeline } from "@/components/plans/weekly-plan-timeline";
import { PlanTabs } from "@/components/plans/plan-tabs";

export default async function PartnerPlansTimelinePage({
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
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 md:ml-64 flex flex-col h-full">
                <Header user={session.user} title={`${partnerUser.name}'s Plans`} />
                <main className="flex-1 p-4 md:p-6 space-y-6 flex flex-col min-h-0 overflow-hidden">
                    {/* Back button and header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
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
                                    Manage {partnerUser.name}&apos;s weekly workout schedule.
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

                    <div className="shrink-0">
                        <PlanTabs partnerId={userId} />
                    </div>

                    {/* Weekly Timeline */}
                    <div className="flex-1 min-h-0 min-w-0">
                        <WeeklyPlanTimeline plans={plans} partnerId={userId} />
                    </div>
                </main>
            </div>
        </div>
    );
}

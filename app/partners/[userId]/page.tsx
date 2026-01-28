import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getWorkoutStats, getWorkouts } from "@/lib/actions/workouts";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentWorkouts } from "@/components/dashboard/recent-workouts";
import { checkPartnerAccess } from "@/lib/actions/partners";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History, Dumbbell, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";

import { Sidebar } from "@/components/layout/sidebar";

export default async function PartnerDashboardPage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Explicit check for access to handle redirects/errors gracefully
    const hasAccess = await checkPartnerAccess(userId);
    if (!hasAccess) {
        redirect("/partners");
    }

    // Fetch user details for header
    const partnerUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!partnerUser) {
        notFound();
    }

    const [stats, workouts] = await Promise.all([
        getWorkoutStats(userId),
        getWorkouts(5, userId),
    ]);

    // Serialize workouts
    type WorkoutWithSets = Awaited<ReturnType<typeof getWorkouts>>[number];
    const serializedWorkouts = workouts.map((w: WorkoutWithSets) => ({
        ...w,
        sets: w.sets.map((s) => ({
            ...s,
            weight: s.weight.toString(),
        })),
    }));

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <Header user={session.user} title={`Viewing ${partnerUser.name}'s Dashboard`} />
                <main className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href="/partners">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-gradient-electric">
                                {partnerUser.name}&apos;s Progress
                            </h2>
                            <p className="text-muted-foreground">
                                Analyzing stats and recent activity.
                            </p>
                        </div>
                    </div>

                    <StatsCards stats={stats} />

                    <div className="grid gap-6 md:grid-cols-3">
                        <Link href={`/partners/${userId}/workouts`} className="block">
                            <div className="rounded-xl border border-border/50 bg-card p-6 transition-all hover:bg-accent/50 hover:shadow-electric-sm group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-10 w-10 rounded-lg bg-electric/10 flex items-center justify-center text-electric">
                                        <History className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground group-hover:text-electric transition-colors">View All</span>
                                </div>
                                <h3 className="font-semibold text-lg mb-1">Workout History</h3>
                                <p className="text-sm text-muted-foreground">View detailed logs of every session.</p>
                            </div>
                        </Link>

                        <Link href={`/partners/${userId}/exercises`} className="block">
                            <div className="rounded-xl border border-border/50 bg-card p-6 transition-all hover:bg-accent/50 hover:shadow-electric-sm group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <Dumbbell className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground group-hover:text-blue-500 transition-colors">View All</span>
                                </div>
                                <h3 className="font-semibold text-lg mb-1">Exercise Stats</h3>
                                <p className="text-sm text-muted-foreground">Analyze max lifts and volume per exercise.</p>
                            </div>
                        </Link>

                        <Link href={`/partners/${userId}/plans`} className="block">
                            <div className="rounded-xl border border-border/50 bg-card p-6 transition-all hover:bg-accent/50 hover:shadow-electric-sm group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                                        <ClipboardList className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground group-hover:text-purple-500 transition-colors">View All</span>
                                </div>
                                <h3 className="font-semibold text-lg mb-1">Workout Plans</h3>
                                <p className="text-sm text-muted-foreground">Create and manage workout templates.</p>
                            </div>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Recent Activity</h3>
                        <RecentWorkouts workouts={serializedWorkouts} viewAllLink={`/partners/${userId}/workouts`} />
                    </div>
                </main>
            </div>
        </div>
    );
}

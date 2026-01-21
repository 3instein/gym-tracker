import { auth } from "@/lib/auth";
import { getWorkouts } from "@/lib/actions/workouts";
import { checkPartnerAccess } from "@/lib/actions/partners";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { History, Dumbbell, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { WorkoutCard } from "@/components/workouts/workout-card";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const categoryColors: Record<string, string> = {
    CHEST: "bg-red-500/20 text-red-400 border-red-500/30",
    BACK: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    SHOULDERS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    BICEPS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    TRICEPS: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    LEGS: "bg-green-500/20 text-green-400 border-green-500/30",
    CORE: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    CARDIO: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    FULL_BODY: "bg-electric/20 text-electric border-electric/30",
    OTHER: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default async function PartnerWorkoutsPage({
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

    const workouts = await getWorkouts(undefined, userId);

    // Serialize workouts for client components
    const serializedWorkouts = workouts.map((w: any) => ({
        ...w,
        sets: w.sets.map((s: any) => ({
            ...s,
            weight: s.weight.toString(),
        })),
    }));

    return (
        <div className="flex min-h-screen bg-background">
            <div className="flex-1 md:ml-64">
                <Header user={session.user} title={`${partnerUser.name}'s Workouts`} />
                <main className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Link href={`/partners/${userId}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <History className="h-6 w-6 text-electric" />
                                <span className="text-gradient-electric">Workout History</span>
                            </h2>
                            <p className="text-muted-foreground">
                                Viewing all workout sessions for {partnerUser.name}.
                            </p>
                        </div>
                    </div>

                    {/* Workouts list */}
                    {serializedWorkouts.length === 0 ? (
                        <Card className="card-electric">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-electric/10 mb-4">
                                    <Dumbbell className="h-10 w-10 text-electric animate-glow" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No workouts yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    {partnerUser.name} hasn&apos;t logged any workouts yet.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {serializedWorkouts.map((workout: any) => (
                                <WorkoutCard
                                    key={workout.id}
                                    workout={workout}
                                    categoryColors={categoryColors}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

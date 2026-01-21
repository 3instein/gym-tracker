import { auth } from "@/lib/auth";
import { getExercises } from "@/lib/actions/exercises";
import { checkPartnerAccess } from "@/lib/actions/partners";
import { Header } from "@/components/layout/header";
import { ExerciseList } from "@/components/exercises/exercise-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell } from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PartnerExercisesPage({
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

    // Fetch exercises with stats for the partner
    const exercises = await getExercises(userId);

    return (
        <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
            <div className="flex-1 md:ml-64 min-w-0">
                <Header user={session.user} title={`${partnerUser.name}'s Exercises`} />
                <main className="p-4 sm:p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Link href={`/partners/${userId}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Dumbbell className="h-6 w-6 text-electric" />
                                <span className="text-gradient-electric">Exercise Stats</span>
                            </h2>
                            <p className="text-muted-foreground">
                                Analyzing performance for {partnerUser.name}.
                            </p>
                        </div>
                    </div>

                    {/* Exercise list */}
                    {/* passing currentUserId as the viewer's ID, though mostly used for deletion logic which should be disabled if not owner */}
                    <ExerciseList exercises={exercises} currentUserId={session.user.id} />
                </main>
            </div>
        </div>
    );
}

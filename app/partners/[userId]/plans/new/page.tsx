import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getExercises } from "@/lib/actions/exercises";
import { checkPartnerAccess } from "@/lib/actions/partners";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { prisma } from "@/lib/prisma";
import { PartnerPlanForm } from "./partner-plan-form";

export default async function NewPartnerPlanPage({
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

    const exercises = await getExercises();

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <Header user={session.user} title={`New Plan for ${partnerUser.name}`} />
                <main className="p-6">
                    <div className="max-w-2xl mx-auto">
                        <PartnerPlanForm
                            exercises={exercises}
                            userId={userId}
                            partnerName={partnerUser.name || "Partner"}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}

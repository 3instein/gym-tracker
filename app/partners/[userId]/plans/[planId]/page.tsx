import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPlan } from "@/lib/actions/plans";
import { getExercises } from "@/lib/actions/exercises";
import { checkPartnerAccess } from "@/lib/actions/partners";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { prisma } from "@/lib/prisma";
import { PartnerPlanForm } from "../new/partner-plan-form";

export default async function EditPartnerPlanPage({
    params,
}: {
    params: Promise<{ userId: string; planId: string }>;
}) {
    const { userId, planId } = await params;
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

    const [plan, exercises] = await Promise.all([
        getPlan(planId, userId),
        getExercises(),
    ]);

    if (!plan) {
        notFound();
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <Header user={session.user} title={`Edit ${plan.name}`} />
                <main className="p-6">
                    <div className="max-w-2xl mx-auto">
                        <PartnerPlanForm
                            plan={plan}
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

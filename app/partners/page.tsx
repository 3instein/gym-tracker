import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PartnersContent } from "./partners-content";
import { redirect } from "next/navigation";

export default async function PartnersPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <Header user={session.user} title="Partners" />
                <main className="p-6 space-y-6">
                    <PartnersContent />
                </main>
            </div>
        </div>
    );
}

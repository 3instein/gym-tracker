import { Sidebar } from "@/components/layout/sidebar";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";

export default function Loading() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <div className="sticky top-0 z-30 flex h-16 items-center border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl">
                    <div className="h-5 w-24 animate-pulse rounded bg-muted/50" />
                </div>
                <main className="p-6">
                    <DashboardSkeleton />
                </main>
            </div>
        </div>
    );
}

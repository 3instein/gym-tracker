"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutList, CalendarDays } from "lucide-react";

interface PlanTabsProps {
    partnerId?: string;
}

export function PlanTabs({ partnerId }: PlanTabsProps) {
    const pathname = usePathname();

    const baseUrl = partnerId ? `/partners/${partnerId}/plans` : "/plans";
    const timelineUrl = `${baseUrl}/timeline`;

    const isTimelineContext = pathname?.endsWith("/timeline");

    return (
        <div className="flex items-center gap-2 mb-6 bg-muted/50 p-1 rounded-lg w-fit">
            <Link
                href={baseUrl}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    !isTimelineContext
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
            >
                <LayoutList className="h-4 w-4" />
                List
            </Link>
            <Link
                href={timelineUrl}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    isTimelineContext
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
            >
                <CalendarDays className="h-4 w-4" />
                Timeline
            </Link>
        </div>
    );
}

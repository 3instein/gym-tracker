"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Dumbbell, Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
    stats: {
        totalWorkouts: number;
        thisWeekWorkouts: number;
        totalSets: number;
    };
}

export function StatsCards({ stats }: StatsCardsProps) {
    const cards = [
        {
            title: "Total Workouts",
            value: stats.totalWorkouts,
            icon: Dumbbell,
            description: "All time",
            color: "electric",
        },
        {
            title: "This Week",
            value: stats.thisWeekWorkouts,
            icon: Flame,
            description: "Workouts completed",
            color: "thunder",
        },
        {
            title: "Total Sets",
            value: stats.totalSets,
            icon: TrendingUp,
            description: "Logged",
            color: "electric-glow",
        },
        {
            title: "Streak",
            value: stats.thisWeekWorkouts > 0 ? "🔥" : "—",
            icon: Zap,
            description: stats.thisWeekWorkouts > 0 ? "Keep it up!" : "Start today",
            color: "electric",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <Card
                        key={card.title}
                        className="stats-card overflow-hidden transition-all duration-300 hover:shadow-electric-sm hover:-translate-y-1"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <div
                                className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-lg",
                                    card.color === "electric" && "bg-electric/10",
                                    card.color === "thunder" && "bg-thunder/10",
                                    card.color === "electric-glow" && "bg-[#00d4ff]/10"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "h-5 w-5",
                                        card.color === "electric" && "text-electric",
                                        card.color === "thunder" && "text-thunder",
                                        card.color === "electric-glow" && "text-[#00d4ff]"
                                    )}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gradient-electric">
                                {card.value}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

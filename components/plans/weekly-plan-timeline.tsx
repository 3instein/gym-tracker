"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Day } from "@prisma/client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Dumbbell, CalendarDays } from "lucide-react";

interface Exercise {
    exercise: {
        category: string;
    };
}

interface Plan {
    id: string;
    name: string;
    day: Day | null;
    exercises: Exercise[];
    _count: { exercises: number };
}

interface WeeklyPlanTimelineProps {
    plans: Plan[];
    partnerId?: string;
}

const daysOfWeek: Day[] = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];

const dayLabels: Record<Day, string> = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
};

const categoryColors: Record<string, string> = {
    CHEST: "bg-red-500/20 text-red-400",
    BACK: "bg-blue-500/20 text-blue-400",
    SHOULDERS: "bg-yellow-500/20 text-yellow-400",
    BICEPS: "bg-purple-500/20 text-purple-400",
    TRICEPS: "bg-pink-500/20 text-pink-400",
    LEGS: "bg-green-500/20 text-green-400",
    CORE: "bg-orange-500/20 text-orange-400",
    CARDIO: "bg-cyan-500/20 text-cyan-400",
    FULL_BODY: "bg-electric/20 text-electric",
    OTHER: "bg-gray-500/20 text-gray-400",
};

export function WeeklyPlanTimeline({ plans, partnerId }: WeeklyPlanTimelineProps) {
    // Group plans by day
    const plansByDay = plans.reduce((acc, plan) => {
        if (plan.day) {
            if (!acc[plan.day]) {
                acc[plan.day] = [];
            }
            acc[plan.day].push(plan);
        }
        return acc;
    }, {} as Record<Day, Plan[]>);

    return (
        <Card className="card-electric mb-8">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-electric" />
                    <span className="text-gradient-electric">Weekly Schedule</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3 md:gap-4">
                    {daysOfWeek.map((day) => {
                        const dayPlans = plansByDay[day] || [];
                        const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase() === day;

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "flex flex-col gap-2 p-3 rounded-lg border min-h-[160px] transition-colors",
                                    isToday
                                        ? "bg-electric/10 border-electric/30"
                                        : "bg-card border-border/50 hover:border-electric/20"
                                )}
                            >
                                <span className={cn(
                                    "text-sm font-semibold uppercase tracking-wider mb-1",
                                    isToday ? "text-electric" : "text-muted-foreground"
                                )}>
                                    {dayLabels[day]}
                                </span>

                                <div className="flex-1 flex flex-col gap-2">
                                    {dayPlans.length > 0 ? (
                                        dayPlans.map((plan) => {
                                            // Extract unique categories (limit to 2-3 to avoid clutter)
                                            const uniqueCategories = Array.from(
                                                new Set(plan.exercises.map(e => e.exercise.category))
                                            ).slice(0, 3);

                                            return (
                                                <Link
                                                    key={plan.id}
                                                    href={partnerId ? `/partners/${partnerId}/plans/${plan.id}` : `/plans/${plan.id}`}
                                                    className="block group"
                                                >
                                                    <div className="bg-background rounded-md border border-border/50 p-2.5 hover:border-electric/50 transition-colors shadow-sm h-full flex flex-col">
                                                        <p className="font-semibold text-sm truncate group-hover:text-electric transition-colors mb-2">
                                                            {plan.name}
                                                        </p>

                                                        {/* Categories */}
                                                        <div className="flex flex-wrap gap-1 mb-2">
                                                            {uniqueCategories.map(cat => (
                                                                <div
                                                                    key={cat}
                                                                    className={cn(
                                                                        "w-1.5 h-1.5 rounded-full",
                                                                        categoryColors[cat] ? categoryColors[cat].split(" ")[0] : "bg-gray-500/50"
                                                                    )}
                                                                    title={cat}
                                                                />
                                                            ))}
                                                        </div>

                                                        <div className="flex items-center gap-1.5 mt-auto text-muted-foreground">
                                                            <Dumbbell className="h-3 w-3" />
                                                            <span className="text-xs">
                                                                {plan._count.exercises} exercises
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center opacity-30">
                                            <span className="text-xs font-medium uppercase tracking-wide">
                                                Rest
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

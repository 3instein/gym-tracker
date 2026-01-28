"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Day } from "@prisma/client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Dumbbell, CalendarDays } from "lucide-react";

interface Plan {
    id: string;
    name: string;
    day: Day | null;
    exercises: { id: string }[];
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
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 md:gap-4">
                    {daysOfWeek.map((day) => {
                        const dayPlans = plansByDay[day] || [];
                        const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase() === day;

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "flex flex-col gap-2 p-2 rounded-lg border min-h-[100px] transition-colors",
                                    isToday
                                        ? "bg-electric/10 border-electric/30"
                                        : "bg-card border-border/50 hover:border-electric/20"
                                )}
                            >
                                <span className={cn(
                                    "text-xs font-semibold uppercase tracking-wider",
                                    isToday ? "text-electric" : "text-muted-foreground"
                                )}>
                                    {dayLabels[day]}
                                </span>

                                <div className="flex-1 flex flex-col gap-1.5">
                                    {dayPlans.length > 0 ? (
                                        dayPlans.map((plan) => (
                                            <Link
                                                key={plan.id}
                                                href={partnerId ? `/partners/${partnerId}/plans/${plan.id}` : `/plans/${plan.id}`}
                                                className="block group"
                                            >
                                                <div className="bg-background rounded border border-border/50 p-1.5 hover:border-electric/50 transition-colors shadow-sm">
                                                    <p className="text-xs font-medium truncate group-hover:text-electric transition-colors">
                                                        {plan.name}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Dumbbell className="h-3 w-3 text-muted-foreground/70" />
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {plan._count.exercises}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center">
                                            <span className="text-[10px] text-muted-foreground/30 font-medium">
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

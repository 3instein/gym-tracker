"use client";

import { Day } from "@prisma/client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Dumbbell, CalendarDays } from "lucide-react";

interface Exercise {
    exercise: {
        name: string;
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
        <div className="flex flex-col h-[75vh] min-h-[500px] w-full">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 shrink-0">
                <CalendarDays className="h-5 w-5 text-electric" />
                <span className="text-lg font-semibold text-gradient-electric">Weekly Schedule</span>
            </div>

            {/* Full height grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 flex-1 h-full min-h-0">
                {daysOfWeek.map((day) => {
                    const dayPlans = plansByDay[day] || [];
                    const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase() === day;

                    return (
                        <div
                            key={day}
                            className={cn(
                                "flex flex-col rounded-xl border transition-colors h-full overflow-hidden",
                                isToday
                                    ? "bg-electric/5 border-electric/30 shadow-[0_0_15px_-3px_rgba(var(--electric-rgb),0.15)]"
                                    : "bg-card/50 border-border/40 hover:border-electric/10"
                            )}
                        >
                            {/* Day Header */}
                            <div className={cn(
                                "p-3 border-b flex items-center justify-between shrink-0",
                                isToday ? "border-electric/20 bg-electric/10" : "border-border/40 bg-muted/20"
                            )}>
                                <span className={cn(
                                    "text-sm font-bold uppercase tracking-wider",
                                    isToday ? "text-electric" : "text-muted-foreground"
                                )}>
                                    {dayLabels[day]}
                                </span>
                                {isToday && (
                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-electric text-background">
                                        Today
                                    </span>
                                )}
                            </div>

                            {/* Plans Container */}
                            <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
                                {dayPlans.length > 0 ? (
                                    dayPlans.map((plan) => {
                                        // Extract unique categories for dots
                                        const uniqueCategories = Array.from(
                                            new Set(plan.exercises.map(e => e.exercise.category))
                                        ).slice(0, 5);

                                        return (
                                            <Link
                                                key={plan.id}
                                                href={partnerId ? `/partners/${partnerId}/plans/${plan.id}` : `/plans/${plan.id}`}
                                                className="block group"
                                            >
                                                <div className="bg-background rounded-lg border border-border/60 p-3 hover:border-electric/60 hover:shadow-md hover:shadow-electric/5 transition-all duration-300">
                                                    {/* Plan Name & Categories */}
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <p className="font-semibold text-sm truncate text-foreground group-hover:text-electric transition-colors">
                                                            {plan.name}
                                                        </p>
                                                        <div className="flex shrink-0 -space-x-1">
                                                            {uniqueCategories.map(cat => (
                                                                <div
                                                                    key={cat}
                                                                    className={cn(
                                                                        "w-2 h-2 rounded-full ring-1 ring-background",
                                                                        categoryColors[cat] ? categoryColors[cat].split(" ")[0] : "bg-gray-500"
                                                                    )}
                                                                    title={cat}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Exercise List Preview */}
                                                    <div className="space-y-1 mb-2">
                                                        {plan.exercises.slice(0, 4).map((ex, idx) => (
                                                            <div key={idx} className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5">
                                                                <div className={cn(
                                                                    "w-1 h-1 rounded-full opacity-50",
                                                                    categoryColors[ex.exercise.category] ? categoryColors[ex.exercise.category].split(" ")[0] : "bg-gray-400"
                                                                )} />
                                                                {ex.exercise.name}
                                                            </div>
                                                        ))}
                                                        {plan.exercises.length > 4 && (
                                                            <div className="text-[10px] text-muted-foreground/60 pl-2.5">
                                                                + {plan.exercises.length - 4} more
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="flex items-center gap-1.5 pt-2 border-t border-border/30 mt-1">
                                                        <Dumbbell className="h-3 w-3 text-electric/70" />
                                                        <span className="text-[10px] text-muted-foreground font-medium">
                                                            {plan._count.exercises} exercises
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 hover:opacity-40 transition-opacity min-h-[100px]">
                                        <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mb-1">
                                            <span className="text-xs font-bold">R</span>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            Rest Day
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

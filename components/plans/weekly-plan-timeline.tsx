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
    MONDAY: "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday",
    SATURDAY: "Saturday",
    SUNDAY: "Sunday",
};

const categoryColors: Record<string, string> = {
    CHEST: "bg-red-500/10 text-red-500 border-red-200",
    BACK: "bg-blue-500/10 text-blue-500 border-blue-200",
    SHOULDERS: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    BICEPS: "bg-purple-500/10 text-purple-500 border-purple-200",
    TRICEPS: "bg-pink-500/10 text-pink-500 border-pink-200",
    LEGS: "bg-green-500/10 text-green-500 border-green-200",
    CORE: "bg-orange-500/10 text-orange-500 border-orange-200",
    CARDIO: "bg-cyan-500/10 text-cyan-500 border-cyan-200",
    FULL_BODY: "bg-electric/10 text-electric border-electric/20",
    OTHER: "bg-gray-500/10 text-gray-500 border-gray-200",
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
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 shrink-0">
                <CalendarDays className="h-5 w-5 text-electric" />
                <span className="text-lg font-semibold text-gradient-electric">Weekly Schedule</span>
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden border rounded-xl bg-background/50 backdrop-blur-sm">
                <div className="flex h-full min-w-[1800px]">
                    {daysOfWeek.map((day, index) => {
                        const dayPlans = plansByDay[day] || [];
                        const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase() === day;
                        const isLast = index === daysOfWeek.length - 1;

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "flex-1 flex flex-col h-full min-w-[250px] transition-colors",
                                    !isLast && "border-r",
                                    isToday
                                        ? "bg-electric/5"
                                        : "hover:bg-muted/10"
                                )}
                            >
                                {/* Day Header */}
                                <div className={cn(
                                    "p-3 border-b flex items-center justify-between shrink-0 sticky top-0 bg-background/80 backdrop-blur z-10",
                                    isToday ? "border-electric/20 bg-electric/10" : "border-border/40"
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
                                <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                                    {dayPlans.length > 0 ? (
                                        dayPlans.map((plan) => {
                                            const uniqueCategories = Array.from(
                                                new Set(plan.exercises.map(e => e.exercise.category))
                                            ).slice(0, 3); // Limit categories badges to 3 to prevent overflow

                                            return (
                                                <Link
                                                    key={plan.id}
                                                    href={partnerId ? `/partners/${partnerId}/plans/${plan.id}` : `/plans/${plan.id}`}
                                                    className="block group"
                                                >
                                                    <div className="bg-background rounded-lg border border-border/60 p-3 hover:border-electric/60 hover:shadow-md hover:shadow-electric/5 transition-all duration-300 h-full flex flex-col">
                                                        {/* Plan Name */}
                                                        <div className="flex items-start justify-between gap-2 mb-3">
                                                            <p className="font-semibold text-base text-foreground group-hover:text-electric transition-colors">
                                                                {plan.name}
                                                            </p>
                                                        </div>

                                                        {/* Category Badges */}
                                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                                            {uniqueCategories.map(cat => (
                                                                <div
                                                                    key={cat}
                                                                    className={cn(
                                                                        "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                                                                        categoryColors[cat] || "bg-gray-100 text-gray-600 border-gray-200"
                                                                    )}
                                                                >
                                                                    {cat}
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Exercise List (Full) */}
                                                        <div className="space-y-1.5 mb-3 flex-1">
                                                            {plan.exercises.map((ex, idx) => (
                                                                <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                                                                    <div className={cn(
                                                                        "w-1.5 h-1.5 rounded-full shrink-0",
                                                                        categoryColors[ex.exercise.category] ? categoryColors[ex.exercise.category].split(" ")[0].replace("/10", "/50") : "bg-gray-400"
                                                                    )} />
                                                                    <span className="truncate">{ex.exercise.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Footer */}
                                                        <div className="flex items-center gap-1.5 pt-2 border-t border-border/30 mt-auto">
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
                                        <div className="h-full flex flex-col items-center justify-center opacity-20 min-h-[150px]">
                                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
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
        </div>
    );
}

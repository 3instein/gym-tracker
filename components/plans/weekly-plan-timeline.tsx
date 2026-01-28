"use client";

import { useState, useEffect } from "react";
import { Day } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Dumbbell, CalendarDays } from "lucide-react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    useDraggable,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { updatePlan } from "@/lib/actions/plans";
import { toast } from "sonner";

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

// Draggable Plan Card Component
function DraggablePlanCard({ plan, partnerId }: { plan: Plan; partnerId?: string }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: plan.id,
        data: { plan },
    });

    const uniqueCategories = Array.from(
        new Set(plan.exercises.map(e => e.exercise.category))
    ).slice(0, 3);

    const handleClick = () => {
        // Only navigate if not dragging
        if (!isDragging) {
            window.location.href = partnerId ? `/partners/${partnerId}/plans/${plan.id}` : `/plans/${plan.id}`;
        }
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={handleClick}
            className={cn(
                "cursor-grab active:cursor-grabbing",
                isDragging && "opacity-50"
            )}
        >
            <PlanCardContent plan={plan} uniqueCategories={uniqueCategories} />
        </div>
    );
}

// Plan Card Content (shared between normal and overlay)
function PlanCardContent({ plan, uniqueCategories }: { plan: Plan; uniqueCategories: string[] }) {
    return (
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
    );
}

// Droppable Day Column Component
function DroppableDayColumn({
    day,
    children,
    isToday,
    isLast
}: {
    day: Day;
    children: React.ReactNode;
    isToday: boolean;
    isLast: boolean;
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: day,
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col h-full flex-1 min-w-[200px] transition-all duration-200",
                !isLast && "border-r",
                isToday
                    ? "bg-electric/5"
                    : "hover:bg-muted/10",
                isOver && "bg-electric/10 ring-2 ring-electric/50 ring-inset"
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
                {children}
            </div>
        </div>
    );
}

export function WeeklyPlanTimeline({ plans: initialPlans, partnerId }: WeeklyPlanTimelineProps) {
    const [activePlan, setActivePlan] = useState<Plan | null>(null);
    const [localPlans, setLocalPlans] = useState<Plan[]>(initialPlans);

    // Keep local plans in sync with server data when props change
    useEffect(() => {
        setLocalPlans(initialPlans);
    }, [initialPlans]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement required before drag starts
            },
        })
    );

    // Group plans by day using local state for optimistic updates
    const plansByDay = localPlans.reduce((acc, plan) => {
        if (plan.day) {
            if (!acc[plan.day]) {
                acc[plan.day] = [];
            }
            acc[plan.day].push(plan);
        }
        return acc;
    }, {} as Record<Day, Plan[]>);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const plan = active.data.current?.plan as Plan | undefined;
        if (plan) {
            setActivePlan(plan);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActivePlan(null);

        if (!over) return;

        const planId = active.id as string;
        const newDay = over.id as Day;

        // Find the plan that was dragged
        const draggedPlan = localPlans.find(p => p.id === planId);
        if (!draggedPlan) return;

        // If dropped on the same day, do nothing
        if (draggedPlan.day === newDay) return;

        const oldDay = draggedPlan.day;

        // Optimistic update - immediately move the plan in local state
        setLocalPlans(prev =>
            prev.map(p => p.id === planId ? { ...p, day: newDay } : p)
        );

        try {
            await updatePlan({ id: planId, day: newDay }, partnerId);
            toast.success(`Moved "${draggedPlan.name}" to ${dayLabels[newDay]}`);
        } catch (error) {
            // Revert on error
            setLocalPlans(prev =>
                prev.map(p => p.id === planId ? { ...p, day: oldDay } : p)
            );
            console.error("Failed to update plan day:", error);
            toast.error("Failed to move plan");
        }
    };

    const activeCategories = activePlan ? Array.from(
        new Set(activePlan.exercises.map(e => e.exercise.category))
    ).slice(0, 3) : [];

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="h-full w-full flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4 shrink-0">
                    <CalendarDays className="h-5 w-5 text-electric" />
                    <span className="text-lg font-semibold text-gradient-electric">Weekly Schedule</span>
                    <span className="text-xs text-muted-foreground ml-2">(drag plans to change day)</span>
                </div>

                {/* Scroll wrapper using relative/absolute pattern */}
                <div className="flex-1 min-h-0 relative">
                    <div className="absolute inset-0 overflow-x-auto overflow-y-auto border rounded-xl bg-background/50 backdrop-blur-sm">
                        <div className="flex h-full min-w-full">
                            {daysOfWeek.map((day, index) => {
                                const dayPlans = plansByDay[day] || [];
                                const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase() === day;
                                const isLast = index === daysOfWeek.length - 1;

                                return (
                                    <DroppableDayColumn
                                        key={day}
                                        day={day}
                                        isToday={isToday}
                                        isLast={isLast}
                                    >
                                        {dayPlans.length > 0 ? (
                                            dayPlans.map((plan) => (
                                                <DraggablePlanCard
                                                    key={plan.id}
                                                    plan={plan}
                                                    partnerId={partnerId}
                                                />
                                            ))
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center opacity-20 min-h-[150px]">
                                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                    Rest Day
                                                </span>
                                            </div>
                                        )}
                                    </DroppableDayColumn>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Drag Overlay - at root level for proper positioning */}
            <DragOverlay dropAnimation={null}>
                {activePlan && (
                    <div className="w-[200px] shadow-2xl pointer-events-none">
                        <PlanCardContent
                            plan={activePlan}
                            uniqueCategories={activeCategories}
                        />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}

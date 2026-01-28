"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, Loader2, Zap, Dumbbell } from "lucide-react";
import { startWorkoutFromPlan } from "@/lib/actions/plans";
import { toast } from "sonner";

interface Exercise {
    id: string;
    name: string;
    category: string;
}

interface PlanExercise {
    id: string;
    order: number;
    exercise: Exercise;
}

interface Plan {
    id: string;
    name: string;
    description: string | null;
    exercises: PlanExercise[];
    _count: { exercises: number };
}

interface UsePlanDialogProps {
    plans: Plan[];
    children?: React.ReactNode;
}

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

export function UsePlanDialog({ plans, children }: UsePlanDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    const handleSelectPlan = (planId: string) => {
        setSelectedPlanId(planId);
        startTransition(async () => {
            try {
                const result = await startWorkoutFromPlan(planId);
                setOpen(false);
                router.push(`/workouts/${result.workout.id}`);
                toast.success("Workout started from plan!");
            } catch (error) {
                console.error("Failed to start workout:", error);
                toast.error("Failed to start workout");
                setSelectedPlanId(null);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" className="cursor-pointer">
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Start from Plan
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-electric" />
                        Select a Plan
                    </DialogTitle>
                </DialogHeader>

                {plans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                            <ClipboardList className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground mb-4">
                            You haven&apos;t created any plans yet
                        </p>
                        <Button
                            onClick={() => {
                                setOpen(false);
                                router.push("/plans/new");
                            }}
                            className="btn-electric cursor-pointer"
                        >
                            Create Your First Plan
                        </Button>
                    </div>
                ) : (
                    <ScrollArea className="max-h-[400px]">
                        <div className="space-y-2 pr-4">
                            {plans.map((plan) => {
                                const categories = Array.from(
                                    new Set(plan.exercises.map((e) => e.exercise.category))
                                );
                                const isLoading = isPending && selectedPlanId === plan.id;

                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => handleSelectPlan(plan.id)}
                                        disabled={isPending}
                                        className="w-full p-4 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-electric/30 transition-all text-left group cursor-pointer disabled:opacity-50"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h4 className="font-semibold group-hover:text-electric transition-colors">
                                                    {plan.name}
                                                </h4>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Dumbbell className="h-3.5 w-3.5" />
                                                    <span>
                                                        {plan._count.exercises} exercise
                                                        {plan._count.exercises !== 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                {isLoading ? (
                                                    <Loader2 className="h-5 w-5 animate-spin text-electric" />
                                                ) : (
                                                    <Zap className="h-5 w-5 text-muted-foreground group-hover:text-electric transition-colors" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Category badges */}
                                        {categories.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {categories.slice(0, 3).map((category) => (
                                                    <span
                                                        key={category}
                                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[category] || categoryColors.OTHER}`}
                                                    >
                                                        {category.replace("_", " ")}
                                                    </span>
                                                ))}
                                                {categories.length > 3 && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                                        +{categories.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}

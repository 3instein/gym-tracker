"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Zap, Pencil, Trash2, Loader2, Dumbbell } from "lucide-react";
import { deletePlan, startWorkoutFromPlan } from "@/lib/actions/plans";
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

interface PartnerPlanCardProps {
    plan: Plan;
    userId: string;
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

export function PartnerPlanCard({ plan, userId }: PartnerPlanCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await deletePlan({ id: plan.id }, userId);
                toast.success("Plan deleted");
            } catch (error) {
                console.error("Failed to delete plan:", error);
                toast.error("Failed to delete plan");
            }
        });
    };

    const handleStartWorkout = () => {
        startTransition(async () => {
            try {
                await startWorkoutFromPlan(plan.id, userId);
                router.push(`/partners/${userId}/workouts`);
                toast.success("Workout started from plan!");
            } catch (error) {
                console.error("Failed to start workout:", error);
                toast.error("Failed to start workout");
            }
        });
    };

    return (
        <Card className="card-electric group hover:shadow-electric transition-all duration-300">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold text-gradient-electric">
                            {plan.name}
                        </CardTitle>
                        {plan.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {plan.description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer"
                            asChild
                        >
                            <Link href={`/partners/${userId}/plans/${plan.id}`}>
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive cursor-pointer"
                                    disabled={isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete plan?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete &quot;{plan.name}&quot;. This action
                                        cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-destructive hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Exercise count and categories */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Dumbbell className="h-4 w-4" />
                    <span>{plan._count.exercises} exercise{plan._count.exercises !== 1 ? "s" : ""}</span>
                </div>

                {/* Exercise list */}
                {plan.exercises.length > 0 && (
                    <div className="space-y-1.5">
                        {plan.exercises.map((pe, index) => (
                            <div
                                key={pe.id}
                                className="flex items-center gap-2 text-sm"
                            >
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-electric/10 text-electric text-xs font-medium shrink-0">
                                    {index + 1}
                                </span>
                                <span className="truncate text-muted-foreground">
                                    {pe.exercise.name}
                                </span>
                                <span
                                    className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${categoryColors[pe.exercise.category] || categoryColors.OTHER}`}
                                >
                                    {pe.exercise.category.replace("_", " ")}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Start workout button */}
                <Button
                    onClick={handleStartWorkout}
                    disabled={isPending}
                    className="w-full btn-electric cursor-pointer"
                >
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Zap className="mr-2 h-4 w-4" />
                    )}
                    Start Workout
                </Button>
            </CardContent>
        </Card>
    );
}

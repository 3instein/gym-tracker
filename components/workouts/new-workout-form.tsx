"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, Loader2, Calendar } from "lucide-react";
import { createWorkout } from "@/lib/actions/workouts";
import { format } from "date-fns";

import { cn } from "@/lib/utils";

interface NewWorkoutFormProps {
    className?: string;
}

export function NewWorkoutForm({ className }: NewWorkoutFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                const workout = await createWorkout({
                    name: name || undefined,
                    date,
                });
                router.push(`/workouts/${workout.id}`);
            } catch (error) {
                console.error("Failed to create workout:", error);
            }
        });
    };

    return (
        <Card className={cn("max-w-lg mx-auto card-electric", className)} style={{ boxShadow: '0 0 25px -5px var(--electric), 0 0 50px -10px var(--electric-glow)' }}>
            <CardHeader className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-electric shadow-electric animate-electric-pulse">
                    <Zap className="h-8 w-8 text-background" />
                </div>
                <div>
                    <CardTitle className="text-2xl text-gradient-electric">
                        Start New Workout
                    </CardTitle>
                    <CardDescription>
                        Get ready to crush it! Configure your workout session.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Workout Name (optional)</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Push Day, Leg Day, Upper Body"
                            className="input-electric"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="input-electric"
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-14 text-lg font-semibold btn-electric"
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Zap className="mr-2 h-5 w-5" />
                            )}
                            Start Workout
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

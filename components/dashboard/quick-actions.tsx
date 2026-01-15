"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Plus, Clock } from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
    hasActiveWorkout?: boolean;
    activeWorkoutId?: string;
}

export function QuickActions({ hasActiveWorkout, activeWorkoutId }: QuickActionsProps) {
    return (
        <Card className="card-electric h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-electric" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {hasActiveWorkout ? (
                    <Button
                        asChild
                        className="w-full h-14 text-lg font-semibold btn-electric animate-electric-pulse"
                    >
                        <Link href={`/workouts/${activeWorkoutId}`}>
                            <Clock className="mr-2 h-5 w-5" />
                            Continue Workout
                        </Link>
                    </Button>
                ) : (
                    <Button
                        asChild
                        className="w-full h-14 text-lg font-semibold btn-electric"
                    >
                        <Link href="/workouts/new">
                            <Zap className="mr-2 h-5 w-5" />
                            Start Workout
                        </Link>
                    </Button>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        asChild
                        className="h-12 border-border/50 hover:border-electric/50 hover:bg-electric/5"
                    >
                        <Link href="/exercises">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Exercise
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        asChild
                        className="h-12 border-border/50 hover:border-thunder/50 hover:bg-thunder/5"
                    >
                        <Link href="/workouts">
                            View History
                        </Link>
                    </Button>
                </div>

                {/* Motivational message */}
                <div className="mt-4 rounded-xl bg-gradient-storm p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        💪 Every rep counts. Let&apos;s crush it today!
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

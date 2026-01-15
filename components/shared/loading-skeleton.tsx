"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted/50",
                className
            )}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-32" />
        </div>
    );
}

export function StatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

export function WorkoutListSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-3"
                >
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-6" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ExerciseListSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex gap-2 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-20 rounded-xl shrink-0" />
                ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3"
                    >
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-80" />
            </div>
            <StatsSkeleton />
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
                        <Skeleton className="h-6 w-40" />
                        <WorkoutListSkeleton />
                    </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-14 w-full rounded-xl" />
                    <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

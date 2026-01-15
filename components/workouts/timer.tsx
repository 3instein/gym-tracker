"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TimerProps {
    startTime: Date;
}

export function Timer({ startTime }: TimerProps) {
    const [elapsed, setElapsed] = useState<number | null>(null);

    useEffect(() => {
        const update = () => {
            setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
        };

        // Update immediately
        update();

        const interval = setInterval(update, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (elapsed === null) {
        return <Skeleton className="h-8 w-24 rounded-full" />;
    }

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric/10 text-electric border border-electric/20 font-mono text-sm font-medium animate-pulse">
            <Clock className="h-4 w-4" />
            <span>{formatTime(elapsed)}</span>
        </div>
    );
}

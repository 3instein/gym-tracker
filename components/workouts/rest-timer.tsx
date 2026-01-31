"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Timer, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestTimerProps {
    defaultDuration?: number; // in seconds
    className?: string;
}

export function RestTimer({ defaultDuration = 60, className }: RestTimerProps) {
    const [baseDuration, setBaseDuration] = useState(defaultDuration);
    const [timeLeft, setTimeLeft] = useState(defaultDuration);
    const [isActive, setIsActive] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const playNotificationSound = () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();

            // Create a ringer effect using two oscillators for a "trill" or just a modulated single tone
            // Let's do a pulsing "digital alarm" sound
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = "triangle";
            oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5

            // Schedule pulses for 3 seconds
            const now = ctx.currentTime;
            const duration = 3.0;
            const pulseLength = 0.2; // 200ms beep
            const interval = 0.4; // 400ms cycle (200ms beep + 200ms silence)

            // Initial silence
            gainNode.gain.setValueAtTime(0, now);

            for (let t = 0; t < duration; t += interval) {
                // Ramp up quickly
                gainNode.gain.linearRampToValueAtTime(0.5, now + t + 0.05);
                // Sustain
                gainNode.gain.setValueAtTime(0.5, now + t + pulseLength - 0.05);
                // Ramp down quickly
                gainNode.gain.linearRampToValueAtTime(0, now + t + pulseLength);
            }

            oscillator.start(now);
            oscillator.stop(now + duration + 0.1);

        } catch (error) {
            console.error("Audio playback failed:", error);
        }
    };

    const sendNotification = () => {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            new Notification("Rest Finished!", {
                body: "Time to crash that next set! 💪",
                icon: "/favicon.ico"
            });
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsActive(false);
                        playNotificationSound();
                        sendNotification();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const requestNotificationPermission = () => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    };

    const toggleTimer = () => {
        if (!isActive) {
            requestNotificationPermission();
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(baseDuration);
    };

    const adjustTime = (seconds: number) => {
        if (timeLeft === baseDuration && !isActive) {
            const newDuration = Math.max(0, baseDuration + seconds);
            setBaseDuration(newDuration);
            setTimeLeft(newDuration);
        } else {
            setTimeLeft((prev) => Math.max(0, prev + seconds));
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (isCollapsed) {
        return (
            <Button
                variant="outline"
                className={cn(
                    "h-14 w-14 rounded-full shadow-xl p-0 bg-background border-2 transition-all hover:scale-105 active:scale-95",
                    isActive && "border-electric text-electric animate-pulse ring-2 ring-electric/20",
                    className
                )}
                onClick={() => setIsCollapsed(false)}
            >
                <div className="flex flex-col items-center justify-center gap-0.5">
                    <Timer className={cn("h-5 w-5", isActive && "animate-pulse")} />
                    {isActive && (
                        <span className="text-[10px] font-mono font-bold leading-none">
                            {formatTime(timeLeft)}
                        </span>
                    )}
                </div>
            </Button>
        );
    }

    return (
        <div
            className={cn(
                "flex flex-col gap-2 p-4 rounded-xl border shadow-2xl ring-1 ring-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 w-72 transition-all animate-in slide-in-from-bottom-2 duration-200",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsCollapsed(true)}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">Rest Timer</span>
                </div>
                <div className="font-mono text-2xl font-bold tracking-wider tabular-nums">
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={timeLeft <= 30}
                        className="h-8 px-2 text-xs font-mono"
                        onClick={() => adjustTime(-30)}
                    >
                        -30
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={timeLeft <= 15}
                        className="h-8 px-2 text-xs font-mono"
                        onClick={() => adjustTime(-15)}
                    >
                        -15
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={isActive ? "secondary" : "default"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={toggleTimer}
                    >
                        {isActive ? (
                            <Pause className="h-3 w-3" />
                        ) : (
                            <Play className="h-3 w-3 ml-0.5" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={resetTimer}
                    >
                        <RotateCcw className="h-3 w-3" />
                    </Button>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs font-mono"
                        onClick={() => adjustTime(15)}
                    >
                        +15
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs font-mono"
                        onClick={() => adjustTime(30)}
                    >
                        +30
                    </Button>
                </div>
            </div>
        </div>
    );
}

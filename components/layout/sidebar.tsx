"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Zap,
    LayoutDashboard,
    Dumbbell,
    History,
    Settings,
    Menu,
    Users,
    ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/exercises", label: "Exercises", icon: Dumbbell },
    { href: "/workouts", label: "Workouts", icon: History },
    { href: "/plans", label: "Plans", icon: ClipboardList },
    { href: "/partners", label: "Partners", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile menu button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed left-4 top-4 z-50 md:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {!isOpen && <Menu className="h-5 w-5" />}
            </Button>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden cursor-pointer"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/50 bg-sidebar/95 backdrop-blur-xl transition-transform duration-300 md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center gap-3 border-b border-border/50 px-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-electric shadow-electric-sm">
                            <Zap className="h-5 w-5 text-background" />
                        </div>
                        <span className="text-xl font-bold text-gradient-electric">
                            GymTracker
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 p-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer",
                                        isActive
                                            ? "bg-electric/10 text-electric shadow-electric-sm border border-electric/30"
                                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "h-5 w-5",
                                            isActive && "animate-glow text-electric"
                                        )}
                                    />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom decoration */}
                    <div className="border-t border-border/50 p-4">
                        <div className="rounded-xl bg-gradient-storm p-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Zap className="h-4 w-4 text-electric animate-glow" />
                                <span className="text-muted-foreground">Power your gains</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

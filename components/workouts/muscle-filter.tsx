"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export const CATEGORIES = [
    "ALL",
    "CHEST",
    "BACK",
    "SHOULDERS",
    "BICEPS",
    "TRICEPS",
    "LEGS",
    "CORE",
    "CARDIO",
    "FULL_BODY",
    "OTHER",
] as const;

export type Category = (typeof CATEGORIES)[number];

interface MuscleFilterProps {
    selectedCategory: Category;
    onCategoryChange: (category: Category) => void;
    categoriesInWorkout?: string[];
}

export function MuscleFilter({
    selectedCategory,
    onCategoryChange,
    categoriesInWorkout,
}: MuscleFilterProps) {
    return (
        <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex w-max space-x-2 p-1">
                {CATEGORIES.map((category) => {
                    // If categoriesInWorkout is provided, only show "ALL" and categories that are actually in the workout
                    if (
                        categoriesInWorkout &&
                        category !== "ALL" &&
                        !categoriesInWorkout.includes(category)
                    ) {
                        return null;
                    }

                    return (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            size="sm"
                            onClick={() => onCategoryChange(category)}
                            className={cn(
                                "rounded-full transition-all px-4",
                                selectedCategory === category
                                    ? "bg-electric text-white shadow-[0_0_10px_rgba(0,183,255,0.4)]"
                                    : "hover:bg-electric/10 hover:border-electric/50"
                            )}
                        >
                            {category.replace("_", " ")}
                        </Button>
                    );
                })}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
    );
}

"use client";

import { useState, useTransition, useMemo } from "react";
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraggableDataItem, DraggableData, dataToPromptText, ExerciseData, WorkoutData, PlanData } from "./draggable-data-item";
import { PromptDropZone } from "./prompt-drop-zone";
import { AIResponse } from "./ai-response";
import { sendPromptToOllama } from "@/lib/actions/ai";
import { Send, Trash2, Dumbbell, Calendar, ClipboardList } from "lucide-react";
import { Category } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Exercise {
    id: string;
    name: string;
    category: Category;
    stats?: {
        maxWeight: number;
        maxReps: number;
    };
}

interface Workout {
    id: string;
    name: string | null;
    date: Date;
    sets: {
        weight: number;
        reps: number;
        exercise: {
            name: string;
        };
    }[];
}

interface Plan {
    id: string;
    name: string;
    exercises: {
        exercise: {
            name: string;
            category: Category;
        };
    }[];
}

interface AIAssistantProps {
    exercises: Exercise[];
    workouts: Workout[];
    plans: Plan[];
}

const categories: { value: string; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "CHEST", label: "Chest" },
    { value: "BACK", label: "Back" },
    { value: "SHOULDERS", label: "Shoulders" },
    { value: "BICEPS", label: "Biceps" },
    { value: "TRICEPS", label: "Triceps" },
    { value: "LEGS", label: "Legs" },
    { value: "CORE", label: "Core" },
    { value: "CARDIO", label: "Cardio" },
    { value: "FULL_BODY", label: "Full Body" },
    { value: "OTHER", label: "Other" },
];

export function AIAssistant({ exercises, workouts, plans }: AIAssistantProps) {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [activeTab, setActiveTab] = useState("exercises");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over?.id === "prompt-drop-zone" && active.data.current) {
            const data = active.data.current as DraggableData;
            const text = dataToPromptText(data);
            setPrompt((prev) => prev + (prev ? "\n\n" : "") + text);
        }
    };

    const handleSubmit = () => {
        if (!prompt.trim()) return;

        setError(null);
        startTransition(async () => {
            const result = await sendPromptToOllama(prompt);
            if (result.success) {
                setResponse(result.response);
            } else {
                setError(result.error);
            }
        });
    };

    const handleClear = () => {
        setPrompt("");
        setResponse(null);
        setError(null);
    };

    // Transform data for draggable components
    const exerciseItems: ExerciseData[] = useMemo(() => exercises.map((e) => ({
        type: "exercise" as const,
        id: e.id,
        name: e.name,
        category: e.category,
        stats: e.stats,
    })), [exercises]);

    // Filter exercises by category
    const filteredExerciseItems = useMemo(() =>
        selectedCategory === "ALL"
            ? exerciseItems
            : exerciseItems.filter((e) => e.category === selectedCategory),
        [exerciseItems, selectedCategory]
    );

    const workoutItems: WorkoutData[] = useMemo(() => workouts.map((w) => {
        // Group sets by exercise and aggregate data
        const exerciseData = w.sets.reduce((acc, set) => {
            const name = set.exercise.name;
            if (!acc[name]) {
                acc[name] = { sets: 0, maxWeight: 0, totalReps: 0 };
            }
            acc[name].sets += 1;
            acc[name].maxWeight = Math.max(acc[name].maxWeight, set.weight);
            acc[name].totalReps += set.reps;
            return acc;
        }, {} as Record<string, { sets: number; maxWeight: number; totalReps: number }>);

        return {
            type: "workout" as const,
            id: w.id,
            name: w.name,
            date: w.date.toISOString(),
            exercises: Object.entries(exerciseData).map(([name, data]) => ({
                name,
                sets: data.sets,
                maxWeight: data.maxWeight,
                totalReps: data.totalReps,
            })),
        };
    }), [workouts]);

    const planItems: PlanData[] = useMemo(() => plans.map((p) => ({
        type: "plan" as const,
        id: p.id,
        name: p.name,
        exercises: p.exercises.map((e) => ({
            name: e.exercise.name,
            category: e.exercise.category,
        })),
    })), [plans]);

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Data Sidebar */}
                <div className="lg:col-span-1 border rounded-lg bg-card/50 flex flex-col h-full min-h-0">
                    <div className="p-4 border-b shrink-0">
                        <h2 className="font-semibold">Your Gym Data</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Drag items to include them in your prompt
                        </p>
                    </div>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 p-4">
                        <TabsList className="w-full grid grid-cols-3 shrink-0">
                            <TabsTrigger value="exercises" className="cursor-pointer">
                                <Dumbbell className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Exercises</span>
                            </TabsTrigger>
                            <TabsTrigger value="workouts" className="cursor-pointer">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Workouts</span>
                            </TabsTrigger>
                            <TabsTrigger value="plans" className="cursor-pointer">
                                <ClipboardList className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Plans</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Category Filter for Exercises - only visible on exercises tab */}
                        {activeTab === "exercises" && (
                            <div className="mt-3 shrink-0 pr-3">
                                <div className="p-2 bg-background/50">
                                    <ScrollArea className="w-full pb-3" dir="ltr">
                                        <div className="flex gap-2">
                                            {categories.map((cat) => (
                                                <Button
                                                    key={cat.value}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedCategory(cat.value)}
                                                    className={cn(
                                                        "text-sm px-4 py-1.5 h-9 shrink-0 cursor-pointer",
                                                        selectedCategory === cat.value &&
                                                        "border-electric bg-electric/10 text-electric"
                                                    )}
                                                >
                                                    {cat.label}
                                                </Button>
                                            ))}
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 min-h-0">
                            <ScrollArea className="h-full">
                                <div className="pr-3 space-y-2">
                                    <TabsContent value="exercises" className="m-0 mt-0">
                                        <div className="border rounded-lg p-3 bg-background/50">
                                            {filteredExerciseItems.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-4">No exercises found</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {filteredExerciseItems.map((item) => (
                                                        <DraggableDataItem key={item.id} data={item} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="workouts" className="m-0 mt-0">
                                        <div className="border rounded-lg p-3 bg-background/50">
                                            {workoutItems.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-4">No workouts yet</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {workoutItems.map((item) => (
                                                        <DraggableDataItem key={item.id} data={item} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="plans" className="m-0 mt-0">
                                        <div className="border rounded-lg p-3 bg-background/50">
                                            {planItems.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-4">No plans yet</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {planItems.map((item) => (
                                                        <DraggableDataItem key={item.id} data={item} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </div>
                            </ScrollArea>
                        </div>
                    </Tabs>
                </div>

                {/* Prompt Area */}
                <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
                    <div className="border rounded-lg bg-card/50 p-4 flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <div>
                                <h2 className="font-semibold">AI Prompt</h2>
                                <p className="text-sm text-muted-foreground">
                                    Ask questions about your gym data
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClear}
                                    disabled={isPending || (!prompt && !response)}
                                    className="cursor-pointer"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Clear
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSubmit}
                                    disabled={isPending || !prompt.trim()}
                                    className="cursor-pointer"
                                >
                                    <Send className="h-4 w-4 mr-1" />
                                    {isPending ? "Sending..." : "Send"}
                                </Button>
                            </div>
                        </div>

                        <PromptDropZone
                            value={prompt}
                            onChange={setPrompt}
                            disabled={isPending}
                        />

                        <div className="mt-4 flex-1 min-h-0 overflow-auto">
                            <AIResponse
                                response={response}
                                error={error}
                                isLoading={isPending}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DndContext>
    );
}

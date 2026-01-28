"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Pencil, Sparkles } from "lucide-react";
import { createExercise, updateExercise } from "@/lib/actions/exercises";
import { generateExerciseDescription } from "@/lib/actions/ai";
import { type Category } from "@/lib/validations/exercise";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const categories: { value: Category; label: string }[] = [
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

interface ExerciseFormProps {
    exercise?: {
        id: string;
        name: string;
        category: Category;
        description?: string | null;
    };
    onSuccess?: () => void;
    triggerClassName?: string;
}

export function ExerciseForm({ exercise, onSuccess, triggerClassName }: ExerciseFormProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState(exercise?.name || "");
    const [category, setCategory] = useState<Category>(exercise?.category || "CHEST");
    const [description, setDescription] = useState(exercise?.description || "");
    const [isGenerating, setIsGenerating] = useState(false);

    const isEditing = !!exercise;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                if (isEditing) {
                    await updateExercise({
                        id: exercise.id,
                        name,
                        category,
                        description: description || undefined,
                    });
                } else {
                    await createExercise({
                        name,
                        category,
                        description: description || undefined,
                    });
                }

                setOpen(false);
                setName("");
                setCategory("CHEST");
                setDescription("");
                onSuccess?.();
                toast.success(isEditing ? "Exercise updated successfully" : "Exercise created successfully");
            } catch (error) {
                console.error("Failed to save exercise:", error);
                toast.error("Failed to save exercise");
            }
        });
    };

    const handleGenerateDescription = async () => {
        if (!name) {
            toast.error("Please enter an exercise name first");
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateExerciseDescription(name);
            if (result.success) {
                setDescription(result.response);
                toast.success("Description generated!");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error("Failed to generate description:", error);
            toast.error("Failed to generate description");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEditing ? (
                    <Button variant="ghost" size="icon" className={cn("h-8 w-8", triggerClassName)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                ) : (
                    <Button className={cn("btn-electric", triggerClassName)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Exercise
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-border/50 bg-card/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-gradient-electric">
                        {isEditing ? "Edit Exercise" : "Add New Exercise"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the exercise details."
                            : "Create a new exercise to add to your library."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Bench Press"
                                className="input-electric"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                                <SelectTrigger className="input-electric">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs text-muted-foreground hover:text-electric-primary"
                                    onClick={handleGenerateDescription}
                                    disabled={isGenerating || !name}
                                >
                                    {isGenerating ? (
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-1 h-3 w-3" />
                                    )}
                                    Generate
                                </Button>
                            </div>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Notes about form, equipment, etc."
                                className="min-h-[80px] input-electric"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="btn-electric" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

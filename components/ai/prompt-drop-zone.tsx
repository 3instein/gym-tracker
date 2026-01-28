"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

interface PromptDropZoneProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function PromptDropZone({ value, onChange, disabled }: PromptDropZoneProps) {
    const { setNodeRef, isOver, active } = useDroppable({
        id: "prompt-drop-zone",
    });

    const isDragging = !!active;

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "relative rounded-lg transition-all duration-200",
                isDragging && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background",
                isOver && "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5"
            )}
        >
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Type your prompt here or drag gym data to include it...

Example: 'Analyze my workout progress' or 'Suggest improvements for my chest day'"
                className={cn(
                    "min-h-[200px] resize-y text-base",
                    "bg-background/50 backdrop-blur-sm",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                disabled={disabled}
            />
            {isOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg pointer-events-none">
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <Sparkles className="h-5 w-5" />
                        Drop to add to prompt
                    </div>
                </div>
            )}
        </div>
    );
}

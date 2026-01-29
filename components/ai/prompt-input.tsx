"use client";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function PromptInput({ value, onChange, disabled }: PromptInputProps) {
    return (
        <div className="relative rounded-lg transition-all duration-200">
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Type your prompt here or click gym data to include it...

Example: 'Analyze my workout progress' or 'Suggest improvements for my chest day'"
                className={cn(
                    "min-h-[200px] resize-y text-base",
                    "bg-background/50 backdrop-blur-sm",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                disabled={disabled}
            />
        </div>
    );
}

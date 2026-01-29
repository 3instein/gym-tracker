"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

import ReactMarkdown from "react-markdown";

interface AIResponseProps {
    response: string | null;
    error: string | null;
    isLoading: boolean;
}

export function AIResponse({ response, error, isLoading }: AIResponseProps) {
    if (isLoading) {
        return (
            <div className="space-y-3 p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Bot className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">AI is thinking...</span>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[75%]" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-destructive">Error</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
            </div>
        );
    }

    if (!response) {
        return (
            <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed text-center">
                <Bot className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                    AI response will appear here
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                    Click gym data and ask questions about your workouts
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Response</span>
            </div>
            <div className={cn(
                "prose prose-sm dark:prose-invert max-w-none",
                "prose-p:text-foreground prose-headings:text-foreground",
                "prose-strong:text-foreground prose-code:text-primary"
            )}>
                <ReactMarkdown
                    components={{
                        h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                        h2: ({ ...props }) => <h2 className="text-xl font-bold mt-6 mb-3" {...props} />,
                        h3: ({ ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                        p: ({ ...props }) => <p className="mb-4 leading-relaxed last:mb-0" {...props} />,
                        ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                        ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                        li: ({ ...props }) => <li className="pl-1 leading-relaxed" {...props} />,
                        strong: ({ ...props }) => <strong className="font-bold text-electric" {...props} />,
                    }}
                >
                    {response}
                </ReactMarkdown>
            </div>
        </div>
    );
}

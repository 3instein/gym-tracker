"use server";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://100.64.190.67:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mixtral:8x7b";

interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
}

export interface AIResponse {
    success: true;
    response: string;
}

export interface AIError {
    success: false;
    error: string;
}

export type AIResult = AIResponse | AIError;

export async function sendPromptToOllama(prompt: string): Promise<AIResult> {
    if (!prompt.trim()) {
        return { success: false, error: "Prompt cannot be empty" };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: false,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `Ollama API error: ${response.status} - ${errorText}`,
            };
        }

        const data: OllamaResponse = await response.json();
        return { success: true, response: data.response };
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === "AbortError") {
                return { success: false, error: "Request timed out. The AI model may be processing a complex request." };
            }
            return { success: false, error: `Failed to connect to Ollama: ${error.message}` };
        }
        return { success: false, error: "An unexpected error occurred" };
    }
}

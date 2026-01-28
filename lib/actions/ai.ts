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

export async function generateExerciseDescription(name: string): Promise<AIResult> {
    const prompt = `Task: Describe the gym exercise "${name}" professionally.

CRITICAL CONSTRAINTS:
- ABSOLUTELY NO EMOJIS, SYMBOLS, OR GRAPHICS. Use ONLY plain text letters and basic punctuation (periods, commas).
- DO NOT INCLUDE THE EXERCISE NAME. Skip any titles or headers.
- NO INTRODUCTORY TEXT (e.g., "This exercise targets...").
- START IMMEDIATELY with the description.
- FORMAT: Muscles targeted followed by form tips.
- LENGTH: Max 200 characters.

Example of BAD output: "✅ Bench Press: targets chest 🏋️"
Example of GOOD output: "Targets the pectorals and triceps. Drive the weight upward from mid-chest while keeping shoulders retracted."`;

    const result = await sendPromptToOllama(prompt);

    if (result.success) {
        // Post-processing sanitization as a safety layer
        const sanitized = result.response
            .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Remove emojis
            .replace(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '') // Remove exercise name with escaped regex
            .replace(/^[:\s\-✅]+/, '') // Remove leading artifacts
            .trim();

        return { ...result, response: sanitized };
    }

    return result;
}

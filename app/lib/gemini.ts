import { GoogleGenAI } from "@google/genai";

// This file runs on the server only. The API key never reaches the browser.

export type AiErrorCode = "busy" | "unavailable" | "config" | "blocked" | "failed";

export class AiError extends Error {
  code: AiErrorCode;
  constructor(code: AiErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

// The model name lives in an environment variable, so it can be changed
// later without touching the code.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

export async function generateText(prompt: string, systemInstruction: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set.");
    throw new AiError("config", "The AI service is not set up yet. Please try again later.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 50_000 } });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { systemInstruction },
    });

    if (response.promptFeedback?.blockReason) {
      throw new AiError("blocked", "The AI could not process this content.");
    }

    const text = response.text?.trim();
    if (!text) {
      throw new AiError("failed", "The AI returned an empty answer. Please try again.");
    }
    return text;
  } catch (err: any) {
    if (err instanceof AiError) throw err;

    // Details stay in the server log. The visitor only sees a short message.
    console.error("Gemini error:", err?.status, err?.message);
    const status = err?.status;

    if (status === 429) {
      throw new AiError("busy", "The free AI limit has been reached for now. Please try again in a little while.");
    }
    if (status === 404) {
      console.error(`Model "${MODEL}" is not available. Set GEMINI_MODEL to a current model name.`);
      throw new AiError("unavailable", "The AI model is temporarily unavailable. Please try again later.");
    }
    if (status === 400 || status === 401 || status === 403) {
      throw new AiError("config", "The AI service is not set up correctly. Please try again later.");
    }
    throw new AiError("failed", "The AI could not finish this request. Please try again.");
  }
}

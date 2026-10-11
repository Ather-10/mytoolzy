import type { AiRequest } from "./aiConfig";

// Sends one request to our own server route. The AI key is never in the browser.
export async function callAi(body: AiRequest): Promise<string> {
  let res: Response;
  try {
    res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // the server answered with something that is not JSON
  }

  if (!res.ok || typeof data?.result !== "string") {
    throw new Error(data?.error || "Something went wrong. Please try again.");
  }
  return data.result;
}

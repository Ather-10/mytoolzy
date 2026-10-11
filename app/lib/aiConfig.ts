// Limits and types shared by the browser code and the server route.

export const AI_LIMITS = {
  // A summary is made in one request, so it can take a longer document.
  summarizeMaxChars: 120_000,
  // Translation and Markdown are done in parts, to keep every request small.
  partChars: 6_000,
  partsMaxChars: 30_000,
};

export const LANGUAGES = [
  "Urdu",
  "Hindi",
  "English",
  "Arabic",
  "Spanish",
  "French",
  "German",
  "Chinese",
] as const;
export type Language = (typeof LANGUAGES)[number];

export const SUMMARY_STYLES = ["bullets", "executive", "detailed"] as const;
export type SummaryStyle = (typeof SUMMARY_STYLES)[number];

export type AiRequest =
  | { task: "summarize"; text: string; style: SummaryStyle }
  | { task: "translate"; text: string; language: Language; part: number; totalParts: number }
  | { task: "markdown"; text: string; part: number; totalParts: number };

"use client";
import { useState } from "react";
import { extractPdfText } from "./pdfText";

// Loads a PDF and keeps its text, with the loading and error states the three
// AI tools all need.
export function usePdfText() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(selected: File) {
    const isPdf = selected.type === "application/pdf" || selected.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Please choose a PDF file.");
      return false;
    }

    setError("");
    setLoading(true);
    try {
      const text = await extractPdfText(selected);
      if (!text.some((p) => p.trim())) {
        setError("This PDF has no selectable text. It may be a scanned document, so the AI cannot read it.");
        return false;
      }
      setFile(selected);
      setPages(text);
      return true;
    } catch (err: any) {
      console.error(err);
      setError(
        err?.name === "PasswordException"
          ? "This PDF is password-protected. Remove the password first, then try again."
          : "Could not read this PDF. The file may be damaged."
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setFile(null);
    setPages([]);
    setError("");
  }

  return { file, pages, loading, error, load, clear };
}

"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, FileText, Copy, Check, Download, FileCode } from "lucide-react";
import PdfDropzone from "../../components/PdfDropzone";
import AiNotice from "../../components/AiNotice";
import { usePdfText } from "../../lib/usePdfText";
import { capPages, splitIntoParts } from "../../lib/pdfText";
import { callAi } from "../../lib/aiClient";
import { AI_LIMITS } from "../../lib/aiConfig";

export default function AiPdfToMarkdown() {
  const doc = usePdfText();
  const [markdown, setMarkdown] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const cancelRef = useRef(false);

  // stop a running conversion when the visitor leaves the page
  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const capped = useMemo(() => capPages(doc.pages, AI_LIMITS.partsMaxChars), [doc.pages]);

  async function handleFile(file: File) {
    cancelRef.current = true;
    setMarkdown("");
    setError("");
    setNotice("");
    await doc.load(file);
  }

  function removeFile() {
    cancelRef.current = true;
    doc.clear();
    setMarkdown("");
    setError("");
    setNotice("");
  }

  async function convert() {
    if (!doc.pages.length) return;

    const parts = splitIntoParts(capped.text, AI_LIMITS.partChars);
    cancelRef.current = false;
    setProcessing(true);
    setError("");
    setMarkdown("");
    setNotice(capped.note ?? "");
    setProgress({ done: 0, total: parts.length });

    const results: string[] = [];
    try {
      for (let i = 0; i < parts.length; i++) {
        if (cancelRef.current) return;
        setProgress({ done: i, total: parts.length });
        const converted = await callAi({
          task: "markdown",
          text: parts[i],
          part: i + 1,
          totalParts: parts.length,
        });
        if (cancelRef.current) return;
        results.push(converted);
        setMarkdown(results.join("\n\n"));
      }
    } catch (err: any) {
      setError(
        results.length > 0
          ? `${err.message} The conversion stopped at part ${results.length + 1} of ${parts.length}. The text below is what was finished.`
          : err.message
      );
    } finally {
      setProcessing(false);
    }
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
    }
  }

  function downloadMarkdown() {
    if (!doc.file) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.file.name.replace(/\.pdf$/i, "") + ".md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="bg-white text-neutral-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">AI PDF to Markdown</h1>
        <p className="text-neutral-600 mb-6">
          Turn the text of a PDF into clean Markdown with headings and lists. Works best on documents of up to about
          10 pages.
        </p>

        <AiNotice />

        {!doc.file ? (
          <>
            <PdfDropzone onFile={handleFile} loading={doc.loading} />
            {doc.error && <p className="mt-4 text-sm text-red-500">{doc.error}</p>}
          </>
        ) : (
          <div className="border border-neutral-200 rounded-xl p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.file.name}</p>
                <p className="text-xs text-neutral-500">
                  {doc.pages.length} page{doc.pages.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button onClick={removeFile} className="text-sm text-neutral-500 underline shrink-0">
                Change file
              </button>
            </div>

            {capped.note && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
                This PDF is longer than the limit. {capped.note}
              </p>
            )}

            <button
              onClick={convert}
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-3 rounded-md hover:bg-teal-700 disabled:opacity-60"
            >
              {processing ? <Loader2 size={18} className="animate-spin" /> : <FileCode size={18} />}
              {processing ? `Converting part ${progress.done + 1} of ${progress.total}...` : "Convert to Markdown"}
            </button>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            {markdown && (
              <div className="mt-6 border border-neutral-200 rounded-lg bg-neutral-50">
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-200">
                  <h2 className="text-sm font-semibold">Markdown</h2>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={copyMarkdown}
                      className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:underline"
                    >
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={downloadMarkdown}
                      disabled={processing}
                      className="flex items-center gap-1.5 text-sm font-semibold bg-teal-600 text-white px-3 py-1.5 rounded-md hover:bg-teal-700 disabled:opacity-60"
                    >
                      <Download size={15} />
                      Download .md
                    </button>
                  </div>
                </div>
                {notice && <p className="px-4 pt-3 text-xs text-amber-700">{notice}</p>}
                <textarea
                  readOnly
                  value={markdown}
                  rows={14}
                  className="w-full p-4 bg-transparent font-mono text-xs text-neutral-800 focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12 max-w-2xl">
          The text is read from your PDF inside your browser. Only that text is then sent to Google&apos;s Gemini AI to
          format it. The PDF file itself is not uploaded. Tables and layout are not preserved exactly, so check the
          result. Scanned PDFs without selectable text cannot be read.
        </p>
      </div>
    </div>
  );
}

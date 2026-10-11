"use client";
import { useMemo, useState } from "react";
import { Loader2, FileText, Copy, Check, Sparkles } from "lucide-react";
import PdfDropzone from "../../components/PdfDropzone";
import AiNotice from "../../components/AiNotice";
import { usePdfText } from "../../lib/usePdfText";
import { capPages } from "../../lib/pdfText";
import { callAi } from "../../lib/aiClient";
import { AI_LIMITS, type SummaryStyle } from "../../lib/aiConfig";

const STYLES: { id: SummaryStyle; label: string }[] = [
  { id: "bullets", label: "Bullet points and key takeaways" },
  { id: "executive", label: "Executive summary" },
  { id: "detailed", label: "Detailed breakdown by section" },
];

export default function AiPdfSummarizer() {
  const doc = usePdfText();
  const [style, setStyle] = useState<SummaryStyle>("bullets");
  const [summary, setSummary] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  // worked out before the button is pressed, so the visitor knows in advance
  const capped = useMemo(() => capPages(doc.pages, AI_LIMITS.summarizeMaxChars), [doc.pages]);

  async function handleFile(file: File) {
    setSummary("");
    setError("");
    setNotice("");
    await doc.load(file);
  }

  function removeFile() {
    doc.clear();
    setSummary("");
    setError("");
    setNotice("");
  }

  async function summarize() {
    if (!doc.pages.length) return;
    setProcessing(true);
    setError("");
    setSummary("");
    setNotice(capped.note ?? "");
    try {
      setSummary(await callAi({ task: "summarize", text: capped.text, style }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-white text-neutral-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">AI PDF Summarizer</h1>
        <p className="text-neutral-600 mb-6">
          Get the key points of a PDF in seconds. Choose bullet points, an executive summary or a detailed breakdown.
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

            <label className="block text-sm font-medium mb-2">Summary style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as SummaryStyle)}
              className="w-full border border-neutral-200 rounded-md p-3 text-sm mb-5 focus:outline-none focus:border-teal-500"
            >
              {STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            <button
              onClick={summarize}
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-3 rounded-md hover:bg-teal-700 disabled:opacity-60"
            >
              {processing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {processing ? "Summarizing..." : "Generate summary"}
            </button>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            {summary && (
              <div className="mt-6 border border-neutral-200 rounded-lg bg-neutral-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
                  <h2 className="text-sm font-semibold">Summary</h2>
                  <button
                    onClick={copySummary}
                    className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:underline"
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                {notice && <p className="px-4 pt-3 text-xs text-amber-700">{notice}</p>}
                <div className="p-4 text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">{summary}</div>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12 max-w-2xl">
          The text is read from your PDF inside your browser. Only that text is then sent to Google&apos;s Gemini AI to
          write the summary. The PDF file itself is not uploaded. Scanned PDFs without selectable text cannot be read.
        </p>
      </div>
    </div>
  );
}

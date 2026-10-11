"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, FileText, Copy, Check, Languages } from "lucide-react";
import PdfDropzone from "../../components/PdfDropzone";
import AiNotice from "../../components/AiNotice";
import { usePdfText } from "../../lib/usePdfText";
import { capPages, splitIntoParts } from "../../lib/pdfText";
import { callAi } from "../../lib/aiClient";
import { AI_LIMITS, LANGUAGES, type Language } from "../../lib/aiConfig";

const RTL_LANGUAGES: Language[] = ["Urdu", "Arabic"];

export default function AiPdfTranslator() {
  const doc = usePdfText();
  const [language, setLanguage] = useState<Language>("Urdu");
  const [resultLanguage, setResultLanguage] = useState<Language>("Urdu");
  const [output, setOutput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const cancelRef = useRef(false);

  // stop a running translation when the visitor leaves the page
  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const capped = useMemo(() => capPages(doc.pages, AI_LIMITS.partsMaxChars), [doc.pages]);

  async function handleFile(file: File) {
    cancelRef.current = true;
    setOutput("");
    setError("");
    setNotice("");
    await doc.load(file);
  }

  function removeFile() {
    cancelRef.current = true;
    doc.clear();
    setOutput("");
    setError("");
    setNotice("");
  }

  async function translate() {
    if (!doc.pages.length) return;

    const parts = splitIntoParts(capped.text, AI_LIMITS.partChars);
    cancelRef.current = false;
    setProcessing(true);
    setError("");
    setOutput("");
    setNotice(capped.note ?? "");
    setResultLanguage(language);
    setProgress({ done: 0, total: parts.length });

    const results: string[] = [];
    try {
      for (let i = 0; i < parts.length; i++) {
        if (cancelRef.current) return;
        setProgress({ done: i, total: parts.length });
        const translated = await callAi({
          task: "translate",
          text: parts[i],
          language,
          part: i + 1,
          totalParts: parts.length,
        });
        if (cancelRef.current) return;
        results.push(translated);
        setOutput(results.join("\n\n"));
      }
    } catch (err: any) {
      setError(
        results.length > 0
          ? `${err.message} The translation stopped at part ${results.length + 1} of ${parts.length}. The text above is what was finished.`
          : err.message
      );
    } finally {
      setProcessing(false);
    }
  }

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
    }
  }

  const isRtl = RTL_LANGUAGES.includes(resultLanguage);

  return (
    <div className="bg-white text-neutral-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">AI PDF Translator</h1>
        <p className="text-neutral-600 mb-6">
          Translate the text of a PDF into Urdu, Hindi, Arabic, English and more. Works best on documents of up to
          about 10 pages.
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

            <label className="block text-sm font-medium mb-2">Translate into</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              disabled={processing}
              className="w-full border border-neutral-200 rounded-md p-3 text-sm mb-5 focus:outline-none focus:border-teal-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            <button
              onClick={translate}
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-3 rounded-md hover:bg-teal-700 disabled:opacity-60"
            >
              {processing ? <Loader2 size={18} className="animate-spin" /> : <Languages size={18} />}
              {processing ? `Translating part ${progress.done + 1} of ${progress.total}...` : `Translate to ${language}`}
            </button>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            {output && (
              <div className="mt-6 border border-neutral-200 rounded-lg bg-neutral-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
                  <h2 className="text-sm font-semibold">Translation ({resultLanguage})</h2>
                  <button
                    onClick={copyOutput}
                    className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:underline"
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                {notice && <p className="px-4 pt-3 text-xs text-amber-700">{notice}</p>}
                <div
                  dir={isRtl ? "rtl" : "ltr"}
                  className={`p-4 whitespace-pre-wrap leading-relaxed text-neutral-800 ${isRtl ? "text-base" : "text-sm"}`}
                >
                  {output}
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12 max-w-2xl">
          The text is read from your PDF inside your browser. Only that text is then sent to Google&apos;s Gemini AI to
          translate it. The PDF file itself is not uploaded. AI translation can contain mistakes, so check anything
          important. Scanned PDFs without selectable text cannot be read.
        </p>
      </div>
    </div>
  );
}

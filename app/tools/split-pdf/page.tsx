"use client";
import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { Upload, Download, FileText } from "lucide-react";

type Group = { label: string; pages: number[] };
type Result = { name: string; url: string; size: number; blob: Blob };
type Mode = "ranges" | "every";

function humanSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function parseRanges(input: string, max: number): Group[] {
  const parts = input.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    throw new Error("Enter at least one page or range, for example 1-3, 5.");
  }
  return parts.map((part) => {
    const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) {
      throw new Error(`"${part}" is not valid. Use single pages like 5 or ranges like 2-4.`);
    }
    const start = parseInt(match[1], 10);
    const end = match[2] ? parseInt(match[2], 10) : start;
    if (start < 1 || end > max) {
      throw new Error(`"${part}" is outside this document, which has ${max} pages.`);
    }
    if (start > end) {
      throw new Error(`"${part}" is backwards. Write it as ${end}-${start}.`);
    }
    const pages: number[] = [];
    for (let i = start - 1; i <= end - 1; i++) pages.push(i);
    return { label: start === end ? `page-${start}` : `pages-${start}-${end}`, pages };
  });
}

function triggerDownload(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<Mode>("ranges");
  const [rangeText, setRangeText] = useState("");
  const [mergeRanges, setMergeRanges] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function clearResults() {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setResults([]);
  }

  function reset() {
    clearResults();
    setFile(null);
    setBytes(null);
    setPageCount(0);
    setRangeText("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFile(selected: File) {
    const isPdf = selected.type === "application/pdf" || selected.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Please choose a PDF file.");
      return;
    }
    clearResults();
    setError("");
    try {
      const buffer = await selected.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      setFile(selected);
      setBytes(buffer);
      setPageCount(doc.getPageCount());
    } catch (err) {
      console.error(err);
      setError("Could not read this PDF. It may be password-protected or damaged.");
    }
  }

  async function split() {
    if (!bytes || !file) return;
    setError("");
    clearResults();

    let groups: Group[];
    try {
      if (mode === "every") {
        groups = Array.from({ length: pageCount }, (_, i) => ({
          label: `page-${i + 1}`,
          pages: [i],
        }));
      } else {
        groups = parseRanges(rangeText, pageCount);
        if (mergeRanges) {
          groups = [{ label: "extracted", pages: groups.flatMap((g) => g.pages) }];
        }
      }
    } catch (err: any) {
      setError(err.message);
      return;
    }

    setProcessing(true);
    try {
      const source = await PDFDocument.load(bytes);
      const baseName = file.name.replace(/\.pdf$/i, "");
      const output: Result[] = [];

      for (const group of groups) {
        const doc = await PDFDocument.create();
        const copied = await doc.copyPages(source, group.pages);
        copied.forEach((p) => doc.addPage(p));
        const outBytes = await doc.save();
        const blob = new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
        output.push({
          name: `${baseName}-${group.label}.pdf`,
          url: URL.createObjectURL(blob),
          size: blob.size,
          blob,
        });
      }
      setResults(output);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while splitting this PDF.");
    } finally {
      setProcessing(false);
    }
  }

  async function downloadZip() {
    const zip = new JSZip();
    results.forEach((r) => zip.file(r.name, r.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const baseName = file ? file.name.replace(/\.pdf$/i, "") : "split";
    triggerDownload(url, `${baseName}-split.zip`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="bg-white text-neutral-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Split PDF</h1>
        <p className="text-neutral-600 mb-8">
          Extract pages or split a PDF into separate files, right in your browser.
        </p>

       <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              dragActive ? "border-teal-500 bg-teal-50" : "border-neutral-200 hover:border-teal-400"
            }`}
          >
            <Upload size={32} className="mx-auto mb-3 text-neutral-400" />
            <p className="font-semibold mb-1">Drop your PDF here</p>
            <p className="text-sm text-neutral-500">
              or <span className="text-teal-600 underline">choose file</span>
            </p>
          </div>
        ) : (
          <>
            {/* File info */}
            <div className="flex items-center gap-3 border border-neutral-200 rounded-lg p-4 mb-6">
              <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-neutral-500">
                  {pageCount} page{pageCount !== 1 ? "s" : ""} · {humanSize(file.size)}
                </p>
              </div>
              <button onClick={reset} className="text-sm text-neutral-500 underline shrink-0">
                Change file
              </button>
            </div>

            {/* Mode */}
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                { id: "ranges" as Mode, title: "Custom ranges", desc: "Pick the pages you want, like 1-3, 5, 8-10" },
                { id: "every" as Mode, title: "Every page", desc: `Make ${pageCount} separate PDFs, one per page` },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setMode(opt.id);
                    setError("");
                  }}
                  className={`text-left border rounded-lg p-4 transition-colors ${
                    mode === opt.id ? "border-teal-500 bg-teal-50/40" : "border-neutral-200 hover:border-teal-300"
                  }`}
                >
                  <p className="font-semibold text-sm mb-0.5">{opt.title}</p>
                  <p className="text-xs text-neutral-500">{opt.desc}</p>
                </button>
              ))}
            </div>

            {mode === "ranges" && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Pages to extract</label>
                <input
                  value={rangeText}
                  onChange={(e) => setRangeText(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="w-full border border-neutral-200 rounded-md p-3 text-sm focus:outline-none focus:border-teal-500"
                />
                <p className="text-xs text-neutral-400 mt-1.5">
                  This document has {pageCount} pages. Separate pages or ranges with commas.
                </p>
                <label className="flex items-center gap-3 text-sm cursor-pointer mt-4">
                  <input
                    type="checkbox"
                    checked={mergeRanges}
                    onChange={(e) => setMergeRanges(e.target.checked)}
                    className="accent-teal-600 w-4 h-4"
                  />
                  Combine all selected pages into a single PDF
                </label>
              </div>
            )}

            <button
              onClick={split}
              disabled={processing}
              className="bg-teal-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-teal-700 disabled:opacity-60"
            >
              {processing ? "Splitting..." : "Split PDF"}
            </button>
          </>
        )}

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">
                {results.length} file{results.length > 1 ? "s" : ""} ready
              </p>
              {results.length > 1 && (
                <button
                  onClick={downloadZip}
                  className="flex items-center gap-2 bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-teal-700"
                >
                  <Download size={16} />
                  Download all (ZIP)
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {results.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center gap-3 border border-neutral-200 rounded-lg p-3"
                >
                  <span className="flex-1 text-sm truncate">{r.name}</span>
                  <span className="text-xs text-neutral-400 shrink-0">{humanSize(r.size)}</span>
                  <a
                    href={r.url}
                    download={r.name}
                    className="text-sm font-semibold text-teal-600 hover:underline shrink-0"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12">
          Files are split locally in your browser. Nothing is uploaded to a server.
        </p>
      </div>
    </div>
  );
}
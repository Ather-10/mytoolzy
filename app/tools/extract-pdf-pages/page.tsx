"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";

export default function ExtractPdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rangeInput, setRangeInput] = useState<string>("");
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function humanSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  async function handleFile(selectedFile: File) {
    if (selectedFile.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    setFile(selectedFile);
    setDownloadUrl(null);
    setError("");
    setSelectedPages([]);
    setRangeInput("");

    try {
      const bytes = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setTotalPages(pdf.getPageCount());
    } catch (err) {
      setError("Failed to read PDF. Make sure the file is not encrypted or corrupt.");
    }
  }

  function togglePageSelection(pageIndex: number) {
    setSelectedPages((prev) => {
      const next = prev.includes(pageIndex)
        ? prev.filter((p) => p !== pageIndex)
        : [...prev, pageIndex];
      
      const sortedNumbers = [...next].map((p) => p + 1).sort((a, b) => a - b);
      setRangeInput(sortedNumbers.join(", "));
      return next;
    });
  }

  function handleRangeInputChange(value: string) {
    setRangeInput(value);
    
    // Auto-sync visual selection grid with range input text
    const parts = value.split(",");
    const newSelected = new Set<number>();

    parts.forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map((n) => parseInt(n, 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (i >= 1 && i <= totalPages) newSelected.add(i - 1);
          }
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num >= 1 && num <= totalPages) {
          newSelected.add(num - 1);
        }
      }
    });

    setSelectedPages(Array.from(newSelected));
  }

  function selectAllPages() {
    const all = Array.from({ length: totalPages }, (_, i) => i);
    setSelectedPages(all);
    setRangeInput(`1-${totalPages}`);
  }

  function clearSelection() {
    setSelectedPages([]);
    setRangeInput("");
  }

  async function handleExtractPages() {
    if (!file || totalPages === 0) return;

    if (selectedPages.length === 0) {
      setError("Please select or enter at least one page to extract.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      // Copy selected pages maintaining order
      const sortedIndices = [...selectedPages].sort((a, b) => a - b);
      const copiedPages = await newPdf.copyPages(srcPdf, sortedIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blobBytes = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(blobBytes).set(pdfBytes);
      const blob = new Blob([blobBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      setError("An error occurred while extracting pages from the PDF.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-white text-neutral-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Extract PDF Pages</h1>
        <p className="text-neutral-600 mb-8">
          Extract specific pages or page ranges from your PDF into a brand new document — works 100% locally in your browser.
        </p>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
          }}
          className="border-2 border-dashed border-neutral-200 rounded-xl p-10 text-center cursor-pointer hover:border-teal-400 transition-colors bg-white"
        >
          <div className="text-3xl mb-3">📄</div>
          <p className="font-semibold mb-1">Drop your PDF here</p>
          <p className="text-sm text-neutral-500">
            or <span className="text-teal-600 underline">choose file</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {file && totalPages > 0 && (
          <div className="mt-6 border border-neutral-200 rounded-lg p-6 space-y-6 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <p className="font-semibold text-sm">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Size: {humanSize(file.size)} | Total Pages: <span className="font-semibold text-teal-600">{totalPages}</span>
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Pages to Extract:
                </label>
                <div className="flex gap-3 text-xs">
                  <button
                    type="button"
                    onClick={selectAllPages}
                    className="text-teal-600 hover:underline font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-neutral-300">|</span>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-neutral-500 hover:underline"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="e.g. 1, 3, 5-8"
                value={rangeInput}
                onChange={(e) => handleRangeInputChange(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:border-teal-600 bg-white text-neutral-900"
              />
              <p className="text-xs text-neutral-400 mt-1">
                Enter page numbers and ranges separated by commas, or click cards below.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Click pages to select for extraction:
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-2 border border-neutral-100 rounded-md bg-neutral-50">
                {Array.from({ length: totalPages }, (_, i) => {
                  const isSelected = selectedPages.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => togglePageSelection(i)}
                      className={`p-3 rounded-md text-xs font-semibold border transition ${
                        isSelected
                          ? "bg-teal-50 text-teal-700 border-teal-500 shadow-sm"
                          : "bg-white text-neutral-700 border-neutral-200 hover:border-teal-400"
                      }`}
                    >
                      Page {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleExtractPages}
              disabled={processing || selectedPages.length === 0}
              className="w-full bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-md hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer"
            >
              {processing ? "Extracting Pages..." : `Extract ${selectedPages.length} Page(s)`}
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

        {downloadUrl && file && (
          <div className="mt-6 border border-neutral-200 rounded-lg p-4 bg-teal-50/30">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-teal-900 block">Extracted PDF Ready!</span>
                <span className="text-xs text-teal-700">{selectedPages.length} pages extracted</span>
              </div>
              <a
                href={downloadUrl}
                download={file.name.replace(".pdf", "-extracted.pdf")}
                className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-teal-700 transition"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12">
          Page extraction runs locally in your browser. Nothing is uploaded to a server.
        </p>
      </div>
    </div>
  );
}
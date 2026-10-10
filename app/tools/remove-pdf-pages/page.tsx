"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";

export default function RemovePdfPages() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pagesToRemove, setPagesToRemove] = useState<string>("");
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
    setPagesToRemove("");

    try {
      const bytes = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setTotalPages(pdf.getPageCount());
    } catch (err) {
      setError("Failed to read PDF. Make sure it is not encrypted.");
    }
  }

  function togglePageSelection(pageIndex: number) {
    setSelectedPages((prev) => {
      const next = prev.includes(pageIndex)
        ? prev.filter((p) => p !== pageIndex)
        : [...prev, pageIndex];
      
      setPagesToRemove(next.map((p) => p + 1).sort((a, b) => a - b).join(", "));
      return next;
    });
  }

  async function handleRemovePages() {
    if (!file || totalPages === 0) return;

    if (!pagesToRemove.trim() && selectedPages.length === 0) {
      setError("Please enter or select page numbers to remove.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const inputIndices = pagesToRemove
        .split(",")
        .map((p) => parseInt(p.trim(), 10))
        .filter((num) => !isNaN(num) && num >= 1 && num <= totalPages)
        .map((num) => num - 1);

      const removeSet = new Set([...selectedPages, ...inputIndices]);

      if (removeSet.size >= totalPages) {
        setError("You cannot delete all pages from the PDF.");
        setProcessing(false);
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const keepIndices: number[] = [];
      for (let i = 0; i < totalPages; i++) {
        if (!removeSet.has(i)) {
          keepIndices.push(i);
        }
      }

      const copiedPages = await newPdf.copyPages(srcPdf, keepIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blobBytes = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(blobBytes).set(pdfBytes);
      const blob = new Blob([blobBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      setError("An error occurred while removing pages from the PDF.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-white text-neutral-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Remove PDF Pages</h1>
        <p className="text-neutral-600 mb-8">
          Delete unwanted pages from your PDF file — works 100% locally in your browser.
        </p>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
          }}
          className="border-2 border-dashed border-neutral-200 rounded-xl p-10 text-center cursor-pointer hover:border-teal-400 transition-colors"
        >
          <div className="text-3xl mb-3">✂️</div>
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
          <div className="mt-6 border border-neutral-200 rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <p className="font-semibold text-sm">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Size: {humanSize(file.size)} | Total Pages: <span className="font-semibold text-teal-600">{totalPages}</span>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700">
                Pages to Remove:
              </label>
              <input
                type="text"
                placeholder="e.g. 1, 3, 5"
                value={pagesToRemove}
                onChange={(e) => setPagesToRemove(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:border-teal-600"
              />
              <p className="text-xs text-neutral-400 mt-1">
                Type page numbers or click pages below to select.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Select pages to delete:
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
                          ? "bg-red-50 text-red-600 border-red-200"
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
              onClick={handleRemovePages}
              disabled={processing}
              className="w-full bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-md hover:bg-teal-700 transition disabled:opacity-50"
            >
              {processing ? "Processing..." : "Remove Selected Pages"}
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

        {downloadUrl && file && (
          <div className="mt-6 border border-neutral-200 rounded-lg p-4 bg-teal-50/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-teal-900">Modified PDF is ready!</span>
              <a
                href={downloadUrl}
                download={file.name.replace(".pdf", "-modified.pdf")}
                className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-teal-700 transition"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12">
          Page removal runs locally in your browser. Nothing is uploaded to a server.
        </p>
      </div>
    </div>
  );
}
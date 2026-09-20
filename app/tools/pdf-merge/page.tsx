"use client";
import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";

type PdfFile = {
  id: string;
  file: File;
};

export default function PdfMerge() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(fileList: FileList) {
    const newFiles = Array.from(fileList)
      .filter((f) => f.type === "application/pdf")
      .map((file) => ({ id: "f-" + Math.random().toString(36).slice(2), file }));
    setFiles((prev) => [...prev, ...newFiles]);
    setDownloadUrl(null);
    setError("");
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setDownloadUrl(null);
  }

  function moveFile(index: number, direction: -1 | 1) {
    setFiles((prev) => {
      const arr = [...prev];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= arr.length) return arr;
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
  }

  async function mergePdfs() {
    if (files.length < 2) {
      setError("Please add at least 2 PDF files.");
      return;
    }
    setMerging(true);
    setError("");
    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const bytes = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const pdfBytes = new ArrayBuffer(mergedBytes.byteLength);
      new Uint8Array(pdfBytes).set(mergedBytes);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while merging. Make sure all files are valid PDFs.");
    } finally {
      setMerging(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" className="text-lg font-bold text-teal-600">MyToolzy</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">PDF Merge</h1>
        <p className="text-neutral-600 mb-8">
          Combine multiple PDF files into one — in the order you choose.
        </p>

        {/* Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-neutral-200 rounded-xl p-10 text-center cursor-pointer hover:border-teal-400 transition-colors"
        >
          <div className="text-3xl mb-3">⬆</div>
          <p className="font-semibold mb-1">Drop PDF files here</p>
          <p className="text-sm text-neutral-500">
            or <span className="text-teal-600 underline">choose files</span> — add 2 or more
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2 mt-6">
            {files.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 border border-neutral-200 rounded-lg p-3"
              >
                <span className="text-sm font-semibold text-neutral-400 w-5">{index + 1}</span>
                <span className="flex-1 text-sm truncate">{item.file.name}</span>
                <button
                  onClick={() => moveFile(index, -1)}
                  disabled={index === 0}
                  className="text-neutral-400 hover:text-teal-600 disabled:opacity-30 px-1"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveFile(index, 1)}
                  disabled={index === files.length - 1}
                  className="text-neutral-400 hover:text-teal-600 disabled:opacity-30 px-1"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeFile(item.id)}
                  className="text-neutral-400 hover:text-red-500 text-lg leading-none px-1"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Merge button */}
        {files.length >= 2 && !downloadUrl && (
          <button
            onClick={mergePdfs}
            disabled={merging}
            className="mt-6 bg-teal-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-teal-700 disabled:opacity-60"
          >
            {merging ? "Merging..." : `Merge ${files.length} PDFs`}
          </button>
        )}

        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

        {/* Result */}
        {downloadUrl && (
          <div className="mt-6 flex items-center justify-between border border-teal-200 bg-teal-50 rounded-lg p-4">
            <span className="text-sm font-medium text-teal-800">Merged PDF ready!</span>
            <a
              href={downloadUrl}
              download="merged.pdf"
              className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-teal-700"
            >
              Download
            </a>
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12">
          Files are merged locally in your browser. Nothing is uploaded to a server.
        </p>
      </div>
    </div>
  );
}
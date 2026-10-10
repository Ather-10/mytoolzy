"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";

interface PageItem {
  id: string;
  originalIndex: number;
}

export default function OrganizePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
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

    try {
      const bytes = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const count = pdf.getPageCount();

      const initialPages: PageItem[] = Array.from({ length: count }, (_, i) => ({
        id: `page-${i}-${Date.now()}`,
        originalIndex: i,
      }));

      setPages(initialPages);
    } catch (err) {
      setError("Failed to read PDF. Make sure it is not encrypted.");
    }
  }

  function movePage(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= pages.length) return;
    const updated = [...pages];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    setPages(updated);
  }

  function deletePage(index: number) {
    if (pages.length <= 1) {
      setError("Cannot remove all pages from PDF.");
      return;
    }
    const updated = pages.filter((_, i) => i !== index);
    setPages(updated);
  }

  // Drag and Drop handlers for reordering
  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    movePage(draggedIndex, index);
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  async function handleSavePdf() {
    if (!file || pages.length === 0) return;

    setProcessing(true);
    setError("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const newIndices = pages.map((p) => p.originalIndex);
      const copiedPages = await newPdf.copyPages(srcPdf, newIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blobBytes = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(blobBytes).set(pdfBytes);
      const blob = new Blob([blobBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      setError("An error occurred while reorganizing the PDF pages.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-white text-neutral-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Organize PDF Pages</h1>
        <p className="text-neutral-600 mb-8">
          Drag and drop pages to reorder them or remove unwanted pages — processed 100% locally in your browser.
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
          <div className="text-3xl mb-3">🔀</div>
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

        {file && pages.length > 0 && (
          <div className="mt-6 border border-neutral-200 rounded-lg p-6 space-y-6 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <p className="font-semibold text-sm">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Size: {humanSize(file.size)} | Pages: <span className="font-semibold text-teal-600">{pages.length}</span>
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Drag cards to reorder or use arrows:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-3 border border-neutral-100 rounded-md bg-neutral-50">
                {pages.map((page, idx) => (
                  <div
                    key={page.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`p-3 rounded-lg border bg-white shadow-sm flex flex-col justify-between cursor-grab active:cursor-grabbing transition ${
                      draggedIndex === idx ? "opacity-40 border-teal-500" : "border-neutral-200 hover:border-teal-400"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        (Orig #{page.originalIndex + 1})
                      </span>
                    </div>

                    <div className="py-4 text-center text-xs text-neutral-500 font-medium">
                      Page {page.originalIndex + 1}
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-100 pt-2 text-xs">
                      <button
                        type="button"
                        onClick={() => movePage(idx, idx - 1)}
                        disabled={idx === 0}
                        className="px-1.5 py-0.5 text-neutral-600 hover:text-teal-600 disabled:opacity-30"
                        title="Move Left"
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePage(idx)}
                        className="text-red-500 hover:text-red-700 px-1"
                        title="Delete Page"
                      >
                        ✕
                      </button>
                      <button
                        type="button"
                        onClick={() => movePage(idx, idx + 1)}
                        disabled={idx === pages.length - 1}
                        className="px-1.5 py-0.5 text-neutral-600 hover:text-teal-600 disabled:opacity-30"
                        title="Move Right"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSavePdf}
              disabled={processing}
              className="w-full bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-md hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer"
            >
              {processing ? "Saving Reordered PDF..." : "Save Organized PDF"}
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

        {downloadUrl && file && (
          <div className="mt-6 border border-neutral-200 rounded-lg p-4 bg-teal-50/30">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-teal-900 block">Organized PDF Ready!</span>
                <span className="text-xs text-teal-700">{pages.length} pages in new order</span>
              </div>
              <a
                href={downloadUrl}
                download={file.name.replace(".pdf", "-organized.pdf")}
                className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-teal-700 transition"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12">
          Page organizing runs locally in your browser. Nothing is uploaded to a server.
        </p>
      </div>
    </div>
  );
}
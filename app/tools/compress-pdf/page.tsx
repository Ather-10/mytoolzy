"use client";
import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function humanSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  async function handleFile(selectedFile: File) {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setDownloadUrl(null);
    setError("");
    setProcessing(true);

    try {
      const bytes = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { updateMetadata: false });

      // Strip metadata to shave off extra size
      pdf.setTitle("");
      pdf.setAuthor("");
      pdf.setSubject("");
      pdf.setKeywords([]);
      pdf.setProducer("");
      pdf.setCreator("");

      const compressedBytes = await pdf.save({
        useObjectStreams: true,
      });

      const blobBytes = new ArrayBuffer(compressedBytes.byteLength);
      new Uint8Array(blobBytes).set(compressedBytes);
      const blob = new Blob([blobBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setCompressedSize(blob.size);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Make sure this is a valid PDF file.");
    } finally {
      setProcessing(false);
    }
  }

  const pct =
    originalSize > 0 && compressedSize > 0
      ? ((originalSize - compressedSize) / originalSize) * 100
      : null;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" className="text-lg font-bold text-teal-600">MyToolzy</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Compress PDF</h1>
        <p className="text-neutral-600 mb-8">
          Reduce your PDF file size — works best on text-heavy documents.
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
          <div className="text-3xl mb-3">⬆</div>
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

        {processing && <p className="mt-6 text-neutral-500 text-sm">Compressing...</p>}
        {error && <p className="mt-6 text-red-500 text-sm">{error}</p>}

        {downloadUrl && file && (
          <div className="mt-6 border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium truncate">{file.name}</span>
              
              <a  href={downloadUrl}
                download={file.name.replace(".pdf", "-compressed.pdf")}
                className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-teal-700"
              >
                Download
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <span className="line-through opacity-60">{humanSize(originalSize)}</span>
              <span>→</span>
              <span className="font-semibold text-neutral-900">{humanSize(compressedSize)}</span>
              {pct !== null && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    pct >= 0 ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {pct >= 0 ? "−" : "+"}
                  {Math.abs(pct).toFixed(0)}%
                </span>
              )}
            </div>
            {pct !== null && pct < 5 && (
              <p className="text-xs text-neutral-400 mt-2">
                This PDF is already well optimized, so size reduction is minimal.
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12">
          Compression runs locally in your browser. Nothing is uploaded to a server.
        </p>
      </div>
    </div>
  );
}
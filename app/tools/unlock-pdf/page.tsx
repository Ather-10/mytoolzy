"use client";

import { useState, useRef } from "react";

export default function UnlockPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>("");
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
  }

  async function handleUnlockPdf() {
    if (!file) return;

    setProcessing(true);
    setError("");

    try {
      const { jsPDF } = await import("jspdf");
      // @ts-ignore
      const pdfjsLib = await import("pdfjs-dist");

      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        password: password,
      });

      const pdfDoc = await loadingTask.promise;
      const totalPages = pdfDoc.numPages;

      let doc: any = null;

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfDoc.getPage(i);
        
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const renderViewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = renderViewport.width;
        canvas.height = renderViewport.height;

        if (context) {
          const renderParams: any = {
            canvasContext: context,
            viewport: renderViewport,
            canvas: canvas,
          };

          await page.render(renderParams).promise;
          const imgData = canvas.toDataURL("image/jpeg", 0.95);

          const orientation = unscaledViewport.width > unscaledViewport.height ? "landscape" : "portrait";
          
          const pdfWidth = unscaledViewport.width;
          const pdfHeight = unscaledViewport.height;

          if (i === 1) {
            doc = new jsPDF({
              orientation,
              unit: "pt",
              format: [pdfWidth, pdfHeight],
            });
            doc.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
          } else {
            doc.addPage([pdfWidth, pdfHeight], orientation);
            doc.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
          }
        }
      }

      if (doc) {
        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      }
    } catch (err: any) {
      console.error(err);
      setError("Incorrect password or failed to unlock file.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-white text-neutral-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Unlock PDF</h1>
        <p className="text-neutral-600 mb-8">
          Remove password security while preserving 100% of your PDF content — processed in your browser.
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
          <div className="text-3xl mb-3">🔓</div>
          <p className="font-semibold mb-1">Drop your protected PDF here</p>
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

        {file && (
          <div className="mt-6 border border-neutral-200 rounded-lg p-6 space-y-6 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <p className="font-semibold text-sm">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">Size: {humanSize(file.size)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                PDF Password (if encrypted):
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:border-teal-600 bg-white text-neutral-900"
              />
            </div>

            <button
              onClick={handleUnlockPdf}
              disabled={processing}
              className="w-full bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-md hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer"
            >
              {processing ? "Unlocking PDF..." : "Remove Password & Unlock"}
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

        {downloadUrl && file && (
          <div className="mt-6 border border-neutral-200 rounded-lg p-4 bg-teal-50/30">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-teal-900 block">PDF Unlocked!</span>
                <span className="text-xs text-teal-700">100% original size & text intact</span>
              </div>
              <a
                href={downloadUrl}
                download={file.name.replace(".pdf", "-unlocked.pdf")}
                className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-teal-700 transition"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12">
          File decryption runs locally in your browser. Nothing is uploaded to a server.
        </p>
      </div>
    </div>
  );
}
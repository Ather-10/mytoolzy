"use client";

import { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";

export default function CropPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [applyTo, setApplyTo] = useState<"all" | "current">("all");

  // Crop Box Coordinates (% based for responsive drag & visual box)
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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
    setPageIndex(1);
  }

  // Render Page Preview on Canvas safely cancelling active tasks
  useEffect(() => {
    if (!file) return;

    let isMounted = true;

    async function renderPage() {
      try {
        // @ts-ignore
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        if (!file) return;
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        if (isMounted) {
          setTotalPages(pdfDoc.numPages);
        }

        const page = await pdfDoc.getPage(pageIndex);
        const viewport = page.getViewport({ scale: 1.2 });

        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // Cancel previous render task if active
          if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
          }

          if (context) {
            const renderTask = page.render({
              canvasContext: context,
              viewport,
              canvas,
            } as any);

            renderTaskRef.current = renderTask;

            await renderTask.promise.catch((err: any) => {
              if (err?.name !== "RenderingCancelledException") {
                console.error(err);
              }
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    renderPage();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [file, pageIndex]);

  // Handle Box Drag
  function handleMouseDown(e: React.MouseEvent) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left - (cropBox.x * rect.width) / 100,
      y: e.clientY - rect.top - (cropBox.y * rect.height) / 100,
    });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    let newX = ((e.clientX - rect.left - dragStart.x) / rect.width) * 100;
    let newY = ((e.clientY - rect.top - dragStart.y) / rect.height) * 100;

    newX = Math.max(0, Math.min(newX, 100 - cropBox.width));
    newY = Math.max(0, Math.min(newY, 100 - cropBox.height));

    setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  async function handleCropPdf() {
    if (!file) return;

    setProcessing(true);
    setError("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      pages.forEach((page, idx) => {
        if (applyTo === "current" && idx + 1 !== pageIndex) return;

        const { width, height } = page.getSize();

        // Convert percentage crop values to PDF Points coordinates
        const cropX = (cropBox.x / 100) * width;
        const cropY = ((100 - cropBox.y - cropBox.height) / 100) * height;
        const cropWidth = (cropBox.width / 100) * width;
        const cropHeight = (cropBox.height / 100) * height;

        page.setCropBox(cropX, cropY, cropWidth, cropHeight);
      });

      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
      const blobData = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(blobData).set(pdfBytes);
      const blob = new Blob([blobData], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while cropping the PDF.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-white text-neutral-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Crop PDF Margins</h1>
        <p className="text-neutral-600 mb-8">
          Click and drag to select the exact page area you want to keep — processed 100% locally in your browser.
        </p>

        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-neutral-200 rounded-xl p-16 text-center cursor-pointer hover:border-teal-400 transition-colors bg-white max-w-3xl mx-auto"
          >
            <div className="text-3xl mb-3">✂️</div>
            <p className="font-semibold mb-1">Drop your PDF file here</p>
            <p className="text-sm text-neutral-500">
              or <span className="text-teal-600 underline">choose PDF file</span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {file && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Visual Canvas Interactive Area */}
            <div className="lg:col-span-2 bg-neutral-50 rounded-xl p-6 flex flex-col items-center justify-center min-h:500px; border border-neutral-200 relative select-none">
              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="relative cursor-crosshair border border-neutral-200 shadow-sm bg-white overflow-hidden"
              >
                <canvas ref={canvasRef} className="block max-w-full h-auto" />

                {/* Interactive Drag & Drop Crop Box */}
                <div
                  onMouseDown={handleMouseDown}
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.width}%`,
                    height: `${cropBox.height}%`,
                  }}
                  className="absolute border-2 border-teal-600 bg-teal-600/15 cursor-move transition-none flex items-center justify-center"
                >
                  <span className="bg-teal-600 text-white text-[10px] px-2 py-0.5 rounded font-medium shadow pointer-events-none">
                    Crop Box
                  </span>
                </div>
              </div>

              {/* Page Navigation */}
              {totalPages > 1 && (
                <div className="flex items-center gap-4 mt-6 bg-white px-4 py-2 rounded-md border border-neutral-200 text-xs font-medium">
                  <button
                    disabled={pageIndex <= 1}
                    onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40"
                  >
                    ◀ Prev
                  </button>
                  <span>
                    Page {pageIndex} of {totalPages}
                  </span>
                  <button
                    disabled={pageIndex >= totalPages}
                    onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                    className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40"
                  >
                    Next ▶
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar Controls */}
            <div className="border border-neutral-200 rounded-xl p-6 space-y-6 bg-white">
              <div>
                <p className="font-semibold text-sm">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">Size: {humanSize(file.size)}</p>
              </div>

              {/* Scope Selection */}
              <div className="space-y-2 border-t border-neutral-100 pt-4">
                <label className="block text-xs font-semibold text-neutral-700">Apply Crop To:</label>
                <div className="space-y-1.5 text-xs text-neutral-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="applyTo"
                      checked={applyTo === "all"}
                      onChange={() => setApplyTo("all")}
                      className="accent-teal-600"
                    />
                    All pages
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="applyTo"
                      checked={applyTo === "current"}
                      onChange={() => setApplyTo("current")}
                      className="accent-teal-600"
                    />
                    Current page ({pageIndex})
                  </label>
                </div>
              </div>

              {/* Dimension Adjustment */}
              <div className="space-y-2 border-t border-neutral-100 pt-4">
                <label className="block text-xs font-semibold text-neutral-700">Manual Crop Box (%)</label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-neutral-500">Width</span>
                    <input
                      type="number"
                      min={20}
                      max={100}
                      value={cropBox.width}
                      onChange={(e) => setCropBox((p) => ({ ...p, width: Math.min(100, Number(e.target.value)) }))}
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs mt-1 bg-white focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500">Height</span>
                    <input
                      type="number"
                      min={20}
                      max={100}
                      value={cropBox.height}
                      onChange={(e) => setCropBox((p) => ({ ...p, height: Math.min(100, Number(e.target.value)) }))}
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs mt-1 bg-white focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCropPdf}
                disabled={processing}
                className="w-full bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-md hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer"
              >
                {processing ? "Cropping PDF..." : "Crop PDF"}
              </button>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              {downloadUrl && (
                <div className="border border-neutral-200 rounded-lg p-4 bg-teal-50/30 space-y-2">
                  <span className="text-xs font-medium text-teal-900 block">PDF Cropped Successfully!</span>
                  <a
                    href={downloadUrl}
                    download={file.name.replace(".pdf", "-cropped.pdf")}
                    className="block w-full text-center bg-teal-600 text-white text-xs font-semibold py-2 rounded hover:bg-teal-700 transition"
                  >
                    Download PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12">
          File cropping runs locally in your browser. Nothing is uploaded to a server.
        </p>
      </div>
    </div>
  );
}
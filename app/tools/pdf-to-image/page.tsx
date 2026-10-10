"use client";

import { useState, useRef } from "react";

interface RenderedImage {
  pageIndex: number;
  dataUrl: string;
}

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageFormat, setImageFormat] = useState<"image/jpeg" | "image/png">("image/jpeg");
  const [scale, setScale] = useState<number>(2.0); // 2.0 scale for crisp HD quality
  const [renderedImages, setRenderedImages] = useState<RenderedImage[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
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
    setRenderedImages([]);
    setError("");
  }

  async function handleConvertToImages() {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError("");
    setRenderedImages([]);

    try {
      // @ts-ignore
      const pdfjsLib = await import("pdfjs-dist");

      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdfDoc.numPages;

      const extractedList: RenderedImage[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
          const renderParams: any = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          };

          await page.render(renderParams).promise;
          const dataUrl = canvas.toDataURL(imageFormat, 0.95);

          extractedList.push({
            pageIndex: i,
            dataUrl,
          });
        }

        setProgress(Math.round((i / totalPages) * 100));
      }

      setRenderedImages(extractedList);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while converting the PDF pages to images.");
    } finally {
      setProcessing(false);
    }
  }

  function downloadSingleImage(dataUrl: string, pageNum: number) {
    if (!file) return;
    const ext = imageFormat === "image/jpeg" ? "jpg" : "png";
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${baseName}-page-${pageNum}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="w-full min-h-screen bg-white text-neutral-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">PDF to Image Converter</h1>
        <p className="text-neutral-600 mb-8">
          Convert PDF pages into high-resolution JPG or PNG images — 100% locally in your browser.
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
          <div className="text-3xl mb-3">📄 ➔ 🖼️</div>
          <p className="font-semibold mb-1">Drop your PDF here</p>
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

        {file && (
          <div className="mt-6 border border-neutral-200 rounded-lg p-6 space-y-6 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <p className="font-semibold text-sm">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">Size: {humanSize(file.size)}</p>
              </div>
            </div>

            {/* Conversion Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-md border border-neutral-100">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Image Format:</label>
                <select
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs bg-white focus:outline-none"
                >
                  <option value="image/jpeg">JPG (Smaller Size)</option>
                  <option value="image/png">PNG (High Quality Transparent)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Resolution / Quality:</label>
                <select
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs bg-white focus:outline-none"
                >
                  <option value={1.5}>Normal (1.5x HD)</option>
                  <option value={2.0}>High Quality (2.0x Ultra HD)</option>
                  <option value={3.0}>Extreme Sharp (3.0x Maximum Quality)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleConvertToImages}
              disabled={processing}
              className="w-full bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-md hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer"
            >
              {processing ? `Converting Pages... (${progress}%)` : "Convert PDF to Images"}
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

        {renderedImages.length > 0 && (
          <div className="mt-8 border border-neutral-200 rounded-lg p-6 bg-white space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-sm font-medium text-neutral-800">
                Converted Pages: <span className="text-teal-600 font-bold">{renderedImages.length}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {renderedImages.map((img) => (
                <div key={img.pageIndex} className="border border-neutral-200 rounded-lg p-3 bg-neutral-50 flex flex-col justify-between">
                  <div>
                    <img src={img.dataUrl} alt={`Page ${img.pageIndex}`} className="w-full h-auto rounded border border-neutral-200 mb-2" />
                    <p className="text-xs font-semibold text-center text-neutral-600 mb-2">Page {img.pageIndex}</p>
                  </div>
                  <button
                    onClick={() => downloadSingleImage(img.dataUrl, img.pageIndex)}
                    className="w-full bg-teal-600 text-white text-xs font-semibold py-1.5 rounded hover:bg-teal-700 transition"
                  >
                    Download Page {img.pageIndex}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12">
          Conversion runs locally in your browser. Nothing is uploaded to a server.
        </p>
      </div>
    </div>
  );
}
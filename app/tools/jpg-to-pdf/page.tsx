"use client";

import { useState, useRef } from "react";
import { jsPDF } from "jspdf";

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

export default function JpgToPdf() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "fit">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState<number>(10);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(selectedFiles: FileList | File[]) {
    const validImages: ImageFile[] = [];
    
    Array.from(selectedFiles).forEach((f) => {
      if (f.type.startsWith("image/")) {
        validImages.push({
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
          previewUrl: URL.createObjectURL(f),
        });
      }
    });

    if (validImages.length === 0) {
      setError("Please select valid image files (JPG, PNG, WebP).");
      return;
    }

    setImages((prev) => [...prev, ...validImages]);
    setDownloadUrl(null);
    setError("");
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  function moveImage(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setImages(updated);
  }

  async function handleConvertToPdf() {
    if (images.length === 0) return;

    setProcessing(true);
    setError("");

    try {
      let doc: jsPDF | null = null;

      for (let i = 0; i < images.length; i++) {
        const imgItem = images[i];
        
        // Load image to get original dimensions
        const img = document.createElement("img");
        img.src = imgItem.previewUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        let pdfWidth = 595.28; // Standard A4 width in pt
        let pdfHeight = 841.89; // Standard A4 height in pt

        if (pageSize === "fit") {
          pdfWidth = imgWidth;
          pdfHeight = imgHeight;
        } else if (orientation === "landscape") {
          pdfWidth = 841.89;
          pdfHeight = 595.28;
        }

        if (i === 0) {
          doc = new jsPDF({
            orientation: pageSize === "fit" ? (imgWidth > imgHeight ? "landscape" : "portrait") : orientation,
            unit: "pt",
            format: pageSize === "fit" ? [pdfWidth, pdfHeight] : "a4",
          });
        } else if (doc) {
          doc.addPage(
            pageSize === "fit" ? [pdfWidth, pdfHeight] : "a4",
            pageSize === "fit" ? (imgWidth > imgHeight ? "landscape" : "portrait") : orientation
          );
        }

        if (doc) {
          const availWidth = pdfWidth - margin * 2;
          const availHeight = pdfHeight - margin * 2;

          const widthRatio = availWidth / imgWidth;
          const heightRatio = availHeight / imgHeight;
          const ratio = Math.min(widthRatio, heightRatio);

          const finalWidth = imgWidth * ratio;
          const finalHeight = imgHeight * ratio;

          const x = (pdfWidth - finalWidth) / 2;
          const y = (pdfHeight - finalHeight) / 2;

          const format = imgItem.file.type === "image/png" ? "PNG" : "JPEG";
          doc.addImage(imgItem.previewUrl, format, x, y, finalWidth, finalHeight);
        }
      }

      if (doc) {
        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while converting images to PDF.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-white text-neutral-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">JPG to PDF Converter</h1>
        <p className="text-neutral-600 mb-8">
          Convert JPG, PNG, and WebP images into a single PDF document — 100% locally in your browser.
        </p>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-neutral-200 rounded-xl p-10 text-center cursor-pointer hover:border-teal-400 transition-colors bg-white"
        >
          <div className="text-3xl mb-3">🖼️</div>
          <p className="font-semibold mb-1">Drop your images here</p>
          <p className="text-sm text-neutral-500">
            or <span className="text-teal-600 underline">choose image files</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        {images.length > 0 && (
          <div className="mt-6 border border-neutral-200 rounded-lg p-6 space-y-6 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <p className="font-semibold text-sm">
                Selected Images: <span className="text-teal-600">{images.length}</span>
              </p>
              <button
                type="button"
                onClick={() => setImages([])}
                className="text-xs text-red-500 hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Layout Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-md border border-neutral-100">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Page Size:</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs bg-white focus:outline-none"
                >
                  <option value="a4">Standard A4</option>
                  <option value="fit">Fit to Image Size</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Orientation:</label>
                <select
                  value={orientation}
                  disabled={pageSize === "fit"}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs bg-white focus:outline-none disabled:opacity-50"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Margin (pt):</label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs bg-white focus:outline-none"
                >
                  <option value={0}>No Margin</option>
                  <option value={10}>Small Margin (10pt)</option>
                  <option value={20}>Big Margin (20pt)</option>
                </select>
              </div>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-2 border border-neutral-100 rounded-md bg-neutral-50">
              {images.map((img, idx) => (
                <div key={img.id} className="relative group bg-white border border-neutral-200 rounded-md p-2 flex flex-col justify-between">
                  <img src={img.previewUrl} alt="preview" className="h-24 w-full object-cover rounded mb-2" />
                  <div className="flex items-center justify-between text-xs border-t border-neutral-100 pt-1">
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx - 1)}
                      disabled={idx === 0}
                      className="text-neutral-500 hover:text-teal-600 disabled:opacity-30 px-1"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="text-red-500 hover:text-red-700 px-1 font-bold"
                    >
                      ✕
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx + 1)}
                      disabled={idx === images.length - 1}
                      className="text-neutral-500 hover:text-teal-600 disabled:opacity-30 px-1"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleConvertToPdf}
              disabled={processing}
              className="w-full bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-md hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer"
            >
              {processing ? "Converting Images to PDF..." : "Convert to PDF"}
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

        {downloadUrl && (
          <div className="mt-6 border border-neutral-200 rounded-lg p-4 bg-teal-50/30">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-teal-900 block">PDF Ready!</span>
                <span className="text-xs text-teal-700">{images.length} image(s) converted successfully</span>
              </div>
              <a
                href={downloadUrl}
                download="images-converted.pdf"
                className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-teal-700 transition"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12">
          Image conversion runs locally in your browser. Nothing is uploaded to a server.
        </p>
      </div>
    </div>
  );
}
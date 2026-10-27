"use client";

import { useState, useRef } from "react";
import Head from "next/head";
import Link from "next/link";

type ImageItem = {
  id: string;
  file: File;
  originalSize: number;
  previewUrl: string;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  compressedSize: number;
};

export default function ImageCompressor() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState(70);
  const [format, setFormat] = useState("image/jpeg");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function humanSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function handleFiles(fileList: FileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    files.forEach((file) => {
      const id = "img-" + Math.random().toString(36).slice(2);
      const previewUrl = URL.createObjectURL(file);
      const newItem: ImageItem = {
        id,
        file,
        originalSize: file.size,
        previewUrl,
        compressedBlob: null,
        compressedUrl: null,
        compressedSize: 0,
      };
      setItems((prev) => [newItem, ...prev]);
      compressImage(newItem, quality, format);
    });
  }

  function compressImage(item: ImageItem, q: number, fmt: string) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const compressedUrl = URL.createObjectURL(blob);
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, compressedBlob: blob, compressedUrl, compressedSize: blob.size }
                : it
            )
          );
        },
        fmt,
        fmt === "image/png" ? undefined : q / 100
      );
    };
    img.src = item.previewUrl;
  }

  function recompressAll(q: number, fmt: string) {
    items.forEach((item) => compressImage(item, q, fmt));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function downloadItem(item: ImageItem) {
    if (!item.compressedUrl) return;
    const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
    const baseName = item.file.name.replace(/\.[^/.]+$/, "");
    const a = document.createElement("a");
    a.href = item.compressedUrl;
    a.download = `${baseName}-compressed.${ext}`;
    a.click();
  }

  const done = items.filter((i) => i.compressedBlob);
  const totalOriginal = done.reduce((s, i) => s + i.originalSize, 0);
  const totalCompressed = done.reduce((s, i) => s + i.compressedSize, 0);
  const savedPct = totalOriginal > 0 ? ((totalOriginal - totalCompressed) / totalOriginal) * 100 : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free Online Image Compress Tool - MyToolzy",
    url: "https://www.mytoolzy.online/tools/image-compressor",
    description: "Compress images online for free without losing quality. Easily image compress JPG, PNG, and WebP files locally in your browser.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <Head>
        <title>Free Online Image Compress Tool | Reduce Photo Size - MyToolzy</title>
        <meta
          name="description"
          content="Use our free online image compress tool to reduce JPG, PNG, and WebP photo sizes without quality loss. 100% private, client-side image compression."
        />
        <meta name="keywords" content="image compress, compress image online, free image compressor, reduce photo size, JPG compress, PNG compress, WebP compressor" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <main className="bg-white text-neutral-900">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-neutral-900">
            Free Online Image Compress Tool
          </h1>
          <p className="text-neutral-600 mb-8 text-sm md:text-base leading-relaxed">
            Quickly <strong>image compress</strong> your photos, screenshots, and graphics without losing visual quality. Reduce JPG, PNG, and WebP file sizes locally inside your browser with 100% complete privacy.
          </p>

          {/* Dropzone */}
          <section aria-label="Upload and Compress Images">
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
                if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                dragActive ? "border-teal-500 bg-teal-50" : "border-neutral-200 hover:border-teal-400"
              }`}
            >
              <p className="font-semibold mb-1 text-base text-neutral-800">Drop images here to compress</p>
              <p className="text-sm text-neutral-500">
                or <span className="text-teal-600 underline">choose files</span> — JPG, PNG, or WebP
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </div>
          </section>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-6 mt-6">
            <div className="flex-1 min-w-[200px]">
              <div className="flex justify-between text-sm text-neutral-600 mb-2">
                <span>Compression Quality</span>
                <span className="font-semibold text-neutral-900">{quality}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={95}
                value={quality}
                onChange={(e) => {
                  const q = Number(e.target.value);
                  setQuality(q);
                  recompressAll(q, format);
                }}
                className="w-full accent-teal-600 cursor-pointer"
                aria-label="Adjust image compression quality"
              />
            </div>
            <select
              value={format}
              onChange={(e) => {
                setFormat(e.target.value);
                recompressAll(quality, e.target.value);
              }}
              className="border border-neutral-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-600"
              aria-label="Select output format"
            >
              <option value="image/jpeg">Save as JPG</option>
              <option value="image/webp">Save as WebP</option>
              <option value="image/png">Save as PNG</option>
            </select>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-3 mt-8">
            {items.map((item) => {
              const pct =
                item.compressedSize > 0
                  ? ((item.originalSize - item.compressedSize) / item.originalSize) * 100
                  : null;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border border-neutral-200 rounded-lg p-3"
                >
                  <img
                    src={item.compressedUrl || item.previewUrl}
                    className="w-14 h-14 rounded object-cover bg-neutral-100"
                    alt={`Compressed preview of ${item.file.name}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.file.name}</p>
                    {pct !== null ? (
                      <div className="flex items-center gap-2 text-sm text-neutral-500 flex-wrap">
                        <span className="line-through opacity-60">{humanSize(item.originalSize)}</span>
                        <span>→</span>
                        <span className="font-semibold text-neutral-900">{humanSize(item.compressedSize)}</span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            pct >= 0 ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
                          }`}
                        >
                          {pct >= 0 ? "−" : "+"}
                          {Math.abs(pct).toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 italic">Compressing image...</p>
                    )}
                  </div>
                  {item.compressedBlob && (
                    <button
                      onClick={() => downloadItem(item)}
                      className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-teal-700 transition"
                    >
                      Download
                    </button>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-neutral-400 hover:text-red-500 text-xl leading-none px-1"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {done.length > 0 && (
            <div className="flex justify-between items-center mt-6 text-sm text-neutral-500">
              <span>
                {done.length} image{done.length > 1 ? "s" : ""} ·{" "}
                <span className="text-teal-700 font-semibold">{savedPct.toFixed(0)}% smaller</span> on average
              </span>
            </div>
          )}

          <p className="text-xs text-neutral-400 mt-8 border-b border-neutral-100 pb-8">
            Privacy Guarantee: Compression runs locally in your web browser. Nothing is uploaded to any server.
          </p>

          {/* Detailed SEO Content Section */}
          <article className="mt-12 space-y-8 text-neutral-800">
            <header>
              <h2 className="text-2xl font-bold mb-3 text-neutral-900">
                Why Should You Image Compress Files Online?
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Large image file sizes slow down web page load speed, decrease website SEO rankings, and consume high bandwidth. When you <strong>image compress</strong> photos before uploading them to web servers, you boost user experience and optimize page rendering times.
              </p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                <h3 className="font-bold text-base mb-1 text-teal-700">100% Client-Side Security</h3>
                <p className="text-xs text-neutral-600">
                  Your image files are processed using HTML5 Canvas directly in your browser. Zero uploads to external servers.
                </p>
              </div>
              <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                <h3 className="font-bold text-base mb-1 text-teal-700">Custom Quality Control</h3>
                <p className="text-xs text-neutral-600">
                  Easily adjust the image compression ratio to balance smaller file size with sharp image clarity.
                </p>
              </div>
              <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                <h3 className="font-bold text-base mb-1 text-teal-700">Batch Processing</h3>
                <p className="text-xs text-neutral-600">
                  Compress multiple JPG, PNG, and WebP images simultaneously in one batch operation.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 text-neutral-900">
                How to Compress Images Online Step-by-Step
              </h2>
              <ol className="list-decimal list-inside text-sm text-neutral-600 space-y-2">
                <li>
                  <strong>Select Files:</strong> Drag and drop your images into the compression area above.
                </li>
                <li>
                  <strong>Set Quality:</strong> Drag the quality slider to adjust target compression level.
                </li>
                <li>
                  <strong>Choose Format:</strong> Convert to JPG, PNG, or modern WebP format.
                </li>
                <li>
                  <strong>Save File:</strong> Click Download to get your compressed image file instantly.
                </li>
              </ol>
            </section>

            <section className="pt-4 border-t border-neutral-200">
              <h2 className="text-xl font-bold mb-4 text-neutral-900">
                Frequently Asked Questions (FAQs)
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-neutral-800">Is this online image compress tool free?</h3>
                  <p className="text-neutral-600 text-xs mt-0.5">
                    Yes, MyToolzy’s image compressor is completely free with no file limits.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800">Are my photos stored on any server?</h3>
                  <p className="text-neutral-600 text-xs mt-0.5">
                    No, all operations happen locally inside your web browser.
                  </p>
                </div>
              </div>
            </section>

            {/* Clean Internal Linking Section (No Emojis) */}
            <section className="pt-8 border-t border-neutral-200">
              <h2 className="text-xl font-bold mb-4 text-neutral-900">
                Related Free Online Tools
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <Link href="/tools/image-resizer" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Image Resizer
                </Link>
                <Link href="/tools/image-cropper-converter" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Image Cropper & Converter
                </Link>
                <Link href="/tools/jpg-to-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  JPG to PDF
                </Link>
                <Link href="/tools/pdf-to-image" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  PDF to Image
                </Link>
                <Link href="/tools/compress-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Compress PDF
                </Link>
                <Link href="/tools/crop-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Crop PDF
                </Link>
                <Link href="/tools/qr-code-generator" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  QR Code Generator
                </Link>
                <Link href="/tools/ai-pdf-summarizer" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  AI PDF Summarizer
                </Link>
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
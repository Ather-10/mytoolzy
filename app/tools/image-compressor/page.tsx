"use client";
import { useState, useRef } from "react";

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

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Simple header */}
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" className="text-lg font-bold text-teal-600">MyToolzy</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Image Compressor</h1>
        <p className="text-neutral-600 mb-8">
          Drop in a photo, adjust quality, and download a smaller file — everything happens in your browser.
        </p>

        {/* Dropzone */}
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
          <div className="text-3xl mb-3">⬆</div>
          <p className="font-semibold mb-1">Drop images here</p>
          <p className="text-sm text-neutral-500">
            or <span className="text-teal-600 underline">choose files</span> — JPG, PNG or WebP
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

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-6 mt-6">
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between text-sm text-neutral-600 mb-2">
              <span>Quality</span>
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
              className="w-full accent-teal-600"
            />
          </div>
          <select
            value={format}
            onChange={(e) => {
              setFormat(e.target.value);
              recompressAll(quality, e.target.value);
            }}
            className="border border-neutral-200 rounded-md px-3 py-2 text-sm"
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
                  alt=""
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
                    <p className="text-sm text-neutral-400 italic">Compressing…</p>
                  )}
                </div>
                {item.compressedBlob && (
                  <button
                    onClick={() => downloadItem(item)}
                    className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-teal-700"
                  >
                    Download
                  </button>
                )}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-neutral-400 hover:text-red-500 text-xl leading-none px-1"
                  aria-label="Remove"
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

        <p className="text-xs text-neutral-400 mt-12">
          Compression runs locally using your browser. Nothing is uploaded — refresh the page and your images are gone.
        </p>
      </div>
    </div>
  );
}
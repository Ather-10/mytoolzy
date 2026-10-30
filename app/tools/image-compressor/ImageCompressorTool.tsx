"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import JSZip from "jszip";

type Mode = "quality" | "targetKb";

type ImageItem = {
  id: string;
  file: File;
  originalSize: number;
  previewUrl: string;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  compressedSize: number;
  isProcessing: boolean;
};

export default function ImageCompressorTool() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [mode, setMode] = useState<Mode>("quality");
  const [quality, setQuality] = useState(70);
  const [targetKb, setTargetKb] = useState(100);
  const [format, setFormat] = useState("image/jpeg");
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function humanSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  // Memory cleanup: revoke object URLs on item deletion or component unmount
  const cleanupUrls = useCallback((urls: (string | null)[]) => {
    urls.forEach((url) => {
      if (url && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      items.forEach((item) => {
        cleanupUrls([item.previewUrl, item.compressedUrl]);
      });
    };
  }, [items, cleanupUrls]);

  const compressSingle = useCallback(
    (file: File, previewUrl: string, currentQuality: number, currentFormat: string, targetSizeKb: number, currentMode: Mode): Promise<{ blob: Blob; url: string; size: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onerror = () => reject(new Error("Failed to load image file."));
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context creation failed."));
            return;
          }
          ctx.drawImage(img, 0, 0);

          if (currentMode === "targetKb" && currentFormat !== "image/png") {
            const targetBytes = targetSizeKb * 1024;
            let low = 0.05;
            let high = 0.95;
            let bestBlob: Blob | null = null;

            const binarySearch = (iterationsLeft: number) => {
              const mid = (low + high) / 2;
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error("Blob conversion failed."));
                    return;
                  }
                  bestBlob = blob;
                  if (iterationsLeft <= 0) {
                    const url = URL.createObjectURL(bestBlob);
                    resolve({ blob: bestBlob, url, size: bestBlob.size });
                    return;
                  }
                  if (blob.size > targetBytes) {
                    high = mid;
                  } else {
                    low = mid;
                  }
                  binarySearch(iterationsLeft - 1);
                },
                currentFormat,
                mid
              );
            };
            binarySearch(6); // 6 binary search iterations for fast precision
          } else {
            const q = currentFormat === "image/png" ? undefined : currentQuality / 100;
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Blob conversion failed."));
                  return;
                }
                const url = URL.createObjectURL(blob);
                resolve({ blob, url, size: blob.size });
              },
              currentFormat,
              q
            );
          }
        };
        img.src = previewUrl;
      });
    },
    []
  );

  const processFiles = useCallback(
    (files: File[]) => {
      setErrorMessage(null);
      const validFiles = files.filter((f) => f.type.startsWith("image/"));

      if (validFiles.length === 0) {
        setErrorMessage("Please select valid image files (JPG, PNG, WebP).");
        return;
      }

      validFiles.forEach((file) => {
        const id = "img-" + Math.random().toString(36).slice(2, 9);
        const previewUrl = URL.createObjectURL(file);

        const newItem: ImageItem = {
          id,
          file,
          originalSize: file.size,
          previewUrl,
          compressedBlob: null,
          compressedUrl: null,
          compressedSize: 0,
          isProcessing: true,
        };

        setItems((prev) => [newItem, ...prev]);

        compressSingle(file, previewUrl, quality, format, targetKb, mode)
          .then(({ blob, url, size }) => {
            setItems((prev) =>
              prev.map((it) =>
                it.id === id
                  ? {
                      ...it,
                      compressedBlob: blob,
                      compressedUrl: url,
                      compressedSize: size,
                      isProcessing: false,
                    }
                  : it
              )
            );
          })
          .catch((err) => {
            console.error(err);
            setItems((prev) => prev.filter((it) => it.id !== id));
            setErrorMessage("Failed to process one or more images.");
          });
      });
    },
    [compressSingle, quality, format, targetKb, mode]
  );

  // Debounced re-compression on option slider changes
  useEffect(() => {
    if (items.length === 0) return;

    const timer = setTimeout(() => {
      items.forEach((item) => {
        compressSingle(item.file, item.previewUrl, quality, format, targetKb, mode)
          .then(({ blob, url, size }) => {
            setItems((prev) =>
              prev.map((it) => {
                if (it.id === item.id) {
                  if (it.compressedUrl) URL.revokeObjectURL(it.compressedUrl);
                  return {
                    ...it,
                    compressedBlob: blob,
                    compressedUrl: url,
                    compressedSize: size,
                    isProcessing: false,
                  };
                }
                return it;
              })
            );
          })
          .catch((err) => console.error("Debounced recompression error:", err));
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [quality, targetKb, format, mode]);

  function removeItem(id: string) {
    const item = items.find((i) => i.id === id);
    if (item) {
      cleanupUrls([item.previewUrl, item.compressedUrl]);
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function downloadSingle(item: ImageItem) {
    if (!item.compressedUrl) return;
    const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
    const baseName = item.file.name.replace(/\.[^/.]+$/, "");
    const a = document.createElement("a");
    a.href = item.compressedUrl;
    a.download = `${baseName}-compressed.${ext}`;
    a.click();
  }

  async function downloadAllZip() {
    const readyItems = items.filter((i) => i.compressedBlob);
    if (readyItems.length === 0) return;

    setIsZipping(true);
    const zip = new JSZip();
    const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";

    readyItems.forEach((item, index) => {
      const baseName = item.file.name.replace(/\.[^/.]+$/, "");
      if (item.compressedBlob) {
        zip.file(`${baseName}-compressed-${index + 1}.${ext}`, item.compressedBlob);
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = zipUrl;
    a.download = "mytoolzy-compressed-images.zip";
    a.click();
    URL.revokeObjectURL(zipUrl);
    setIsZipping(false);
  }

  const doneItems = items.filter((i) => i.compressedBlob && !i.isProcessing);
  const totalOriginal = doneItems.reduce((s, i) => s + i.originalSize, 0);
  const totalCompressed = doneItems.reduce((s, i) => s + i.compressedSize, 0);
  const savedPct = totalOriginal > 0 ? ((totalOriginal - totalCompressed) / totalOriginal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Dropzone with Accessibility Role */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload images for compression"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files) {
            processFiles(Array.from(e.dataTransfer.files));
          }
        }}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-teal-600 bg-teal-50/60 scale-[1.01]"
            : "border-neutral-300 hover:border-teal-500 bg-neutral-50/50 hover:bg-white"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="font-semibold text-neutral-800 text-base mb-1">
          Drop photos here or click to browse
        </p>
        <p className="text-xs text-neutral-500">Supports JPG, PNG, and WebP up to 25MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && processFiles(Array.from(e.target.files))}
        />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium text-center">
          {errorMessage}
        </div>
      )}

      {/* Control Bar: Mode Toggle, Quality Slider, Format Select */}
      <div className="p-5 border border-neutral-200 rounded-xl bg-white space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("quality")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                mode === "quality"
                  ? "bg-teal-600 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Quality Ratio Mode
            </button>
            <button
              type="button"
              onClick={() => setMode("targetKb")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                mode === "targetKb"
                  ? "bg-teal-600 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Target KB Limit Mode
            </button>
          </div>

          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="border border-neutral-200 rounded-md px-3 py-1.5 text-xs bg-white text-neutral-800 font-medium focus:outline-none focus:border-teal-600 cursor-pointer"
            aria-label="Select compressed output image format"
          >
            <option value="image/jpeg">Output: JPG</option>
            <option value="image/webp">Output: WebP (Best Compression)</option>
            <option value="image/png">Output: PNG</option>
          </select>
        </div>

        {mode === "quality" ? (
          <div>
            <div className="flex justify-between text-xs text-neutral-600 font-medium mb-1.5">
              <span>Compression Level</span>
              <span className="font-bold text-neutral-900">{quality}% Quality</span>
            </div>
            <input
              type="range"
              min={10}
              max={95}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
              aria-label="Adjust image compression quality"
            />
          </div>
        ) : (
          <div>
            <div className="flex justify-between text-xs text-neutral-600 font-medium mb-1.5">
              <span>Target Upper File Limit</span>
              <span className="font-bold text-neutral-900">{targetKb} KB</span>
            </div>
            <input
              type="number"
              min={10}
              max={5000}
              value={targetKb}
              onChange={(e) => setTargetKb(Number(e.target.value))}
              className="w-full border border-neutral-200 rounded-md p-2 text-xs focus:outline-none focus:border-teal-600 bg-white"
              placeholder="e.g. 50, 100, 200"
            />
          </div>
        )}
      </div>

      {/* Results List */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 px-1">
            <span>Uploaded Images ({items.length})</span>
            {doneItems.length > 1 && (
              <button
                type="button"
                onClick={downloadAllZip}
                disabled={isZipping}
                className="text-teal-600 hover:text-teal-700 underline font-bold cursor-pointer disabled:opacity-50"
              >
                {isZipping ? "Generating ZIP..." : "Download All (ZIP Archive)"}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            {items.map((item) => {
              const pct =
                item.compressedSize > 0
                  ? ((item.originalSize - item.compressedSize) / item.originalSize) * 100
                  : null;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 border border-neutral-200 rounded-xl p-3 bg-white shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.compressedUrl || item.previewUrl}
                      alt={`Preview of ${item.file.name}`}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-100"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 truncate">
                        {item.file.name}
                      </p>
                      {item.isProcessing ? (
                        <p className="text-xs text-neutral-400 italic mt-0.5">Compressing image...</p>
                      ) : pct !== null ? (
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5 flex-wrap">
                          <span className="line-through opacity-50">{humanSize(item.originalSize)}</span>
                          <span>→</span>
                          <span className="font-bold text-neutral-900">{humanSize(item.compressedSize)}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pct >= 0 ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
                            }`}
                          >
                            {pct >= 0 ? "−" : "+"}
                            {Math.abs(pct).toFixed(0)}%
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.compressedUrl && !item.isProcessing && (
                      <button
                        type="button"
                        onClick={() => downloadSingle(item)}
                        className="bg-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-teal-700 transition cursor-pointer"
                      >
                        Download
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-neutral-400 hover:text-red-500 text-lg px-2 focus:outline-none"
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {doneItems.length > 0 && (
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600 flex justify-between items-center font-medium">
              <span>Overall Savings</span>
              <span className="text-teal-700 font-bold">
                {savedPct.toFixed(0)}% space saved ({humanSize(totalOriginal - totalCompressed)} total)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
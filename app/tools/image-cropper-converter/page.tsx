"use client";

import { useState, useRef, useEffect } from "react";

type ImageFormat = "image/png" | "image/jpeg" | "image/webp" | "image/avif";

export default function ImageCropperConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("image/png");
  const [quality, setQuality] = useState<number>(0.9);

  // Original image dimensions
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Crop Box Coordinates in percentages
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState<number | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Dragging states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; cropX: number; cropY: number; cropW: number; cropH: number }>({
    x: 0,
    y: 0,
    cropX: 0,
    cropY: 0,
    cropW: 0,
    cropH: 0,
  });

  function humanSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function handleFile(selectedFile: File) {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP, AVIF).");
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };

    setFile(selectedFile);
    setImageSrc(url);
    setDownloadUrl(null);
    setConvertedSize(null);
    setError("");
  }

  // Handle Box Dragging & Handle Resizing
  function handleMouseDown(e: React.MouseEvent, handle: string | null = null) {
    e.stopPropagation();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setIsDragging(true);
    setActiveHandle(handle);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      cropX: cropBox.x,
      cropY: cropBox.y,
      cropW: cropBox.width,
      cropH: cropBox.height,
    });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    let { cropX, cropY, cropW, cropH } = dragStart;

    if (!activeHandle) {
      // Move whole box
      let newX = Math.max(0, Math.min(cropX + deltaX, 100 - cropW));
      let newY = Math.max(0, Math.min(cropY + deltaY, 100 - cropH));
      setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
    } else {
      // Resize using corner handles
      if (activeHandle.includes("n")) {
        let newY = Math.max(0, Math.min(cropY + deltaY, cropY + cropH - 10));
        let newH = cropH + (cropY - newY);
        cropY = newY;
        cropH = newH;
      }
      if (activeHandle.includes("s")) {
        cropH = Math.max(10, Math.min(cropH + deltaY, 100 - cropY));
      }
      if (activeHandle.includes("w")) {
        let newX = Math.max(0, Math.min(cropX + deltaX, cropX + cropW - 10));
        let newW = cropW + (cropX - newX);
        cropX = newX;
        cropW = newW;
      }
      if (activeHandle.includes("e")) {
        cropW = Math.max(10, Math.min(cropW + deltaX, 100 - cropX));
      }

      setCropBox({ x: cropX, y: cropY, width: cropW, height: cropH });
    }
  }

  function handleMouseUp() {
    setIsDragging(false);
    setActiveHandle(null);
  }

  async function handleCropAndConvert() {
    if (!file || !imageSrc) return;

    setProcessing(true);
    setError("");

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Calculate pixel coordinates relative to actual natural resolution
      const sourceX = (cropBox.x / 100) * img.naturalWidth;
      const sourceY = (cropBox.y / 100) * img.naturalHeight;
      const sourceW = (cropBox.width / 100) * img.naturalWidth;
      const sourceH = (cropBox.height / 100) * img.naturalHeight;

      const canvas = document.createElement("canvas");
      canvas.width = sourceW;
      canvas.height = sourceH;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw cropped section
        ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setDownloadUrl(url);
              setConvertedSize(blob.size);
            } else {
              setError("Failed to convert image format.");
            }
            setProcessing(false);
          },
          targetFormat,
          quality
        );
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during cropping and conversion.");
      setProcessing(false);
    }
  }

  function getExtension(format: ImageFormat) {
    switch (format) {
      case "image/jpeg":
        return "jpg";
      case "image/webp":
        return "webp";
      case "image/avif":
        return "avif";
      default:
        return "png";
    }
  }

  return (
    <div className="w-full min-h-screen bg-white text-neutral-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Image Cropper & Format Converter</h1>
        <p className="text-neutral-600 mb-8">
          Crop images with interactive corner handles and convert to PNG, JPG, WebP, or AVIF formats — 100% locally in your browser.
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
            <div className="text-3xl mb-3">🖼️</div>
            <p className="font-semibold mb-1">Drop your image file here</p>
            <p className="text-sm text-neutral-500">
              or <span className="text-teal-600 underline">choose image file</span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {file && imageSrc && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Interactive Image Cropper Workspace */}
            <div className="lg:col-span-2 bg-neutral-50 rounded-xl p-6 flex flex-col items-center justify-center min-h:450px ; border border-neutral-200 relative select-none">
              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="relative border border-neutral-200 shadow-sm bg-white overflow-hidden max-w-full"
              >
                <img ref={imgRef} src={imageSrc} alt="Crop Preview" className="block max-w-full max-h:500px; object-contain" />

                {/* Interactive Crop Box with Handles */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, null)}
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.width}%`,
                    height: `${cropBox.height}%`,
                  }}
                  className="absolute border-2 border-teal-600 bg-teal-600/15 cursor-move transition-none"
                >
                  {/* Corner Resize Handles */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, "nw")}
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-teal-600 border border-white rounded-full cursor-nwse-resize"
                  />
                  <div
                    onMouseDown={(e) => handleMouseDown(e, "ne")}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-teal-600 border border-white rounded-full cursor-nesw-resize"
                  />
                  <div
                    onMouseDown={(e) => handleMouseDown(e, "sw")}
                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-teal-600 border border-white rounded-full cursor-nesw-resize"
                  />
                  <div
                    onMouseDown={(e) => handleMouseDown(e, "se")}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-teal-600 border border-white rounded-full cursor-nwse-resize"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="border border-neutral-200 rounded-xl p-6 space-y-6 bg-white">
              <div>
                <p className="font-semibold text-sm">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Original: {imgDimensions.width} × {imgDimensions.height} px ({humanSize(file.size)})
                </p>
              </div>

              {/* Target Format */}
              <div className="space-y-2 border-t border-neutral-100 pt-4">
                <label className="block text-xs font-semibold text-neutral-700">Output Format:</label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md text-xs bg-white focus:outline-none focus:border-teal-600"
                >
                  <option value="image/png">PNG (Lossless / Transparent)</option>
                  <option value="image/jpeg">JPG / JPEG (Standard Image)</option>
                  <option value="image/webp">WebP (Modern Optimized Web Format)</option>
                  <option value="image/avif">AVIF (Ultra Compression Modern)</option>
                </select>
              </div>

              {/* Quality Slider (for JPG, WebP, AVIF) */}
              {targetFormat !== "image/png" && (
                <div className="space-y-2 border-t border-neutral-100 pt-4">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-neutral-700">Quality / Compression:</label>
                    <span className="font-bold text-teal-600">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                </div>
              )}

              {/* Crop Box Manual Inputs */}
              <div className="space-y-2 border-t border-neutral-100 pt-4">
                <label className="block text-xs font-semibold text-neutral-700">Crop Area (%)</label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-neutral-500">Width</span>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={Math.round(cropBox.width)}
                      onChange={(e) => setCropBox((p) => ({ ...p, width: Math.min(100, Number(e.target.value)) }))}
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs mt-1 bg-white focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500">Height</span>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={Math.round(cropBox.height)}
                      onChange={(e) => setCropBox((p) => ({ ...p, height: Math.min(100, Number(e.target.value)) }))}
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs mt-1 bg-white focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCropAndConvert}
                disabled={processing}
                className="w-full bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-md hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer"
              >
                {processing ? "Processing Image..." : "Crop & Convert Image"}
              </button>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              {downloadUrl && (
                <div className="border border-neutral-200 rounded-lg p-4 bg-teal-50/30 space-y-2">
                  <div className="flex justify-between text-xs text-teal-900 font-medium">
                    <span>Image Converted!</span>
                    {convertedSize && <span>{humanSize(convertedSize)}</span>}
                  </div>
                  <a
                    href={downloadUrl}
                    download={`cropped-image.${getExtension(targetFormat)}`}
                    className="block w-full text-center bg-teal-600 text-white text-xs font-semibold py-2 rounded hover:bg-teal-700 transition"
                  >
                    Download Image ({getExtension(targetFormat).toUpperCase()})
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12">
          Cropping and conversion run locally in your browser. Nothing is uploaded to a server.
        </p>
      </div>
    </div>
  );
}
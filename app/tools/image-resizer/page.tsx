"use client";
import { useState, useRef, useEffect } from "react";

const PRESETS = [
  { label: "Instagram Post", w: 1080, h: 1080 },
  { label: "Instagram Story", w: 1080, h: 1920 },
  { label: "Facebook Cover", w: 820, h: 312 },
  { label: "YouTube Thumbnail", w: 1280, h: 720 },
  { label: "Profile Picture", w: 400, h: 400 },
  { label: "Twitter/X Post", w: 1600, h: 900 },
];

type Unit = "px" | "in" | "cm" | "mm";

function pxToUnit(px: number, unit: Unit, dpi: number): number {
  if (unit === "px") return px;
  if (unit === "in") return px / dpi;
  if (unit === "cm") return (px / dpi) * 2.54;
  if (unit === "mm") return (px / dpi) * 25.4;
  return px;
}

function unitToPx(value: number, unit: Unit, dpi: number): number {
  if (unit === "px") return Math.round(value);
  if (unit === "in") return Math.round(value * dpi);
  if (unit === "cm") return Math.round((value / 2.54) * dpi);
  if (unit === "mm") return Math.round((value / 25.4) * dpi);
  return Math.round(value);
}

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
  const [widthPx, setWidthPx] = useState(0);
  const [heightPx, setHeightPx] = useState(0);
  const [unit, setUnit] = useState<Unit>("px");
  const [dpi, setDpi] = useState(96);
  const [lockRatio, setLockRatio] = useState(true);
  const [format, setFormat] = useState("image/jpeg");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function humanSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function handleFile(selectedFile: File) {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImgEl(img);
        setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight });
        setWidthPx(img.naturalWidth);
        setHeightPx(img.naturalHeight);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  }

  function handleWidthInput(displayValue: number) {
    const newWidthPx = unitToPx(displayValue, unit, dpi);
    setWidthPx(newWidthPx);
    if (lockRatio && originalDims.w > 0) {
      setHeightPx(Math.round((newWidthPx / originalDims.w) * originalDims.h));
    }
  }

  function handleHeightInput(displayValue: number) {
    const newHeightPx = unitToPx(displayValue, unit, dpi);
    setHeightPx(newHeightPx);
    if (lockRatio && originalDims.h > 0) {
      setWidthPx(Math.round((newHeightPx / originalDims.h) * originalDims.w));
    }
  }

  function applyPreset(w: number, h: number) {
    setWidthPx(w);
    setHeightPx(h);
  }

  function applyPercent(percent: number) {
    setWidthPx(Math.round(originalDims.w * (percent / 100)));
    setHeightPx(Math.round(originalDims.h * (percent / 100)));
  }

  useEffect(() => {
    if (!imgEl || !widthPx || !heightPx) return;
    const canvas = document.createElement("canvas");
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(imgEl, 0, 0, widthPx, heightPx);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setResultUrl(URL.createObjectURL(blob));
        setResultSize(blob.size);
      },
      format,
      0.9
    );
  }, [imgEl, widthPx, heightPx, format]);

  function download() {
    if (!resultUrl || !file) return;
    const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${baseName}-resized.${ext}`;
    a.click();
  }

  const displayWidth = unit === "px" ? widthPx : Number(pxToUnit(widthPx, unit, dpi).toFixed(2));
  const displayHeight = unit === "px" ? heightPx : Number(pxToUnit(heightPx, unit, dpi).toFixed(2));

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" className="text-lg font-bold text-teal-600">MyToolzy</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Image Resizer</h1>
        <p className="text-neutral-600 mb-8">
          Resize images to exact dimensions, in pixels, inches, cm or mm.
        </p>

        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-neutral-200 rounded-xl p-12 text-center cursor-pointer hover:border-teal-400 transition-colors"
          >
            <div className="text-3xl mb-3">⬆</div>
            <p className="font-semibold mb-1">Drop an image here</p>
            <p className="text-sm text-neutral-500">
              or <span className="text-teal-600 underline">choose file</span> — JPG, PNG or WebP
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {file && (
          <>
            {/* Presets */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Quick presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p.w, p.h)}
                    className="text-xs font-medium border border-neutral-200 rounded-full px-3 py-1.5 hover:border-teal-400"
                  >
                    {p.label} ({p.w}×{p.h})
                  </button>
                ))}
              </div>
            </div>

            {/* Percent shortcuts */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Scale by percentage</p>
              <div className="flex flex-wrap gap-2">
                {[25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => applyPercent(p)}
                    className="text-xs font-medium border border-neutral-200 rounded-full px-3 py-1.5 hover:border-teal-400"
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            {/* Unit + DPI */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as Unit)}
                  className="w-full border border-neutral-200 rounded-md p-2 text-sm"
                >
                  <option value="px">Pixels (px)</option>
                  <option value="in">Inches (in)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="mm">Millimeters (mm)</option>
                </select>
              </div>
              {unit !== "px" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Resolution (DPI)</label>
                  <select
                    value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value))}
                    className="w-full border border-neutral-200 rounded-md p-2 text-sm"
                  >
                    <option value={72}>72 (Web)</option>
                    <option value={96}>96 (Screen)</option>
                    <option value={150}>150 (Draft print)</option>
                    <option value={300}>300 (Print quality)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Manual width/height */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Width ({unit})</label>
                <input
                  type="number"
                  value={displayWidth}
                  onChange={(e) => handleWidthInput(Number(e.target.value))}
                  className="w-full border border-neutral-200 rounded-md p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Height ({unit})</label>
                <input
                  type="number"
                  value={displayHeight}
                  onChange={(e) => handleHeightInput(Number(e.target.value))}
                  className="w-full border border-neutral-200 rounded-md p-2 text-sm"
                />
              </div>
            </div>

            {unit !== "px" && (
              <p className="text-xs text-neutral-400 mb-4">
                = {widthPx} × {heightPx} pixels at {dpi} DPI
              </p>
            )}

            <label className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
              <input
                type="checkbox"
                checked={lockRatio}
                onChange={(e) => setLockRatio(e.target.checked)}
                className="accent-teal-600"
              />
              Lock aspect ratio
            </label>

            {/* Format */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Output format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="border border-neutral-200 rounded-md px-3 py-2 text-sm"
              >
                <option value="image/jpeg">JPG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
              </select>
            </div>

            {/* Preview + download */}
            {resultUrl && (
              <div className="border border-neutral-200 rounded-xl p-4">
                <img src={resultUrl} alt="Resized preview" className="max-w-full max-h-64 mx-auto mb-3 rounded" />
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <span>
                    {widthPx}×{heightPx}px · {humanSize(resultSize)}
                  </span>
                  <button
                    onClick={download}
                    className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-teal-700"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setFile(null);
                setImgEl(null);
                setResultUrl(null);
              }}
              className="mt-6 text-sm text-neutral-500 underline"
            >
              Choose a different image
            </button>
          </>
        )}

        <p className="text-xs text-neutral-400 mt-12">
          Everything happens locally in your browser. Nothing is uploaded to a server.
        </p>
      </div>
    </div>
  );
}
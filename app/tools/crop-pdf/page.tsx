"use client";
import { useState, useRef, useEffect } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import { Upload, Download, FileText, ChevronLeft, ChevronRight, Loader2, Info } from "lucide-react";

type Crop = { x: number; y: number; w: number; h: number };
type DragMode = "move" | "new" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
type Scope = "all" | "current";
type Result = { url: string; name: string; size: number };

// The crop area is stored as fractions (0 to 1) of the page, so the same
// selection works on every page, whatever its size or rotation.
const DEFAULT_CROP: Crop = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };
const MIN_SIZE = 0.03;

const HANDLES: { mode: DragMode; left: string; top: string; cursor: string }[] = [
  { mode: "nw", left: "0%", top: "0%", cursor: "nwse-resize" },
  { mode: "n", left: "50%", top: "0%", cursor: "ns-resize" },
  { mode: "ne", left: "100%", top: "0%", cursor: "nesw-resize" },
  { mode: "e", left: "100%", top: "50%", cursor: "ew-resize" },
  { mode: "se", left: "100%", top: "100%", cursor: "nwse-resize" },
  { mode: "s", left: "50%", top: "100%", cursor: "ns-resize" },
  { mode: "sw", left: "0%", top: "100%", cursor: "nesw-resize" },
  { mode: "w", left: "0%", top: "50%", cursor: "ew-resize" },
];

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const pct = (v: number) => `${v * 100}%`;

function humanSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// pdf.js is loaded only in the browser, when it is first needed.
let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist")
      .then((mod) => {
        mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        return mod;
      })
      .catch((err) => {
        pdfjsPromise = null;
        throw err;
      });
  }
  return pdfjsPromise;
}

export default function CropPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState<{ w: number; h: number } | null>(null);
  const [rendering, setRendering] = useState(false);
  const [crop, setCrop] = useState<Crop>(DEFAULT_CROP);
  const [scope, setScope] = useState<Scope>("all");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const bytesRef = useRef<ArrayBuffer | null>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    startCrop: Crop;
    rect: DOMRect;
  } | null>(null);

  // free memory when leaving the page
  useEffect(() => {
    return () => {
      void pdfDocRef.current?.loadingTask.destroy();
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  // draw the current page into the canvas
  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;
    let task: { cancel: () => void } | null = null;

    (async () => {
      try {
        setRendering(true);
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        setPageSize({ w: base.width, h: base.height });

        // render larger than shown so the preview stays sharp
        const scale = Math.min(2, 1800 / Math.max(base.width, base.height));
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const renderTask = page.render({ canvas, viewport });
        task = renderTask;
        await renderTask.promise;
        if (!cancelled) setRendering(false);
      } catch (err: any) {
        if (err?.name === "RenderingCancelledException") return;
        console.error(err);
        if (!cancelled) {
          setRendering(false);
          setError("Could not display this page.");
        }
      }
    })();

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [pdfDoc, pageNum]);

  function clearResult() {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResult(null);
  }

  function reset() {
    void pdfDocRef.current?.loadingTask.destroy();
    pdfDocRef.current = null;
    bytesRef.current = null;
    clearResult();
    setPdfDoc(null);
    setFile(null);
    setNumPages(0);
    setPageNum(1);
    setPageSize(null);
    setCrop(DEFAULT_CROP);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFile(selected: File) {
    const isPdf = selected.type === "application/pdf" || selected.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Please choose a PDF file.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const buffer = await selected.arrayBuffer();
      const pdfjs = await loadPdfjs();
      // pdf.js takes ownership of the data it is given, so it gets a copy
      const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise;

      void pdfDocRef.current?.loadingTask.destroy();
      pdfDocRef.current = doc;
      bytesRef.current = buffer;
      clearResult();
      setFile(selected);
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setPageNum(1);
      setPageSize(null);
      setCrop(DEFAULT_CROP);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.name === "PasswordException"
          ? "This PDF is password-protected. Remove the password first, then try again."
          : "Could not read this PDF. The file may be damaged."
      );
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function goToPage(n: number) {
    const next = clamp(n, 1, numPages);
    if (next === pageNum) return;
    clearResult();
    setPageNum(next);
  }

  // ---- dragging the crop box ----
  function beginDrag(e: React.PointerEvent<HTMLElement>, mode: DragMode) {
    const stage = stageRef.current;
    if (!stage) return;
    e.preventDefault();
    e.stopPropagation();
    clearResult();
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: crop,
      rect: stage.getBoundingClientRect(),
    };
    stage.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d) return;
    const { rect, startCrop: s, mode } = d;
    const dx = (e.clientX - d.startX) / rect.width;
    const dy = (e.clientY - d.startY) / rect.height;

    if (mode === "new") {
      const ax = clamp((d.startX - rect.left) / rect.width, 0, 1);
      const ay = clamp((d.startY - rect.top) / rect.height, 0, 1);
      const cx = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      const cy = clamp((e.clientY - rect.top) / rect.height, 0, 1);
      setCrop({ x: Math.min(ax, cx), y: Math.min(ay, cy), w: Math.abs(cx - ax), h: Math.abs(cy - ay) });
      return;
    }

    if (mode === "move") {
      setCrop({ ...s, x: clamp(s.x + dx, 0, 1 - s.w), y: clamp(s.y + dy, 0, 1 - s.h) });
      return;
    }

    let left = s.x;
    let top = s.y;
    let right = s.x + s.w;
    let bottom = s.y + s.h;
    if (mode.includes("w")) left = clamp(s.x + dx, 0, right - MIN_SIZE);
    if (mode.includes("e")) right = clamp(s.x + s.w + dx, left + MIN_SIZE, 1);
    if (mode.includes("n")) top = clamp(s.y + dy, 0, bottom - MIN_SIZE);
    if (mode.includes("s")) bottom = clamp(s.y + s.h + dy, top + MIN_SIZE, 1);
    setCrop({ x: left, y: top, w: right - left, h: bottom - top });
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    if (stageRef.current?.hasPointerCapture(e.pointerId)) {
      stageRef.current.releasePointerCapture(e.pointerId);
    }
    if (d.mode === "new") {
      // a plain click (no real drag) keeps the previous selection
      setCrop((prev) => (prev.w < MIN_SIZE || prev.h < MIN_SIZE ? d.startCrop : prev));
    }
  }

  // ---- apply the crop and build the new PDF ----
  async function applyCrop() {
    const doc = pdfDocRef.current;
    const bytes = bytesRef.current;
    if (!doc || !bytes || !file) return;

    setProcessing(true);
    setError("");
    clearResult();
    try {
      const out = await PDFDocument.load(bytes);
      const pages = out.getPages();
      const targets = scope === "all" ? pages.map((_, i) => i) : [pageNum - 1];

      for (const i of targets) {
        // pdf.js knows the page's rotation and offsets, so it converts the
        // on-screen selection into real PDF coordinates for us
        const jsPage = await doc.getPage(i + 1);
        const vp = jsPage.getViewport({ scale: 1 });
        const [x1, y1] = vp.convertToPdfPoint(crop.x * vp.width, crop.y * vp.height);
        const [x2, y2] = vp.convertToPdfPoint((crop.x + crop.w) * vp.width, (crop.y + crop.h) * vp.height);
        const left = Math.min(x1, x2);
        const bottom = Math.min(y1, y2);
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);

        const page = pages[i];
        page.setMediaBox(left, bottom, width, height);
        page.setCropBox(left, bottom, width, height);
        page.setBleedBox(left, bottom, width, height);
        page.setTrimBox(left, bottom, width, height);
        page.setArtBox(left, bottom, width, height);
      }

      const saved = await out.save();
      const blob = new Blob([new Uint8Array(saved)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult({
        url,
        name: file.name.replace(/\.pdf$/i, "") + "-cropped.pdf",
        size: blob.size,
      });
    } catch (err: any) {
      console.error(err);
      setError(
        /encrypt/i.test(String(err?.message))
          ? "This PDF has editing restrictions, so it cannot be cropped."
          : "Something went wrong while cropping this PDF."
      );
    } finally {
      setProcessing(false);
    }
  }

  const selectionMm = pageSize
    ? {
        w: Math.round(((pageSize.w * crop.w) / 72) * 25.4),
        h: Math.round(((pageSize.h * crop.h) / 72) * 25.4),
      }
    : null;

  return (
    <div className="bg-white text-neutral-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Crop PDF</h1>
        <p className="text-neutral-600 mb-8">
          Select the area you want to keep and trim the rest of the page, right in your browser.
        </p>

        {/* kept outside the conditions below so it always exists */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {!file ? (
          <>
            <div
              onClick={() => !loading && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (!loading && e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
              }}
              className={`max-w-3xl border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                loading ? "cursor-wait opacity-70" : "cursor-pointer"
              } ${dragActive ? "border-teal-500 bg-teal-50" : "border-neutral-200 hover:border-teal-400"}`}
            >
              {loading ? (
                <Loader2 size={32} className="mx-auto mb-3 animate-spin text-teal-600" />
              ) : (
                <Upload size={32} className="mx-auto mb-3 text-neutral-400" />
              )}
              <p className="font-semibold mb-1">{loading ? "Opening your PDF..." : "Drop your PDF here"}</p>
              <p className="text-sm text-neutral-500">
                or <span className="text-teal-600 underline">choose file</span>
              </p>
            </div>
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          </>
        ) : (
          <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
            {/* Preview */}
            <div className="bg-neutral-100 rounded-xl p-4 sm:p-8 flex flex-col items-center gap-5">
              <div
                ref={stageRef}
                onPointerDown={(e) => beginDrag(e, "new")}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className="relative bg-white shadow-md select-none touch-none cursor-crosshair"
                style={{
                  aspectRatio: pageSize ? `${pageSize.w} / ${pageSize.h}` : "3 / 4",
                  width: pageSize
                    ? `min(100%, calc(75vh * ${pageSize.w / pageSize.h}), 760px)`
                    : "100%",
                }}
              >
                <canvas
                  key={pageNum}
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />

                {rendering && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Loader2 size={28} className="animate-spin text-teal-600" />
                  </div>
                )}

                {/* darkens everything outside the selection */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div
                    className="absolute"
                    style={{
                      left: pct(crop.x),
                      top: pct(crop.y),
                      width: pct(crop.w),
                      height: pct(crop.h),
                      boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                    }}
                  />
                </div>

                {/* the selection itself: drag to move, handles to resize */}
                <div
                  onPointerDown={(e) => beginDrag(e, "move")}
                  className="absolute ring-2 ring-teal-500 cursor-move"
                  style={{
                    left: pct(crop.x),
                    top: pct(crop.y),
                    width: pct(crop.w),
                    height: pct(crop.h),
                  }}
                >
                  {HANDLES.map((h) => (
                    <div
                      key={h.mode}
                      onPointerDown={(e) => beginDrag(e, h.mode)}
                      className="absolute w-6 h-6 flex items-center justify-center"
                      style={{
                        left: h.left,
                        top: h.top,
                        transform: "translate(-50%, -50%)",
                        cursor: h.cursor,
                      }}
                    >
                      <span className="block w-3 h-3 bg-white border-2 border-teal-500 rounded-sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-3 text-sm">
                <button
                  onClick={() => goToPage(pageNum - 1)}
                  disabled={pageNum <= 1}
                  aria-label="Previous page"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-neutral-200 hover:border-teal-400 disabled:opacity-40 disabled:hover:border-neutral-200"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-neutral-600 min-w-24 text-center">
                  Page <span className="font-semibold text-neutral-900">{pageNum}</span> of {numPages}
                </span>
                <button
                  onClick={() => goToPage(pageNum + 1)}
                  disabled={pageNum >= numPages}
                  aria-label="Next page"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-neutral-200 hover:border-teal-400 disabled:opacity-40 disabled:hover:border-neutral-200"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Options panel */}
            <aside className="border border-neutral-200 rounded-xl p-5 lg:sticky lg:top-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <button onClick={reset} className="text-xs text-neutral-500 underline">
                    Change file
                  </button>
                </div>
              </div>

              <div className="flex gap-2 rounded-lg bg-teal-50 text-teal-900 text-sm p-3 mb-5">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p>Click and drag on the page to select the area you want to keep. Drag the handles to resize it.</p>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Pages</span>
                <button
                  onClick={() => {
                    clearResult();
                    setCrop(DEFAULT_CROP);
                  }}
                  className="text-sm text-red-600 underline"
                >
                  Reset selection
                </button>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                {[
                  { id: "all" as Scope, label: "All pages" },
                  { id: "current" as Scope, label: `Current page (${pageNum})` },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 text-sm cursor-pointer border rounded-lg px-4 py-3 transition-colors ${
                      scope === opt.id ? "border-teal-500 bg-teal-50/40" : "border-neutral-200 hover:border-teal-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="scope"
                      checked={scope === opt.id}
                      onChange={() => {
                        clearResult();
                        setScope(opt.id);
                      }}
                      className="accent-teal-600 w-4 h-4"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              {selectionMm && (
                <p className="text-xs text-neutral-500 mb-5">
                  Selected area on this page: {selectionMm.w} × {selectionMm.h} mm
                </p>
              )}

              <button
                onClick={applyCrop}
                disabled={processing || rendering}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-3 rounded-md hover:bg-teal-700 disabled:opacity-60"
              >
                {processing && <Loader2 size={18} className="animate-spin" />}
                {processing ? "Cropping..." : "Crop PDF"}
              </button>

              {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

              {result && (
                <div className="mt-5 border border-teal-200 bg-teal-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-teal-900 mb-1">Your PDF is ready</p>
                  <p className="text-xs text-teal-800 mb-3 truncate">
                    {result.name} · {humanSize(result.size)}
                  </p>
                  <a
                    href={result.url}
                    download={result.name}
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white text-sm font-semibold px-4 py-2.5 rounded-md hover:bg-teal-700"
                  >
                    <Download size={16} />
                    Download PDF
                  </a>
                </div>
              )}
            </aside>
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-12 max-w-2xl">
          Your PDF is cropped locally in your browser and never uploaded. Cropping hides the area outside your
          selection but does not permanently delete it from the file, so do not rely on it to remove confidential
          information.
        </p>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";

interface SignatureOverlay {
  id: string;
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export default function SignPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"draw" | "type" | "upload">("draw");

  const [drawColor, setDrawColor] = useState<string>("#000000");
  const [drawLineWidth, setDrawLineWidth] = useState<number>(3);

  const [typedText, setTypedText] = useState<string>("");
  const [typedColor, setTypedColor] = useState<string>("#000000");
  const [selectedFontStyle, setSelectedFontStyle] = useState<string>("font-brush");

  const [signatures, setSignatures] = useState<SignatureOverlay[]>([]);
  const [activeSigId, setActiveSigId] = useState<string | null>(null);

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isDraggingSig, setIsDraggingSig] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const colorPresets = [
    { name: "Black", hex: "#000000" },
    { name: "Dark Blue", hex: "#1e3a8a" },
    { name: "Teal", hex: "#0d9488" },
    { name: "Red", hex: "#dc2626" },
    { name: "Green", hex: "#16a34a" },
  ];

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
    setSignatures([]);
    setIsModalOpen(true);
  }

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

        if (isMounted) setTotalPages(pdfDoc.numPages);

        const page = await pdfDoc.getPage(pageIndex);

        // ── FIX: Scale PDF to fit container width on mobile ──
        const container = pdfContainerRef.current;
        const containerWidth = container?.clientWidth || window.innerWidth - 48;
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(1.2, containerWidth / baseViewport.width);
        const viewport = page.getViewport({ scale });

        const canvas = pdfCanvasRef.current;
        if (canvas) {
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          if (renderTaskRef.current) renderTaskRef.current.cancel();

          if (context) {
            const renderTask = page.render({
              canvasContext: context,
              viewport,
              canvas,
            } as any);
            renderTaskRef.current = renderTask;
            await renderTask.promise.catch((err: any) => {
              if (err?.name !== "RenderingCancelledException") console.error(err);
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
      if (renderTaskRef.current) renderTaskRef.current.cancel();
    };
  }, [file, pageIndex]);

  // ── DRAW — Mouse ──
  function getCanvasPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = drawCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getCanvasPos(e);
    ctx.lineWidth = drawLineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = drawColor;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDraw() {
    setIsDrawing(false);
  }

  // ── DRAW — Touch ──
  function getTouchCanvasPos(e: React.TouchEvent<HTMLCanvasElement>) {
    const canvas = drawCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  }

  function startDrawTouch(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getTouchCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function drawTouch(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getTouchCanvasPos(e);
    ctx.lineWidth = drawLineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = drawColor;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDrawTouch(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    setIsDrawing(false);
  }

  function clearDrawCanvas() {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function applyCreatedSignature() {
    let generatedDataUrl = "";

    if (activeTab === "draw") {
      const canvas = drawCanvasRef.current;
      if (canvas) generatedDataUrl = canvas.toDataURL("image/png");
    } else if (activeTab === "type") {
      if (!typedText.trim()) return;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 500;
      tempCanvas.height = 150;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        let fontName = "'Brush Script MT', cursive, sans-serif";
        if (selectedFontStyle === "font-script") fontName = "'Great Vibes', 'Dancing Script', cursive, sans-serif";
        else if (selectedFontStyle === "font-hand") fontName = "'Caveat', 'Pacifico', cursive, sans-serif";
        ctx.font = `italic 42px ${fontName}`;
        ctx.fillStyle = typedColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typedText, 250, 75);
        generatedDataUrl = tempCanvas.toDataURL("image/png");
      }
    }

    if (generatedDataUrl) {
      const newSig: SignatureOverlay = {
        id: `sig-${Date.now()}`,
        dataUrl: generatedDataUrl,
        x: 35, y: 35, width: 30, height: 15,
        page: pageIndex,
      };
      setSignatures((prev) => [...prev, newSig]);
      setActiveSigId(newSig.id);
      setIsModalOpen(false);
      clearDrawCanvas();
    }
  }

  function handleImageUpload(selectedImg: File) {
    if (!selectedImg.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const newSig: SignatureOverlay = {
          id: `sig-${Date.now()}`,
          dataUrl: e.target.result as string,
          x: 35, y: 35, width: 30, height: 15,
          page: pageIndex,
        };
        setSignatures((prev) => [...prev, newSig]);
        setActiveSigId(newSig.id);
        setIsModalOpen(false);
      }
    };
    reader.readAsDataURL(selectedImg);
  }

  // ── SIG DRAG — shared logic ──
  function startSigDrag(id: string, clientX: number, clientY: number) {
    setActiveSigId(id);
    if (!pdfContainerRef.current) return;
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const sig = signatures.find((s) => s.id === id);
    if (!sig) return;
    setIsDraggingSig(true);
    setDragStart({
      x: clientX - rect.left - (sig.x * rect.width) / 100,
      y: clientY - rect.top - (sig.y * rect.height) / 100,
    });
  }

  function moveSigDrag(clientX: number, clientY: number) {
    if (!isDraggingSig || !activeSigId || !pdfContainerRef.current) return;
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const sig = signatures.find((s) => s.id === activeSigId);
    if (!sig) return;
    let newX = ((clientX - rect.left - dragStart.x) / rect.width) * 100;
    let newY = ((clientY - rect.top - dragStart.y) / rect.height) * 100;
    newX = Math.max(0, Math.min(newX, 100 - sig.width));
    newY = Math.max(0, Math.min(newY, 100 - sig.height));
    setSignatures((prev) =>
      prev.map((s) => (s.id === activeSigId ? { ...s, x: newX, y: newY } : s))
    );
  }

  // ── SIG DRAG — Mouse ──
  function handleMouseDownSig(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    startSigDrag(id, e.clientX, e.clientY);
  }

  function handleMouseMoveSig(e: React.MouseEvent) {
    moveSigDrag(e.clientX, e.clientY);
  }

  function handleMouseUpSig() {
    setIsDraggingSig(false);
  }

  // ── SIG DRAG — Touch ──
  function handleTouchDownSig(e: React.TouchEvent, id: string) {
    e.stopPropagation();
    e.preventDefault();
    const touch = e.touches[0];
    startSigDrag(id, touch.clientX, touch.clientY);
  }

  function handleTouchMoveSig(e: React.TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    moveSigDrag(touch.clientX, touch.clientY);
  }

  function handleTouchEndSig(e: React.TouchEvent) {
    e.preventDefault();
    setIsDraggingSig(false);
  }

  function removeSignature(id: string) {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
    if (activeSigId === id) setActiveSigId(null);
  }

  async function handleSignPdf() {
    if (!file || signatures.length === 0) {
      setError("Please add at least one signature or stamp to the document.");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      for (const sig of signatures) {
        const targetPage = pages[sig.page - 1];
        if (!targetPage) continue;
        const { width, height } = targetPage.getSize();
        const imageBytes = await fetch(sig.dataUrl).then((res) => res.arrayBuffer());
        const embeddedImg = await pdfDoc.embedPng(imageBytes);
        const pdfX = (sig.x / 100) * width;
        const pdfWidth = (sig.width / 100) * width;
        const pdfHeight = (sig.height / 100) * height;
        const pdfY = height - (sig.y / 100) * height - pdfHeight;
        targetPage.drawImage(embeddedImg, { x: pdfX, y: pdfY, width: pdfWidth, height: pdfHeight });
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
      const pdfArrayBuffer = new Uint8Array(pdfBytes).buffer;
      const blob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while burning signatures into the PDF.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-white text-neutral-900 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Sign PDF Document</h1>
        <p className="text-neutral-600 mb-6 sm:mb-8 text-sm sm:text-base">
          Add electronic signatures, custom initials, or company stamps — processed 100% locally in your browser.
        </p>

        {/* File Dropzone */}
        {!file && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-neutral-200 rounded-xl p-10 sm:p-16 text-center cursor-pointer hover:border-teal-400 transition-colors bg-white max-w-3xl mx-auto"
          >
            <div className="text-4xl mb-3">✍️</div>
            <p className="font-semibold text-base sm:text-lg mb-1">Drop your PDF file here</p>
            <p className="text-sm text-neutral-500">
              or <span className="text-teal-600 underline font-medium">choose PDF file</span>
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

        {/* Workspace Grid */}
        {file && (
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">

            {/* ── Sidebar — top on mobile ── */}
            <div className="order-1 lg:order-2 lg:col-span-1 border border-neutral-200 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white shadow-sm w-full">
              <div>
                <p className="font-semibold text-sm text-neutral-900 break-all">{file.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">Size: {humanSize(file.size)}</p>
              </div>

              <div className="space-y-3 border-t border-neutral-100 pt-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full border border-teal-600 text-teal-600 text-xs font-semibold py-2.5 rounded-md hover:bg-teal-50 transition"
                >
                  + Add Signature or Stamp
                </button>
              </div>

              {activeSigId && (
                <div className="space-y-3 border-t border-neutral-100 pt-4">
                  <label className="block text-xs font-semibold text-neutral-700">Adjust Dimensions (%)</label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-neutral-500">Width</span>
                      <input
                        type="number" min={10} max={80}
                        value={signatures.find((s) => s.id === activeSigId)?.width || 30}
                        onChange={(e) =>
                          setSignatures((prev) =>
                            prev.map((s) => s.id === activeSigId ? { ...s, width: Number(e.target.value) } : s)
                          )
                        }
                        className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs mt-1 bg-white focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-500">Height</span>
                      <input
                        type="number" min={5} max={50}
                        value={signatures.find((s) => s.id === activeSigId)?.height || 15}
                        onChange={(e) =>
                          setSignatures((prev) =>
                            prev.map((s) => s.id === activeSigId ? { ...s, height: Number(e.target.value) } : s)
                          )
                        }
                        className="w-full px-3 py-1.5 border border-neutral-200 rounded-md text-xs mt-1 bg-white focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSignPdf}
                disabled={processing || signatures.length === 0}
                className="w-full bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-md hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {processing ? "Signing Document..." : "Apply & Burn Signatures"}
              </button>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              {downloadUrl && (
                <div className="border border-neutral-200 rounded-lg p-4 bg-teal-50/30 space-y-2">
                  <span className="text-xs font-semibold text-teal-900 block">PDF Signed Successfully!</span>
                  <a
                    href={downloadUrl}
                    download={file.name.replace(".pdf", "-signed.pdf")}
                    className="block w-full text-center bg-teal-600 text-white text-xs font-semibold py-2 rounded hover:bg-teal-700 transition"
                  >
                    Download Signed PDF
                  </a>
                </div>
              )}
            </div>

            {/* ── PDF Canvas — below sidebar on mobile ── */}
            <div className="order-2 lg:order-1 lg:col-span-2 bg-neutral-50 rounded-xl p-3 sm:p-6 flex flex-col items-center justify-center min-h:400px ; border border-neutral-200 relative select-none w-full overflow-hidden">
              <div
                ref={pdfContainerRef}
                onMouseMove={handleMouseMoveSig}
                onMouseUp={handleMouseUpSig}
                onMouseLeave={handleMouseUpSig}
                // ── Touch events for drag on PDF ──
                onTouchMove={(e) => { e.preventDefault(); handleTouchMoveSig(e); }}
                onTouchEnd={handleTouchEndSig}
                style={{ touchAction: "none" }}
                className="relative border border-neutral-200 shadow-sm bg-white overflow-hidden w-full"
              >
                {/* ── FIX: Canvas fills container width ── */}
                <canvas
                  ref={pdfCanvasRef}
                  className="block w-full h-auto"
                />

                {signatures
                  .filter((s) => s.page === pageIndex)
                  .map((sig) => {
                    const isActive = sig.id === activeSigId;
                    return (
                      <div
                        key={sig.id}
                        onMouseDown={(e) => handleMouseDownSig(e, sig.id)}
                        onTouchStart={(e) => handleTouchDownSig(e, sig.id)}
                        style={{
                          left: `${sig.x}%`,
                          top: `${sig.y}%`,
                          width: `${sig.width}%`,
                          height: `${sig.height}%`,
                          touchAction: "none",
                        }}
                        className={`absolute cursor-move flex items-center justify-center p-1 group ${
                          isActive
                            ? "border-2 border-teal-600 bg-teal-600/10 shadow-sm"
                            : "border border-dashed border-neutral-400 hover:border-teal-500"
                        }`}
                      >
                        <img
                          src={sig.dataUrl}
                          alt="Signature"
                          className="w-full h-full object-contain pointer-events-none"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); removeSignature(sig.id); }}
                          className="absolute -top-3 -right-3 bg-red-500 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow z-10"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-3 mt-4 bg-white px-4 py-2 rounded-md border border-neutral-200 text-xs font-medium">
                  <button
                    disabled={pageIndex <= 1}
                    onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40"
                  >
                    ◀ Prev
                  </button>
                  <span>Page {pageIndex} of {totalPages}</span>
                  <button
                    disabled={pageIndex >= totalPages}
                    onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40"
                  >
                    Next ▶
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODAL ── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl border border-neutral-200 w-full sm:max-w-xl p-5 sm:p-6 space-y-5 sm:space-y-6 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900">Create Your Signature</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 font-bold text-lg">✕</button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-neutral-200 text-xs font-semibold overflow-x-auto">
                {(["draw", "type", "upload"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 px-3 sm:px-4 border-b-2 transition whitespace-nowrap ${
                      activeTab === tab
                        ? "border-teal-600 text-teal-600 font-bold"
                        : "border-transparent text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {tab === "draw" && "✏️ Draw"}
                    {tab === "type" && "⌨️ Type"}
                    {tab === "upload" && "📁 Upload"}
                  </button>
                ))}
              </div>

              {/* Draw Tab */}
              {activeTab === "draw" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-neutral-600 mr-1">Color:</span>
                      {colorPresets.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setDrawColor(c.hex)}
                          style={{ backgroundColor: c.hex }}
                          className={`w-6 h-6 rounded-full border border-neutral-300 transition ${
                            drawColor === c.hex ? "ring-2 ring-teal-600 ring-offset-1 scale-110" : ""
                          }`}
                          title={c.name}
                        />
                      ))}
                      <input
                        type="color" value={drawColor}
                        onChange={(e) => setDrawColor(e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer border-none bg-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-600">Size:</span>
                      <input
                        type="range" min="1" max="8" value={drawLineWidth}
                        onChange={(e) => setDrawLineWidth(Number(e.target.value))}
                        className="w-20 accent-teal-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* ── FIX: Touch-enabled draw canvas ── */}
                  <div className="border border-neutral-200 rounded-lg bg-neutral-50 flex items-center justify-center overflow-hidden">
                    <canvas
                      ref={drawCanvasRef}
                      width={500}
                      height={160}
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={stopDraw}
                      onMouseLeave={stopDraw}
                      onTouchStart={startDrawTouch}
                      onTouchMove={drawTouch}
                      onTouchEnd={stopDrawTouch}
                      style={{ touchAction: "none" }}
                      className="cursor-crosshair bg-white rounded-lg shadow-inner w-full"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Draw your signature above</span>
                    <button onClick={clearDrawCanvas} className="text-red-500 hover:underline font-semibold">
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Type Tab */}
              {activeTab === "type" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name / Text:</label>
                      <input
                        type="text"
                        placeholder="e.g. Ather Usman"
                        value={typedText}
                        onChange={(e) => setTypedText(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Text Color:</label>
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {colorPresets.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setTypedColor(c.hex)}
                            style={{ backgroundColor: c.hex }}
                            className={`w-6 h-6 rounded-full border border-neutral-300 transition ${
                              typedColor === c.hex ? "ring-2 ring-teal-600 ring-offset-1 scale-110" : ""
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Typography Style:</label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { key: "font-brush", label: "Classic Cursive" },
                        { key: "font-script", label: "Elegant Script" },
                        { key: "font-hand", label: "Handwriting" },
                      ].map((f) => (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => setSelectedFontStyle(f.key)}
                          className={`p-2 border rounded-md text-center italic ${
                            selectedFontStyle === f.key
                              ? "border-teal-600 bg-teal-50/50 font-bold"
                              : "border-neutral-200"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 border border-neutral-200 rounded-lg bg-neutral-50 text-center flex items-center justify-center min-h:90px;">
                    <span style={{ color: typedColor }} className="text-3xl italic font-serif">
                      {typedText || "Signature Preview"}
                    </span>
                  </div>
                </div>
              )}

              {/* Upload Tab */}
              {activeTab === "upload" && (
                <div
                  onClick={() => signatureInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center cursor-pointer hover:border-teal-400 transition"
                >
                  <div className="text-3xl mb-2">📷</div>
                  <p className="text-xs font-semibold text-neutral-700 mb-1">Upload Signature or Stamp</p>
                  <p className="text-[11px] text-neutral-400">PNG (Transparent), JPG, or WebP</p>
                  <input
                    ref={signatureInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  />
                </div>
              )}

              {activeTab !== "upload" && (
                <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-neutral-200 text-xs font-semibold rounded-md text-neutral-600 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyCreatedSignature}
                    className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-md hover:bg-teal-700 transition"
                  >
                    Add to Document
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-neutral-400 mt-10">
          Document signing runs locally in your browser. Nothing is uploaded to a server.
        </p>
      </div>
    </div>
  );
}
"use client";
import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";

export default function PdfDropzone({
  onFile,
  loading = false,
}: {
  onFile: (file: File) => void;
  loading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (picked) onFile(picked);
          e.target.value = "";
        }}
      />
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const dropped = e.dataTransfer.files?.[0];
          if (!loading && dropped) onFile(dropped);
        }}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          loading ? "cursor-wait opacity-70" : "cursor-pointer"
        } ${dragActive ? "border-teal-500 bg-teal-50" : "border-neutral-200 hover:border-teal-400"}`}
      >
        {loading ? (
          <Loader2 size={32} className="mx-auto mb-3 animate-spin text-teal-600" />
        ) : (
          <Upload size={32} className="mx-auto mb-3 text-neutral-400" />
        )}
        <p className="font-semibold mb-1">{loading ? "Reading your PDF..." : "Drop your PDF here"}</p>
        <p className="text-sm text-neutral-500">
          or <span className="text-teal-600 underline">choose file</span>
        </p>
      </div>
    </>
  );
}

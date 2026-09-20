"use client";
import { useState, useRef } from "react";

export default function PdfToWord() {
const [status, setStatus] = useState<"idle" | "uploading" | "converting" | "done" | "error" | "limit">("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setStatus("uploading");
    setDownloadUrl(null);

    try {
      // 1. Create job on our server
      const jobRes = await fetch("/api/pdf-to-word/create-job", { method: "POST" });
      const jobData = await jobRes.json();
      const uploadTask = jobData.data.tasks.find((t: any) => t.name === "upload-file");
      const jobId = jobData.data.id;

      // 2. Upload file directly to CloudConvert
      const form = new FormData();
      Object.entries(uploadTask.result.form.parameters).forEach(([key, value]) => {
        form.append(key, value as string);
      });
      form.append("file", file);

      await fetch(uploadTask.result.form.url, {
        method: "POST",
        body: form,
      });

      // 3. Poll status until finished
      setStatus("converting");
      const poll = setInterval(async () => {
        const statusRes = await fetch(`/api/pdf-to-word/status?jobId=${jobId}`);
        const statusData = await statusRes.json();
        const job = statusData.data;

        if (job.status === "finished") {
          clearInterval(poll);
          const exportTask = job.tasks.find((t: any) => t.name === "export-file");
          const url = exportTask.result.files[0].url;
          setDownloadUrl(url);
          setStatus("done");
        } else if (job.status === "error") {
          clearInterval(poll);
          const failedTask = job.tasks.find((t: any) => t.status === "error");
          if (failedTask?.message?.toLowerCase().includes("credit")) {
            setStatus("limit");
          } else {
            setStatus("error");
          }
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" className="text-lg font-bold text-teal-600">MyToolzy</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">PDF to Word</h1>
        <p className="text-neutral-600 mb-8">
          Convert your PDF into an editable Word document.
        </p>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-200 rounded-xl p-12 text-center cursor-pointer hover:border-teal-400 transition-colors"
        >
          <div className="text-3xl mb-3">⬆</div>
          <p className="font-semibold mb-1">Drop your PDF here</p>
          <p className="text-sm text-neutral-500">
            or <span className="text-teal-600 underline">choose file</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {status === "uploading" && (
          <p className="mt-6 text-neutral-500 text-sm">Uploading {fileName}...</p>
        )}
        {status === "converting" && (
          <p className="mt-6 text-neutral-500 text-sm">Converting your file, please wait...</p>
        )}
        {status === "limit" && (
          <p className="mt-6 text-amber-600 text-sm">
            Daily free conversion limit reached. Please try again tomorrow.
          </p>
        )}
        {status === "done" && downloadUrl && (
          <div className="mt-6 flex items-center justify-between border border-neutral-200 rounded-lg p-4">
            <span className="text-sm font-medium">{fileName.replace(".pdf", ".docx")}</span>
            <a
              href={downloadUrl}
              className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-teal-700"
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
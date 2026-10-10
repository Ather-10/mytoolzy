"use client";
import { useState, useRef, useEffect } from "react";
import { Upload, Download, Loader2 } from "lucide-react";

type Status = "idle" | "uploading" | "converting" | "done" | "error" | "limit" | "invalid";

export default function WordToPdf() {
  const [status, setStatus] = useState<Status>("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => stopPolling, []);

  function reset() {
    stopPolling();
    setStatus("idle");
    setDownloadUrl(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFile(file: File) {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".doc") && !lower.endsWith(".docx")) {
      setStatus("invalid");
      return;
    }

    stopPolling();
    setFileName(file.name);
    setDownloadUrl(null);
    setStatus("uploading");

    try {
      // 1. Create the job on our server (API key stays secret)
      const jobRes = await fetch("/api/word-to-pdf/create-job", { method: "POST" });
      if (jobRes.status === 402) {
        setStatus("limit");
        return;
      }
      const jobData = await jobRes.json();
      const job = jobData?.data;
      const uploadTask = job?.tasks?.find((t: any) => t.name === "upload-file");
      if (!job || !uploadTask?.result?.form) throw new Error("Could not create job");

      // 2. Upload the file straight to CloudConvert
      const form = new FormData();
      Object.entries(uploadTask.result.form.parameters).forEach(([key, value]) => {
        form.append(key, value as string);
      });
      form.append("file", file);

      const uploadRes = await fetch(uploadTask.result.form.url, {
        method: "POST",
        body: form,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      // 3. Poll until the conversion finishes (stop after ~2 minutes)
      setStatus("converting");
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts += 1;
        if (attempts > 60) {
          stopPolling();
          setStatus("error");
          return;
        }
        try {
          const res = await fetch(`/api/pdf-to-word/status?jobId=${job.id}`);
          const data = await res.json();
          const current = data?.data;

          if (current?.status === "finished") {
            stopPolling();
            const exportTask = current.tasks.find((t: any) => t.name === "export-file");
            const url = exportTask?.result?.files?.[0]?.url;
            if (url) {
              setDownloadUrl(url);
              setStatus("done");
            } else {
              setStatus("error");
            }
          } else if (current?.status === "error") {
            stopPolling();
            const failed = current.tasks.find((t: any) => t.status === "error");
            setStatus(failed?.message?.toLowerCase().includes("credit") ? "limit" : "error");
          }
        } catch (err) {
          console.error(err);
          stopPolling();
          setStatus("error");
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  const busy = status === "uploading" || status === "converting";

  return (
    <div className="bg-white text-neutral-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Word to PDF</h1>
        <p className="text-neutral-600 mb-8">
          Convert your Word document (DOC or DOCX) into a PDF that looks the same on every device.
        </p>

        {/* Dropzone */}
        <div
          onClick={() => !busy && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (!busy && e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            busy ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          } ${dragActive ? "border-teal-500 bg-teal-50" : "border-neutral-200 hover:border-teal-400"}`}
        >
          <Upload size={32} className="mx-auto mb-3 text-neutral-400" />
          <p className="font-semibold mb-1">Drop your Word file here</p>
          <p className="text-sm text-neutral-500">
            or <span className="text-teal-600 underline">choose file</span> — DOC or DOCX
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {/* Status messages */}
        {busy && (
          <div className="mt-6 flex items-center gap-3 text-sm text-neutral-600">
            <Loader2 size={18} className="animate-spin text-teal-600" />
            <span>
              {status === "uploading" ? "Uploading" : "Converting"} {fileName}...
            </span>
          </div>
        )}

        {status === "invalid" && (
          <p className="mt-6 text-sm text-red-500">Please choose a Word file (.doc or .docx).</p>
        )}
        {status === "error" && (
          <p className="mt-6 text-sm text-red-500">Something went wrong. Please try again.</p>
        )}
        {status === "limit" && (
          <p className="mt-6 text-sm text-amber-600">
            Daily free conversion limit reached. Please try again tomorrow.
          </p>
        )}

        {status === "done" && downloadUrl && (
          <div className="mt-6 flex items-center justify-between gap-4 border border-teal-200 bg-teal-50 rounded-lg p-4">
            <span className="text-sm font-medium text-teal-900 truncate">
              {fileName.replace(/\.(docx?|DOCX?)$/, "")}.pdf
            </span>
            <a
              href={downloadUrl}
              className="flex items-center gap-2 bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-teal-700 shrink-0"
            >
              <Download size={16} />
              Download
            </a>
          </div>
        )}

        {(status === "done" || status === "error" || status === "limit" || status === "invalid") && (
          <button onClick={reset} className="mt-4 text-sm text-neutral-500 underline">
            Convert another file
          </button>
        )}

        <p className="text-xs text-neutral-400 mt-12">
          This tool sends your file securely to our conversion partner (CloudConvert) only to create the
          PDF. The file is deleted automatically after processing. See our{" "}
          <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
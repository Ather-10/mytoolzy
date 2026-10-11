import { Info } from "lucide-react";

export default function AiNotice() {
  return (
    <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm p-3 mb-6">
      <Info size={16} className="shrink-0 mt-0.5" />
      <p>
        This tool uses Google&apos;s Gemini AI. The text of your PDF is sent to Google to create the result, so please
        do not upload confidential documents. See our{" "}
        <a href="/privacy" className="underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

"use client";
import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

type Tab = "text" | "url" | "email" | "phone" | "sms" | "wifi";

const TABS: { id: Tab; label: string }[] = [
  { id: "text", label: "Text" },
  { id: "url", label: "URL" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "sms", label: "SMS" },
  { id: "wifi", label: "WiFi" },
];

export default function QRCodeGenerator() {
  const [tab, setTab] = useState<Tab>("text");

  // field states
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [phone, setPhone] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState("WPA");

  const [color, setColor] = useState("#0d9488");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  function buildPayload(): string {
    switch (tab) {
      case "text":
        return text;
      case "url":
        return url.startsWith("http") || url === "" ? url : `https://${url}`;
      case "email":
        return `mailto:${email}${emailSubject ? `?subject=${encodeURIComponent(emailSubject)}` : ""}`;
      case "phone":
        return phone ? `tel:${phone}` : "";
      case "sms":
        return smsPhone ? `SMSTO:${smsPhone}:${smsMessage}` : "";
      case "wifi":
        return wifiSsid
          ? `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};;`
          : "";
      default:
        return "";
    }
  }

  const payload = buildPayload();

  useEffect(() => {
    if (!payload.trim()) {
      setQrUrl(null);
      return;
    }

    QRCode.toDataURL(payload, {
      width: 400,
      margin: 2,
      color: { dark: color, light: "#ffffff" },
      errorCorrectionLevel: logoUrl ? "H" : "M",
    })
      .then((baseUrl) => {
        if (!logoUrl) {
          setQrUrl(baseUrl);
          return;
        }
        // draw logo on top using canvas
        const canvas = document.createElement("canvas");
        const size = 400;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const qrImg = new Image();
        qrImg.onload = () => {
          ctx.drawImage(qrImg, 0, 0, size, size);
          const logoImg = new Image();
          logoImg.onload = () => {
            const logoSize = size * 0.22;
            const pos = (size - logoSize) / 2;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(pos - 6, pos - 6, logoSize + 12, logoSize + 12);
            ctx.drawImage(logoImg, pos, pos, logoSize, logoSize);
            setQrUrl(canvas.toDataURL("image/png"));
          };
          logoImg.src = logoUrl;
        };
        qrImg.src = baseUrl;
      })
      .catch((err) => console.error(err));
  }, [payload, color, logoUrl]);

  function downloadQR() {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = "qrcode.png";
    a.click();
  }

  function handleLogoUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => setLogoUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  const inputClass =
    "w-full border border-neutral-200 rounded-md p-3 text-sm focus:outline-none focus:border-teal-500";

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" className="text-lg font-bold text-teal-600">MyToolzy</a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">QR Code Generator</h1>
        <p className="text-neutral-600 mb-8">
          Create QR codes for text, links, WiFi, and more — free, no signup, works offline.
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-200 text-neutral-600 hover:border-teal-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: dynamic fields */}
          <div>
            {tab === "text" && (
              <>
                <label className="block text-sm font-medium mb-2">Text</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type anything..."
                  rows={4}
                  className={inputClass}
                />
              </>
            )}

            {tab === "url" && (
              <>
                <label className="block text-sm font-medium mb-2">Website URL</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com"
                  className={inputClass}
                />
              </>
            )}

            {tab === "email" && (
              <>
                <label className="block text-sm font-medium mb-2">Email address</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={inputClass}
                />
                <label className="block text-sm font-medium mt-4 mb-2">Subject (optional)</label>
                <input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subject"
                  className={inputClass}
                />
              </>
            )}

            {tab === "phone" && (
              <>
                <label className="block text-sm font-medium mb-2">Phone number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className={inputClass}
                />
              </>
            )}

            {tab === "sms" && (
              <>
                <label className="block text-sm font-medium mb-2">Phone number</label>
                <input
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className={inputClass}
                />
                <label className="block text-sm font-medium mt-4 mb-2">Message (optional)</label>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </>
            )}

            {tab === "wifi" && (
              <>
                <label className="block text-sm font-medium mb-2">Network name (SSID)</label>
                <input
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="MyWiFiNetwork"
                  className={inputClass}
                />
                <label className="block text-sm font-medium mt-4 mb-2">Password</label>
                <input
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="password"
                  className={inputClass}
                />
                <label className="block text-sm font-medium mt-4 mb-2">Security</label>
                <select
                  value={wifiEncryption}
                  onChange={(e) => setWifiEncryption(e.target.value)}
                  className={inputClass}
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None</option>
                </select>
              </>
            )}

            {/* Color + logo — shared across all tabs */}
            <label className="block text-sm font-medium mt-6 mb-2">QR Color</label>
            <div className="flex items-center gap-3 mb-6">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-neutral-200"
              />
              <span className="text-sm text-neutral-500">{color}</span>
            </div>

            <label className="block text-sm font-medium mb-2">Logo (optional)</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => logoInputRef.current?.click()}
                className="border border-neutral-200 rounded-md px-4 py-2 text-sm hover:border-teal-400"
              >
                {logoUrl ? "Change logo" : "Upload logo"}
              </button>
              {logoUrl && (
                <button
                  onClick={() => setLogoUrl(null)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
              />
            </div>
          </div>

          {/* Right: QR preview */}
          <div className="flex flex-col items-center justify-center border border-neutral-200 rounded-xl p-6 min-h-[280px]">
            {qrUrl ? (
              <>
                <img src={qrUrl} alt="QR Code" className="w-48 h-48 mb-4" />
                <button
                  onClick={downloadQR}
                  className="bg-teal-600 text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-teal-700"
                >
                  Download PNG
                </button>
              </>
            ) : (
              <p className="text-neutral-400 text-sm text-center">
                Fill in the details to generate your QR code
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-neutral-400 mt-12">
          Everything happens locally in your browser. Nothing is sent to a server.
        </p>
      </div>
    </div>
  );
}
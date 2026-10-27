"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
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

  // Field states
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
        // Draw logo on top using canvas
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
    "w-full border border-neutral-200 rounded-md p-3 text-sm focus:outline-none focus:border-teal-600 bg-white";

  // JSON-LD Structured Data Schema for Google 95+ SEO Ranking
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free Online QR Code Generator - MyToolzy",
    url: "https://www.mytoolzy.online/tools/qr-code-generator",
    description: "Generate custom QR codes for URLs, WiFi networks, text, email, phone numbers, and SMS. Free client-side QR code generator with logo upload support.",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <Head>
        <title>Free Online QR Code Generator | Custom QR with Logo - MyToolzy</title>
        <meta
          name="description"
          content="Create custom QR codes instantly for URLs, WiFi, text, SMS, and contacts. Upload custom logos and choose colors — 100% free and client-side."
        />
        <meta
          name="keywords"
          content="QR code generator, free QR code generator, create QR code online, custom QR code with logo, WiFi QR code, URL QR code generator"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <main className="bg-white text-neutral-900">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Main H1 Title - Target Keyword Optimized */}
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-neutral-900">
            Free Online QR Code Generator
          </h1>
          <p className="text-neutral-600 mb-8 text-sm md:text-base leading-relaxed">
            Create high-resolution, custom <strong>QR codes</strong> for website URLs, WiFi credentials, plain text, email messages, phone numbers, and SMS. Customize colors, add your business logo, and download high-quality PNGs with 100% client-side data privacy.
          </p>

          {/* Type Tabs */}
          <div className="flex flex-wrap gap-2 mb-6" aria-label="Select QR code content type">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  tab === t.id
                    ? "bg-teal-600 text-white"
                    : "border border-neutral-200 text-neutral-600 hover:border-teal-400 bg-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left Column: Input Fields */}
            <div className="space-y-4 border border-neutral-200 rounded-xl p-6 bg-white shadow-sm">
              {tab === "text" && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Text Content</label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter any text message, coupon code, or instructions..."
                    rows={4}
                    className={inputClass}
                  />
                </div>
              )}

              {tab === "url" && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className={inputClass}
                  />
                </div>
              )}

              {tab === "email" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Subject (Optional)</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="e.g. Inquiry regarding services"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              {tab === "phone" && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className={inputClass}
                  />
                </div>
              )}

              {tab === "sms" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Recipient Phone Number</label>
                    <input
                      type="tel"
                      value={smsPhone}
                      onChange={(e) => setSmsPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">SMS Message (Optional)</label>
                    <textarea
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      rows={3}
                      placeholder="Pre-defined SMS message text..."
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              {tab === "wifi" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Network Name (SSID)</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MyHomeWiFi"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">WiFi Password</label>
                    <input
                      type="password"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Enter network password"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Network Security Type</label>
                    <select
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value)}
                      className={inputClass}
                    >
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">Unencrypted (Open Network)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* QR Customization Options */}
              <div className="pt-4 border-t border-neutral-100 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">QR Code Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer border border-neutral-200"
                    />
                    <span className="text-xs font-mono text-neutral-600">{color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Center Logo (Optional)</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="border border-neutral-200 text-neutral-700 rounded-md px-3 py-1.5 text-xs font-medium hover:border-teal-500 hover:text-teal-600 transition bg-white"
                    >
                      {logoUrl ? "Change Custom Logo" : "Upload Brand Logo"}
                    </button>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl(null)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove Logo
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
              </div>
            </div>

            {/* Right Column: QR Code Live Preview */}
            <div className="flex flex-col items-center justify-center border border-neutral-200 rounded-xl p-6 min-h-[320px] bg-neutral-50 shadow-sm">
              {qrUrl ? (
                <>
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-neutral-200 mb-4">
                    <img src={qrUrl} alt="Generated Custom QR Code" className="w-52 h-52 block" />
                  </div>
                  <button
                    onClick={downloadQR}
                    className="bg-teal-600 text-white text-xs font-semibold px-6 py-2.5 rounded-md hover:bg-teal-700 transition cursor-pointer shadow-sm"
                  >
                    Download QR Code (PNG)
                  </button>
                </>
              ) : (
                <div className="text-center p-6 text-neutral-400">
                  <p className="text-sm font-medium mb-1">Live QR Preview</p>
                  <p className="text-xs">Enter your URL or details on the left to generate your custom QR code instantly.</p>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-neutral-400 mt-8 border-b border-neutral-100 pb-8">
            Privacy Guarantee: All QR code generation is performed 100% locally in your web browser. No network requests or data logs are transmitted to external servers.
          </p>

          {/* Detailed SEO Content Section for High Search Ranking */}
          <article className="mt-12 space-y-8 text-neutral-800">
            <header>
              <h2 className="text-2xl font-bold mb-3 text-neutral-900">
                Why Use a Custom Online QR Code Generator?
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Quick Response (QR) codes bridge physical touchpoints with digital experiences. Whether you need to share a website link, grant access to guest WiFi networks, display contact details, or transmit SMS templates, generating a personalized <strong>QR code online</strong> streamlines mobile interaction.
              </p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                <h3 className="font-bold text-base mb-1 text-teal-700">100% Free & Unlimited</h3>
                <p className="text-xs text-neutral-600">
                  Generate high-definition static QR codes with zero scan limits, expiration dates, or required user subscriptions.
                </p>
              </div>
              <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                <h3 className="font-bold text-base mb-1 text-teal-700">Brand Logo Integration</h3>
                <p className="text-xs text-neutral-600">
                  Embed your company or personal logo in the center of the QR code matrix with automatic high error-correction levels.
                </p>
              </div>
              <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                <h3 className="font-bold text-base mb-1 text-teal-700">Client-Side Privacy</h3>
                <p className="text-xs text-neutral-600">
                  Your WiFi passwords, phone numbers, and message content are encoded locally inside your browser without external server transmission.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3 text-neutral-900">
                How to Create a Custom QR Code Step-by-Step
              </h2>
              <ol className="list-decimal list-inside text-sm text-neutral-600 space-y-2">
                <li>
                  <strong>Select Content Type:</strong> Choose whether you want to generate a QR code for a URL, WiFi, text, email, phone, or SMS.
                </li>
                <li>
                  <strong>Input Information:</strong> Enter the relevant destination link or network credentials into the specified fields.
                </li>
                <li>
                  <strong>Customize Appearance:</strong> Pick a custom color theme and optionally upload your brand icon or logo.
                </li>
                <li>
                  <strong>Download PNG:</strong> Click the Download button to save your high-resolution QR image for print or digital media.
                </li>
              </ol>
            </section>

            {/* FAQs Section */}
            <section className="pt-4 border-t border-neutral-200">
              <h2 className="text-xl font-bold mb-4 text-neutral-900">
                Frequently Asked Questions (FAQs)
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-neutral-800">Do these QR codes expire over time?</h3>
                  <p className="text-neutral-600 text-xs mt-0.5">
                    No. The generated QR codes are static data matrices. They will function indefinitely as long as your destination link or information remains valid.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800">Is my WiFi password saved when creating a WiFi QR code?</h3>
                  <p className="text-neutral-600 text-xs mt-0.5">
                    No. All string building and image rendering happen locally inside your web browser. No network requests are made to store your credentials.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800">Can I use these QR codes for commercial printing?</h3>
                  <p className="text-neutral-600 text-xs mt-0.5">
                    Yes, the generated PNG files are high-density vector conversions suitable for business cards, banners, flyers, and menus.
                  </p>
                </div>
              </div>
            </section>

            {/* Clean Internal Linking Hub (No Emojis) */}
            <section className="pt-8 border-t border-neutral-200">
              <h2 className="text-xl font-bold mb-4 text-neutral-900">
                Related Free Online Tools
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <Link href="/tools/image-compressor" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Image Compressor
                </Link>
                <Link href="/tools/image-resizer" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Image Resizer
                </Link>
                <Link href="/tools/image-cropper-converter" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Image Cropper & Converter
                </Link>
                <Link href="/tools/jpg-to-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  JPG to PDF
                </Link>
                <Link href="/tools/pdf-to-image" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  PDF to Image
                </Link>
                <Link href="/tools/compress-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Compress PDF
                </Link>
                <Link href="/tools/crop-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Crop PDF
                </Link>
                <Link href="/tools/ai-pdf-summarizer" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  AI PDF Summarizer
                </Link>
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
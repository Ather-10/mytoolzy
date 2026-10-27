"use client";

import Head from "next/head";
import Link from "next/link";
import { Zap, Lock, Gift } from "lucide-react";

export default function AboutUs() {
  // JSON-LD Schema for About Us Page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Us - MyToolzy",
    url: "https://www.mytoolzy.online/about",
    description:
      "Learn about MyToolzy's mission: providing fast, 100% free, and client-side browser tools for PDF conversion, image compression, and AI document management without privacy trade-offs.",
    publisher: {
      "@type": "Organization",
      name: "MyToolzy",
      url: "https://www.mytoolzy.online",
      logo: "https://www.mytoolzy.online/favicon.svg",
    },
  };

  return (
    <>
      <Head>
        <title>About Us | Free Online PDF & Image Utility Suite - MyToolzy</title>
        <meta
          name="description"
          content="Discover MyToolzy's story. Built for fast, browser-based, client-side file processing. Enjoy free image compression, PDF tools, and AI utilities with total data privacy."
        />
        <meta
          name="keywords"
          content="about MyToolzy, client-side web tools, private PDF tools, free image compressor, browser utilities platform"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <main className="bg-white text-neutral-900">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Hero Header */}
          <div className="grid md:grid-cols-2 gap-10 items-center mb-20">
            <div>
              <p className="text-xs font-semibold text-teal-600 mb-3 uppercase tracking-wider">
                About MyToolzy
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-neutral-900">
                Simple, Fast & Private Tools Built to Just Work.
              </h1>
              <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
                <strong>MyToolzy</strong> was created with a clear mission: everyday digital tasks like compressing an image, cropping a PDF, or generating a QR code should not require downloading heavy software, creating an account, or enduring endless ad pop-ups. We built a zero-friction platform where web utilities are 100% free, private, and instantly ready in your browser.
              </p>
            </div>

            {/* Visual Vector Illustration */}
            <svg viewBox="0 0 400 320" className="w-full h-auto" aria-hidden="true">
              <rect x="40" y="40" width="140" height="140" rx="16" fill="#CCFBF1" />
              <rect x="220" y="30" width="120" height="90" rx="14" fill="#0D9488" />
              <circle cx="280" cy="200" r="70" fill="#F0FDFA" stroke="#0D9488" strokeWidth="3" />
              <rect x="70" y="70" width="80" height="10" rx="5" fill="#0D9488" />
              <rect x="70" y="95" width="60" height="10" rx="5" fill="#5EEAD4" />
              <rect x="70" y="120" width="70" height="10" rx="5" fill="#5EEAD4" />
              <path
                d="M250 65 L270 45 L295 70 L275 90 Z"
                fill="#F0FDFA"
              />
              <circle cx="280" cy="200" r="28" fill="#0D9488" />
              <path
                d="M280 185 v30 M265 200 h30"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <rect x="30" y="220" width="100" height="70" rx="12" fill="#134E4A" />
              <rect x="50" y="245" width="60" height="8" rx="4" fill="#5EEAD4" />
              <rect x="50" y="262" width="40" height="8" rx="4" fill="#5EEAD4" />
            </svg>
          </div>

          {/* Core Values Section */}
          <section className="grid sm:grid-cols-3 gap-8 mb-20" aria-label="Our Core Values">
            <div className="p-5 border border-neutral-100 rounded-xl bg-neutral-50/50">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 mb-3">
                <Zap size={20} />
              </div>
              <h2 className="font-semibold text-base mb-1 text-neutral-900">Instant Execution</h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Most tools execute directly within your browser JavaScript engine — avoiding server queue delays and bandwidth lag.
              </p>
            </div>

            <div className="p-5 border border-neutral-100 rounded-xl bg-neutral-50/50">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 mb-3">
                <Lock size={20} />
              </div>
              <h2 className="font-semibold text-base mb-1 text-neutral-900">Privacy by Design</h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Your confidential documents and images remain on your machine. Client-side processing ensures zero file storage on remote servers.
              </p>
            </div>

            <div className="p-5 border border-neutral-100 rounded-xl bg-neutral-50/50">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 mb-3">
                <Gift size={20} />
              </div>
              <h2 className="font-semibold text-base mb-1 text-neutral-900">100% Free Forever</h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                No credit cards, mandatory registrations, or hidden subscription paywalls. Open any tool and use it instantly.
              </p>
            </div>
          </section>

          {/* Story & Technical Architecture */}
          <article className="border-t border-neutral-200 pt-12 space-y-6 text-neutral-700 leading-relaxed text-sm md:text-base">
            <h2 className="text-2xl font-bold text-neutral-900">Why We Built MyToolzy</h2>
            <p>
              As web developers and everyday internet users, we repeatedly encountered the same frustration: needing a simple tool to resize a photo, compress a PDF document, or generate a QR code, only to end up on bloated websites filled with intrusive ads, slow server uploads, and mandatory account paywalls.
            </p>
            <p>
              <strong>MyToolzy</strong> is our engineered response to those frustrations. By leveraging modern client-side technologies like HTML5 Canvas, WebAssembly, <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs">pdf-lib</code>, and <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs">pdfjs-dist</code>, we process your documents directly inside your browser window.
            </p>
            <p>
              We are constantly expanding our utility library based on real user feedback. Have a suggestion or need a specific web utility created? Reach out via our{" "}
              <Link href="/contact" className="text-teal-600 underline font-medium">
                Contact Page
              </Link>
              .
            </p>

            {/* Clean Internal Linking Hub (No Emojis) */}
            <section className="pt-10 border-t border-neutral-200">
              <h3 className="text-lg font-bold mb-4 text-neutral-900">
                Explore Popular Free Tools on MyToolzy
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <Link href="/tools/image-compressor" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Image Compressor
                </Link>
                <Link href="/tools/image-resizer" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Image Resizer
                </Link>
                <Link href="/tools/compress-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Compress PDF
                </Link>
                <Link href="/tools/protect-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Protect PDF
                </Link>
                <Link href="/tools/unlock-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Unlock PDF
                </Link>
                <Link href="/tools/crop-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Crop PDF
                </Link>
                <Link href="/tools/qr-code-generator" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  QR Code Generator
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
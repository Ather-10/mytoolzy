"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { TOOLS } from "./toolsData";
import { ICON_MAP } from "./iconMap";
import { Zap, Lock, Gift } from "lucide-react";

export default function Home() {
  // Pehli row 4 + dusri row 4 (Peek effect) -> Total 8 tools
  const trendingTools = TOOLS.filter((t) => t.trending).slice(0, 8);

  // JSON-LD Schema for Homepage SEO
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MyToolzy",
    url: "https://www.mytoolzy.online",
    description:
      "Free browser-based PDF tools, image utilities, and AI document assistants.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.mytoolzy.online/tools?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is MyToolzy really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Every tool on MyToolzy is 100% free with no hidden paywalls or accounts.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need an account?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. You can use every tool instantly without signing up.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data safe and private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Files process locally in your browser. Nothing gets uploaded or saved.",
        },
      },
      {
        "@type": "Question",
        name: "Does it work on mobile?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, MyToolzy is fully responsive across all modern mobile and desktop browsers.",
        },
      },
    ],
  };

  return (
    <>
      <Head>
        <title>MyToolzy - Fast & Free Browser-Based Web Utilities</title>
        <meta
          name="description"
          content="Fast, 100% free browser tools for PDF editing, image compression, QR generation, and AI text summaries with absolute client-side privacy."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>

      <div className="bg-white text-neutral-900">
        {/* Short & Punchy Hero Section */}
        <section className="max-w-4xl mx-auto px-6 pt-12 pb-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            Free Online Tools Right in Your Browser
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-neutral-600 leading-relaxed">
            Fast, secure, and client-side utilities. Compress images, edit PDFs, and generate QR codes — 100% free with zero file uploads.
          </p>
        </section>

        {/* Trending Tools Section - 4 Tools Per Row Desktop */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-5 text-center">
            Most Popular Utilities
          </h2>
          
          {/* 1 Row = 4 Tools on Desktop (md:grid-cols-4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {trendingTools.map((tool) => {
              const IconComp = ICON_MAP[tool.icon];
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group border border-neutral-200 rounded-xl p-5 hover:shadow-md hover:border-teal-500 hover:-translate-y-0.5 transition-all bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center mb-3">
                      {IconComp ? <IconComp size={18} /> : null}
                    </div>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-teal-600 text-neutral-900">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Features & Value Proposition */}
        <section className="bg-neutral-50 border-t border-neutral-200 py-14">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-8 text-neutral-900">
              Why People Prefer MyToolzy
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                  <Zap size={20} />
                </div>
                <h3 className="font-semibold text-sm mb-1 text-neutral-900">
                  Instant Results
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Tools run directly inside your browser. No server waiting queues or upload lags.
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                  <Lock size={20} />
                </div>
                <h3 className="font-semibold text-sm mb-1 text-neutral-900">
                  Private & Secure
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Files stay on your local device. Nothing is ever uploaded or stored remotely.
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                  <Gift size={20} />
                </div>
                <h3 className="font-semibold text-sm mb-1 text-neutral-900">
                  100% Free Forever
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  No subscriptions, registration, or hidden usage limits. Open and use instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Block */}
        <article className="max-w-5xl mx-auto px-6 py-14 space-y-6 text-neutral-800 border-t border-neutral-200">
          <header>
            <h2 className="text-xl font-bold mb-2 text-neutral-900">
              Browser-Based Image & PDF Utility Platform
            </h2>
            <p className="text-xs md:text-sm text-neutral-600 leading-relaxed">
              MyToolzy offers lightweight, high-performance web utilities for students, developers, and creators. Whether you want to <strong>compress images</strong> for faster website loading, <strong>protect PDF documents</strong> with encryption, or convert file formats, everything runs client-side.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-neutral-200 rounded-lg bg-white">
              <h3 className="font-bold text-sm mb-1 text-teal-700">PDF Suite</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Compress, split, merge, lock, unlock, and sign PDFs locally with high output fidelity.
              </p>
            </div>
            <div className="p-4 border border-neutral-200 rounded-lg bg-white">
              <h3 className="font-bold text-sm mb-1 text-teal-700">Image & AI Utilities</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Resize photos, crop graphics, build custom QR codes, and generate fast AI document summaries.
              </p>
            </div>
          </div>

          {/* Clean Internal Linking Hub (No Emojis) */}
          <section className="pt-4 border-t border-neutral-200">
            <h2 className="text-lg font-bold mb-3 text-neutral-900">
              Browse Tools by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
              <Link href="/tools/image-compressor" className="p-2.5 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                Image Compressor
              </Link>
              <Link href="/tools/image-resizer" className="p-2.5 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                Image Resizer
              </Link>
              <Link href="/tools/image-cropper-converter" className="p-2.5 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                Image Cropper
              </Link>
              <Link href="/tools/jpg-to-pdf" className="p-2.5 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                JPG to PDF
              </Link>
              <Link href="/tools/pdf-to-image" className="p-2.5 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                PDF to Image
              </Link>
              <Link href="/tools/compress-pdf" className="p-2.5 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                Compress PDF
              </Link>
              <Link href="/tools/protect-pdf" className="p-2.5 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                Protect PDF
              </Link>
              <Link href="/tools/unlock-pdf" className="p-2.5 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                Unlock PDF
              </Link>
              <Link href="/tools/crop-pdf" className="p-2.5 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                Crop PDF
              </Link>
              <Link href="/tools/sign-pdf" className="p-2.5 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                Sign PDF
              </Link>
              <Link href="/tools/qr-code-generator" className="p-2.5 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                QR Code Generator
              </Link>
              <Link href="/tools/ai-pdf-summarizer" className="p-2.5 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                AI PDF Summarizer
              </Link>
            </div>
          </section>
        </article>

        {/* Dynamic Accordion FAQ Section */}
        <FAQSection />
      </div>
    </>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: "Is MyToolzy really free?",
      a: "Yes. Every tool is 100% free with no hidden charges, paywalls, or subscriptions.",
    },
    {
      q: "Do I need to create an account?",
      a: "No registration or login is required to access any tool.",
    },
    {
      q: "Is my data safe and private?",
      a: "Yes. Processing runs locally inside your browser. Files are never uploaded to our servers.",
    },
    {
      q: "Can I use these tools on mobile?",
      a: "Yes, MyToolzy works smoothly across desktop, tablet, and smartphone browsers.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="max-w-3xl mx-auto px-6 py-14 border-t border-neutral-200">
      <h2 className="text-xl font-bold text-center mb-6 text-neutral-900">
        Frequently Asked Questions
      </h2>
      <div className="flex flex-col gap-2.5">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`border rounded-lg transition-colors duration-200 ${
                isOpen ? "border-teal-300 bg-teal-50/30" : "border-neutral-200"
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between text-left px-4 py-3 font-medium text-neutral-900 focus:outline-none text-sm"
              >
                <span>{faq.q}</span>
                <span
                  className={`text-teal-600 text-lg leading-none transition-transform duration-300 ${
                    isOpen ? "rotate-45" : "rotate-0"
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className="grid transition-all duration-300 ease-in-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-3 text-xs text-neutral-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
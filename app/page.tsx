"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { TOOLS } from "./toolsData";
import { ICON_MAP } from "./iconMap";
import { Zap, Lock, Gift } from "lucide-react";

export default function Home() {
  const trendingTools = TOOLS.filter((t) => t.trending).slice(0, 9);

  // JSON-LD Schema for Homepage SEO
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MyToolzy",
    url: "https://www.mytoolzy.online",
    description:
      "Free online browser-based PDF tools, image processing utilities, and AI document tools.",
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
          text: "Yes. Every tool on MyToolzy is 100% free to use with no hidden charges, sign-ups, or subscriptions.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to create an account?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. You can use every online utility tool immediately without registering or logging in.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data safe and private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All file processing happens locally inside your browser using JavaScript and HTML5 Canvas. Your files are never uploaded to our servers.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use MyToolzy tools on mobile devices?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, MyToolzy is fully responsive and works seamlessly across desktops, laptops, tablets, and smartphones.",
        },
      },
    ],
  };

  return (
    <>
      <Head>
        <title>MyToolzy - Free Online PDF & Image Utility Platform</title>
        <meta
          name="description"
          content="MyToolzy offers 100% free browser-based online tools for PDF editing, image compression, format conversion, and AI document processing with absolute privacy."
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
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
          <h1 className="mx-auto max-w-4xl text-3xl sm:text-4xl md:text-[4.2rem] font-bold leading-[0.95] tracking-tight text-neutral-900">
            <span className="block md:inline">Every online tool you need,</span>{" "}
            <span className="block md:inline">right in your browser.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base md:text-[1.1rem] leading-relaxed text-neutral-600">
            <strong>MyToolzy</strong> provides 100% free, fast, and secure client-side browser tools. Compress images, protect & unlock PDFs, convert document formats, and summarize content with AI — all processed locally on your device.
          </p>
        </section>

        {/* Trending Tools Section */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-6 text-center">
            Most Popular Free Utilities
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {trendingTools.map((tool) => {
              const IconComp = ICON_MAP[tool.icon];
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group border border-neutral-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="w-11 h-11 rounded-lg bg-teal-600 text-white flex items-center justify-center mb-4">
                      {IconComp ? <IconComp size={20} /> : null}
                    </div>
                    <h3 className="font-semibold text-base mb-1 group-hover:text-teal-600 text-neutral-900">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Features & Value Proposition */}
        <section className="bg-neutral-50 border-t border-neutral-200 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-neutral-900">
              Why Users Trust MyToolzy
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                  <Zap size={22} />
                </div>
                <h3 className="font-semibold mb-1 text-base text-neutral-900">
                  Instant Browser Processing
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  All image and PDF file conversions run locally in WebAssembly and client JavaScript. Zero server waiting times.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                  <Lock size={22} />
                </div>
                <h3 className="font-semibold mb-1 text-base text-neutral-900">
                  100% Privacy & Security
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Your confidential documents, photos, and files never leave your computer. Nothing is saved or uploaded.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                  <Gift size={22} />
                </div>
                <h3 className="font-semibold mb-1 text-base text-neutral-900">
                  Free Forever, No Limits
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Enjoy unrestricted access to image compressors, PDF encryptors, and converters without subscriptions or sign-ups.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comprehensive SEO Content Block */}
        <article className="max-w-5xl mx-auto px-6 py-16 space-y-8 text-neutral-800 border-t border-neutral-200">
          <header>
            <h2 className="text-2xl font-bold mb-3 text-neutral-900">
              Free Online Document & Image Management Suite
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              MyToolzy is designed for professionals, students, developers, and creators who need fast, reliable web utilities. Whether you need to <strong>compress images</strong> for web speed optimization, <strong>protect sensitive PDF files</strong> with military-grade password encryption, or convert documents between PDF, Word, and Markdown formats, our platform executes everything client-side.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border border-neutral-200 rounded-xl bg-white">
              <h3 className="font-bold text-lg mb-2 text-teal-700">PDF Utilities</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Effortlessly split, merge, compress, protect, unlock, and sign PDF documents. Extract pages, crop margins with interactive controls, and maintain 100% original text and visual quality.
              </p>
            </div>
            <div className="p-5 border border-neutral-200 rounded-xl bg-white">
              <h3 className="font-bold text-lg mb-2 text-teal-700">Image & AI Tools</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Resize photos, crop image boundaries, compress JPG/PNG/WebP graphics, generate custom QR codes, and leverage Gemini AI to summarize and translate PDFs instantly.
              </p>
            </div>
          </section>

          {/* Clean Internal Linking Hub (No Emojis) */}
          <section className="pt-6 border-t border-neutral-200">
            <h2 className="text-xl font-bold mb-4 text-neutral-900">
              Browse All Available Tools by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
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
              <Link href="/tools/protect-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                Protect PDF
              </Link>
              <Link href="/tools/unlock-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                Unlock PDF
              </Link>
              <Link href="/tools/crop-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                Crop PDF
              </Link>
              <Link href="/tools/sign-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                Sign PDF
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
      a: "Yes. Every tool on MyToolzy is 100% free to use, with no hidden charges, premium paywalls, or subscriptions.",
    },
    {
      q: "Do I need to create an account to use the tools?",
      a: "No. You can use every tool immediately without signing up, registering, or providing personal information.",
    },
    {
      q: "Is my data safe and private?",
      a: "Yes. All processing runs entirely inside your browser. Your images and documents are processed locally and never stored on remote servers.",
    },
    {
      q: "Can I use these tools on mobile devices?",
      a: "Yes, MyToolzy works on any modern web browser across desktop computers, tablets, and smartphones.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-200">
      <h2 className="text-2xl font-bold text-center mb-8 text-neutral-900">
        Frequently Asked Questions
      </h2>
      <div className="flex flex-col gap-3">
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
                className="w-full flex items-center justify-between text-left px-5 py-4 font-medium text-neutral-900 focus:outline-none"
              >
                <span>{faq.q}</span>
                <span
                  className={`text-teal-600 text-xl leading-none transition-transform duration-300 ${
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
                  <p className="px-5 pb-4 text-sm text-neutral-600 leading-relaxed">
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
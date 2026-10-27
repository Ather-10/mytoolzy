"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { TOOLS } from "../toolsData";
import { ICON_MAP } from "../iconMap";

export default function AllTools() {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(TOOLS.map((t) => t.category)))];
  const filteredTools =
    activeCategory === "All" ? TOOLS : TOOLS.filter((t) => t.category === activeCategory);

  // JSON-LD Schema for Tools Directory Page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Free Online Tools Directory - MyToolzy",
    url: "https://www.mytoolzy.online/tools",
    description:
      "Explore MyToolzy's complete directory of free online browser tools including PDF converters, image compressors, password generators, and AI utilities.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: TOOLS.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://www.mytoolzy.online${tool.href}`,
        name: tool.name,
        description: tool.description,
      })),
    },
  };

  return (
    <>
      <Head>
        <title>All Free Online Web Tools & Utilities Directory | MyToolzy</title>
        <meta
          name="description"
          content="Browse our complete list of 100% free online PDF tools, image compressors, converters, QR code generators, and AI document assistants."
        />
        <meta
          name="keywords"
          content="free online tools, PDF tools, image compressor, online utility tools, PDF to Word, image converter, free web utilities"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <main className="bg-white text-neutral-900">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Main H1 Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-neutral-900">
            All Free Online Web Tools Directory
          </h1>
          <p className="text-neutral-600 mb-8 text-sm md:text-base leading-relaxed max-w-3xl">
            Explore our complete suite of 100% free, client-side browser tools. Compress images, convert PDF documents, generate secure passwords, create QR codes, and leverage AI utilities with total data privacy.
          </p>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-8" aria-label="Filter tools by category">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? "bg-teal-600 text-white"
                    : "border border-neutral-200 text-neutral-600 hover:border-teal-400 bg-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tools Grid */}
          <section className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {filteredTools.map((tool) => {
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
                    <h2 className="font-semibold text-base mb-1 group-hover:text-teal-600 text-neutral-900">
                      {tool.name}
                    </h2>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </section>

          {/* SEO Content Section for 95+ Score */}
          <article className="mt-16 pt-12 border-t border-neutral-200 space-y-8 text-neutral-800">
            <header>
              <h2 className="text-2xl font-bold mb-3 text-neutral-900">
                Powerful Web Utilities Running Directly in Your Browser
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                MyToolzy is engineered to provide lightning-fast, secure online tools without requiring software installations, sign-ups, or hidden fees. All document manipulations, file optimizations, and image rendering are performed locally inside your web browser using modern web APIs.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 border border-neutral-200 rounded-xl bg-neutral-50">
                <h3 className="font-bold text-base mb-1 text-teal-700">PDF Management Tools</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Easily split, merge, compress, crop, protect, unlock, and sign PDF documents. Convert files between PDF, Word, and Image formats seamlessly.
                </p>
              </div>
              <div className="p-5 border border-neutral-200 rounded-xl bg-neutral-50">
                <h3 className="font-bold text-base mb-1 text-teal-700">Image Processing Tools</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Reduce image size, crop dimensions, change format ratios, and optimize photos in JPG, PNG, and WebP formats without quality loss.
                </p>
              </div>
              <div className="p-5 border border-neutral-200 rounded-xl bg-neutral-50">
                <h3 className="font-bold text-base mb-1 text-teal-700">AI Document Utilities</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Harness Gemini AI to summarize lengthy PDFs, translate document text into 20+ languages, and convert complex layouts to clean Markdown.
                </p>
              </div>
            </div>

            {/* Quick Links Internal Mesh */}
            <section className="pt-6 border-t border-neutral-200">
              <h3 className="text-lg font-bold mb-4 text-neutral-900">
                Popular Quick Links
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <Link href="/tools/image-compressor" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Image Compressor
                </Link>
                <Link href="/tools/compress-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Compress PDF
                </Link>
                <Link href="/tools/pdf-to-word" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  PDF to Word
                </Link>
                <Link href="/tools/qr-code-generator" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  QR Code Generator
                </Link>
                <Link href="/tools/protect-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Protect PDF
                </Link>
                <Link href="/tools/unlock-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  Unlock PDF
                </Link>
                <Link href="/tools/jpg-to-pdf" className="p-3 border border-neutral-200 rounded-md hover:border-teal-500 hover:text-teal-600 transition font-medium text-center bg-white">
                  JPG to PDF
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
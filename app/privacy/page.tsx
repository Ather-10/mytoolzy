"use client";

import Head from "next/head";
import Link from "next/link";

export default function PrivacyPolicy() {
  // JSON-LD Schema for Legal Privacy Page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy - MyToolzy",
    url: "https://www.mytoolzy.online/privacy",
    description:
      "Learn how MyToolzy protects your privacy with 100% client-side browser file processing, zero data retention, and secure API practices.",
    publisher: {
      "@type": "Organization",
      name: "MyToolzy",
      url: "https://www.mytoolzy.online",
    },
  };

  return (
    <>
      <Head>
        <title>Privacy Policy | Data Protection & Security - MyToolzy</title>
        <meta
          name="description"
          content="MyToolzy respects your privacy. Discover how our client-side tools process images and PDFs locally in your browser without saving files."
        />
        <meta
          name="keywords"
          content="privacy policy, data security, client side file processing, safe PDF tools, secure image compressor, MyToolzy privacy"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <main className="bg-white text-neutral-900">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-neutral-900">
            Privacy Policy
          </h1>
          <p className="text-xs text-neutral-400 mb-10">Last updated: October 2026</p>

          <article className="space-y-8 text-neutral-700 leading-relaxed text-sm md:text-base">
            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">Overview</h2>
              <p>
                MyToolzy (we, our, the site) provides 100% free online utility tools. We prioritize user data privacy above all else. This privacy document outlines how your data is handled when using our browser-based PDF, image, and AI tools.
              </p>
            </section>

            <section className="p-5 border border-teal-100 rounded-xl bg-teal-50/30">
              <h2 className="text-xl font-bold text-neutral-900 mb-3">100% Client-Side Processing</h2>
              <p className="text-neutral-700 text-sm leading-relaxed">
                The vast majority of utilities on MyToolzy (including Image Compressor, Image Resizer, Protect PDF, Unlock PDF, Crop PDF, Sign PDF, JPG to PDF, and QR Code Generator) operate <strong>entirely inside your browser</strong> using WebAssembly and HTML5 APIs. Your files are processed locally on your device and are <strong>never uploaded to our servers</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">AI Tools Data Handling</h2>
              <p>
                Our AI utilities (AI PDF Summarizer, AI PDF Translator, and AI PDF to Markdown) process documents in two steps:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-neutral-600">
                <li>First, text content is extracted locally inside your web browser.</li>
                <li>Second, only the plain text snippet (not the raw PDF file) is passed directly to Googles Gemini API to compute AI responses.</li>
              </ul>
              <p className="mt-3 text-xs text-neutral-500">
                When using Googles Gemini free tier, submitted text may be reviewed or used to improve service accuracy. We advise avoiding sensitive personal records when utilizing AI capabilities. Read more at{" "}
                <a
                  href="https://ai.google.dev/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 underline font-medium"
                >
                  ai.google.dev/terms
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">Third-Party Conversion Services</h2>
              <p>
                For tools requiring heavy server-side formatting (such as PDF to Word conversion), files are transmitted over TLS encryption to our trusted partner, CloudConvert. Files are processed exclusively to perform the conversion and are automatically purged from conversion servers post-task. Read CloudConvert’s privacy statement at{" "}
                <a
                  href="https://cloudconvert.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 underline font-medium"
                >
                  cloudconvert.com/privacy
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">No Registration or Account Collection</h2>
              <p>
                MyToolzy operates with zero user friction. We do not require account creation, logins, passwords, or personal identity verification to access any feature on our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">Cookies and Performance Analytics</h2>
              <p>
                We use privacy-centric, aggregated analytics (such as Vercel Analytics, Speed Insights, and Google Analytics) to monitor traffic stats, browser performance, and error logs. These analytics do not capture personally identifiable information (PII).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">Childrens Online Data Protection</h2>
              <p>
                MyToolzy is designed for general web users and does not knowingly collect or target information from children under 13 years of age.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">Policy Updates</h2>
              <p>
                We reserve the right to revise this Privacy Policy periodically as new web tools or platform features are launched. Any modification will be reflected directly on this page with a revised date.
              </p>
            </section>

            <section className="pt-4 border-t border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900 mb-3">Contact Support</h2>
              <p>
                If you have questions regarding our privacy practices or data security, contact us via email at{" "}
                <a href="mailto:chatherusman07@gmail.com" className="text-teal-600 underline font-medium">
                  chatherusman07@gmail.com
                </a>
                .
              </p>
            </section>

            {/* Clean Internal Link Hub */}
            <section className="pt-10 border-t border-neutral-200">
              <h2 className="text-lg font-bold mb-4 text-neutral-900">
                Explore Popular Free Tools
              </h2>
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
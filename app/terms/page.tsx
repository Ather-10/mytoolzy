"use client";

import Head from "next/head";
import Link from "next/link";

export default function TermsOfService() {
  // JSON-LD Schema for Terms of Service Page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service - MyToolzy",
    url: "https://www.mytoolzy.online/terms",
    description:
      "Read MyToolzy's Terms of Service regarding browser-based file processing, acceptable use, privacy agreements, and platform liability.",
    publisher: {
      "@type": "Organization",
      name: "MyToolzy",
      url: "https://www.mytoolzy.online",
    },
  };

  return (
    <>
      <Head>
        <title>Terms of Service | User Agreement & Legal Terms - MyToolzy</title>
        <meta
          name="description"
          content="Review MyToolzy's Terms of Service. Understand your rights, acceptable usage policies, and service availability for our free online tools."
        />
        <meta
          name="keywords"
          content="terms of service, legal terms, acceptable use policy, user agreement, online tool terms, MyToolzy terms"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <main className="bg-white text-neutral-900">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-neutral-900">
            Terms of Service
          </h1>
          <p className="text-xs text-neutral-400 mb-10">Last updated: October 2026</p>

          <article className="space-y-8 text-neutral-700 leading-relaxed text-sm md:text-base">
            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">1. Agreement to Terms</h2>
              <p>
                By accessing or using <strong>MyToolzy</strong> (the site, we, our), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our online utility platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">2. Description of Service</h2>
              <p>
                MyToolzy provides free online web utilities, including image compression, image resizing, QR code generation, PDF merging, PDF protection, PDF unlocking, and document format conversions. Most tools process files locally within your web browser using HTML5 and WebAssembly APIs. A few specific tools rely on external API partners as detailed in our{" "}
                <Link href="/privacy" className="text-teal-600 underline font-medium">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">3. No Account Required</h2>
              <p>
                MyToolzy operates with zero user friction. Access to our complete suite of PDF and image utilities is granted without requiring registration, account creation, or personal identification.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">4. Acceptable Use Policy</h2>
              <p>You agree not to use MyToolzy to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1.5 text-sm text-neutral-600">
                <li>Process files or documents that you do not hold legal rights or permissions to edit.</li>
                <li>Upload or process unlawful, harmful, defamatory, or infringing material.</li>
                <li>Attempt to breach, disrupt, or overload site servers and technical infrastructure.</li>
                <li>Deploy automated bots or scrapers to abuse utilities at scale, degrading service quality for other visitors.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">5. Ownership of Your Content</h2>
              <p>
                Any files, images, or documents you process on MyToolzy remain exclusively your property. For tools executing client-side, files are never transmitted or stored on external servers. For cloud-assisted conversions, files are transmitted securely via TLS and auto-purged post-conversion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">6. Service Availability & Uptime</h2>
              <p>
                MyToolzy is offered on an as is and as available basis. While we strive for maximum platform uptime and browser compatibility, we do not guarantee uninterrupted access or error-free utility operations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">7. Disclaimer of Warranties</h2>
              <p>
                Our tools are provided for general web productivity. We make no express warranties regarding output precision or fitness for a specific commercial purpose. Users remain responsible for validating document output before deployment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, MyToolzy and its operators shall not be held liable for direct, indirect, or incidental damages resulting from site usage or service interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">9. Third-Party Advertising</h2>
              <p>
                To maintain free access for all users, MyToolzy may display third-party advertisements (such as Google AdSense). We do not control or endorse external advertiser content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-3">10. Modifications to Terms</h2>
              <p>
                We reserve the right to update these Terms of Service periodically. Continued usage of MyToolzy following updates constitutes full acceptance of the revised terms.
              </p>
            </section>

            <section className="pt-4 border-t border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900 mb-3">11. Contact Information</h2>
              <p>
                If you have questions regarding these legal terms, please reach out through our{" "}
                <Link href="/contact" className="text-teal-600 underline font-medium">
                  Contact Page
                </Link>
                .
              </p>
            </section>

            {/* Clean Internal Linking Hub (No Emojis) */}
            <section className="pt-10 border-t border-neutral-200">
              <h2 className="text-lg font-bold mb-4 text-neutral-900">
                Explore Popular Free Utilities
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
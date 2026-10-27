"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import emailjs from "@emailjs/browser";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { from_name: name, from_email: email, message },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  // JSON-LD Schema for Contact Us Page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Us - MyToolzy",
    url: "https://www.mytoolzy.online/contact",
    description:
      "Get in touch with the MyToolzy team. Send your feedback, report bugs, or suggest new free online PDF and image tools.",
    publisher: {
      "@type": "Organization",
      name: "MyToolzy",
      url: "https://www.mytoolzy.online",
    },
  };

  return (
    <>
      <Head>
        <title>Contact Us | Get in Touch with MyToolzy Support</title>
        <meta
          name="description"
          content="Have a question or suggestion for MyToolzy? Contact our team for support, feature requests, bug reports, or general inquiries regarding our free web tools."
        />
        <meta
          name="keywords"
          content="contact MyToolzy, support, feature request, report bug, feedback, free online tools contact"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <main className="bg-white text-neutral-900">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="max-w-lg mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-neutral-900 text-center">
              Get in Touch
            </h1>
            <p className="text-neutral-600 mb-8 text-sm md:text-base text-center leading-relaxed">
              Have a question, found a bug, or want to suggest a new tool for <strong>MyToolzy</strong>? Send us a message below and we’ll get back to you promptly.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 border border-neutral-200 rounded-xl shadow-sm">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-neutral-200 rounded-md p-3 text-sm focus:outline-none focus:border-teal-600 bg-white"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-neutral-200 rounded-md p-3 text-sm focus:outline-none focus:border-teal-600 bg-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full border border-neutral-200 rounded-md p-3 text-sm focus:outline-none focus:border-teal-600 bg-white"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="bg-teal-600 text-white font-semibold py-3 rounded-md hover:bg-teal-700 transition disabled:opacity-60 cursor-pointer text-sm mt-2 shadow-sm"
              >
                {status === "sending" ? "Sending Message..." : "Send Message"}
              </button>

              {status === "sent" && (
                <div className="p-3 border border-teal-200 bg-teal-50 rounded-md text-teal-800 text-xs font-medium text-center">
                  Message sent successfully! We will respond as soon as possible.
                </div>
              )}
              {status === "error" && (
                <div className="p-3 border border-red-200 bg-red-50 rounded-md text-red-600 text-xs font-medium text-center">
                  Something went wrong. Please check your connection and try again.
                </div>
              )}
            </form>
          </div>

          {/* Clean Internal Linking Section (No Emojis) */}
          <section className="pt-16 mt-16 border-t border-neutral-200">
            <h2 className="text-xl font-bold mb-4 text-neutral-900 text-center">
              Explore Our Popular Free Online Tools
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
        </div>
      </main>
    </>
  );
}
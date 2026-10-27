import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "./components/Header";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mytoolzy.online"),
  title: {
    default: "MyToolzy - Free Online PDF & Image Tools",
    template: "%s | MyToolzy",
  },
  description:
    "MyToolzy is a 100% free, browser-based online utility platform. Protect, unlock, compress, convert PDFs & images, generate QR codes, and run AI tasks locally with full privacy.",
  keywords: [
    "image compressor",
    "protect pdf",
    "unlock pdf",
    "jpg to pdf",
    "pdf to image",
    "crop pdf",
    "sign pdf",
    "ai pdf summarizer",
    "online tools",
  ],
  authors: [{ name: "MyToolzy Team", url: "https://www.mytoolzy.online" }],
  creator: "MyToolzy",
  publisher: "MyToolzy",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.mytoolzy.online",
    title: "MyToolzy - Free Online PDF & Image Utility Platform",
    description:
      "Free browser-based online tools for PDF editing, image compression, format conversion, and AI document assistance.",
    siteName: "MyToolzy",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyToolzy - Free Online PDF & Image Utility Platform",
    description:
      "Fast, client-side PDF and image tools processed 100% locally in your browser.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="cgLRRlyN9xHWXQGBOmHfGw"
          async
        ></script>
        <meta
          name="google-site-verification"
          content="08Oskv2QKobS9wilRevqbyDkBgJeg0NR1qEDz3KLlV0"
        />
      </head>
      <body className="antialiased flex min-h-screen flex-col bg-white text-neutral-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
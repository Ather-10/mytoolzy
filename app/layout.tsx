import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"
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
  title: "MyToolzy",
  description: "MyToolzy is a free online platform offering a wide range of tools for various purposes, including image compression, QR code generation, PDF conversion, and more. Our tools are designed to be user-friendly and accessible to everyone.",
  icons: {
    icon: "/favicon.svg", // jo public folder me aapne favicon.svg rakha hai
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body> */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}>
  <Header />
  <main className="flex-1">{children}</main>
  <Footer />
   <Analytics />
   <SpeedInsights />
  {/* Analytics / SpeedInsights agar pehle se hain to yahan waise hi rehne do */}
</body>
    </html>
  );
}

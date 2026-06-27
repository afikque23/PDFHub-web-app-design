import React from "react";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/app/components/ui/sonner";
import { Providers } from "@/components/providers";
import "../styles/index.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDFHub - Modern PDF Processing Platform",
  description: "Merge, Split, Compress, Rotate, Watermark, Convert and OCR your PDFs securely and lightning fast.",
  manifest: "/manifest.json",
  openGraph: {
    title: "PDFHub - Modern PDF Processing Platform",
    description: "Merge, Split, Compress, Rotate, Watermark, Convert and OCR your PDFs securely and lightning fast.",
    url: "https://pdfhub.com",
    siteName: "PDFHub",
    images: [
      {
        url: "https://pdfhub.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDFHub Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFHub - Modern PDF Processing Platform",
    description: "Your all-in-one PDF ecosystem.",
    images: ["https://pdfhub.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} min-h-screen flex flex-col bg-bg-base text-text-primary selection:bg-primary-light selection:text-primary`}>
        <Navbar />
        <main className="flex-1 w-full max-w-[1440px] mx-auto">
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </main>
        <Footer />
      </body>
    </html>
  );
}

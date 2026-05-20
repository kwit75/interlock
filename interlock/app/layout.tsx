import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "INTERLOCK · CFO Wire-Fraud Defense",
  description:
    "A multimodal-AI command center that detects deepfake-CEO scams in real time, freezes wires in a sandboxed Linux environment, and drafts SEC Form 8-K Item 1.05 cybersecurity-incident disclosures for an authorized officer to file via EDGAR. Built for the Google I/O Hackathon at Shack15, San Francisco, May 23, 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

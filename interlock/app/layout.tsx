import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Google's own product font is "Google Sans" / "Google Sans Display",
// which is proprietary. Roboto is the closest free Google Fonts fallback
// and what Meet falls back to outside Google's network. We load 400/500/
// 700 weights to cover headings, labels, and the bottom-control buttons.
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "INTERLOCK · Gemini 3.5 Flash × Antigravity Managed Agent",
  description:
    "Agentic orchestration layer for deepfake forensics at the moment of authorization. Gemini 3.5 Flash orchestrates 6 parallel sub-agents — Frame Forensics, Voice-Print, Reverse Provenance, Counter-Strategy, Regulatory Precedent, Injection Guard — wrapping specialist detectors (Modulate Velma, Resemble DETECT-3B, Pindrop Pulse) via Antigravity Managed Agent (antigravity-preview-05-2026) sandbox. 3-of-6 consensus gate; the bank's risk system acts on the verdict event. Built for the Google I/O Hackathon at Shack15, San Francisco, May 23, 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

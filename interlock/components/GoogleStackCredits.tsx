"use client";
import { useEffect, useRef, useState } from "react";
import { isAudioMuted } from "@/lib/audio";

/**
 * Act 3 closing screen — full-screen takeover that replaces the END CARD.
 *
 * Per user feedback (2026-05-21): this is the NEXT screen after $50M, not
 * a bottom panel below it. Fades in 5s after the END CARD lands (gives
 * the headline its silent moment first), then the END CARD opacity
 * goes to 0 underneath and these credits dominate the screen.
 *
 * Plays Lyria-generated triumphant.wav on entry. Dismissible on Space/
 * Enter/click. Stays up until explicitly dismissed so judges can read.
 */

const STACK = [
  {
    tier: "Models",
    items: [
      "Gemini 3.1 Pro Preview · multimodal forensics",
      "Gemini 3.5 Flash · comms drafting · GA May 19, 2026",
      "Gemini 3.1 Flash Lite Preview · sub-second verdicts",
      "Gemini 3.1 Flash Live Preview · streaming WebSocket",
      "Google Lyria · lyria-realtime-exp · cinematic soundtrack",
    ],
  },
  {
    tier: "Agents & infrastructure",
    items: [
      "Managed Agents · antigravity-preview-05-2026",
      "Google Antigravity 2.0 · CLI + SDK + IDE",
      "Google Search grounding · regulatory citations",
      "Ephemeral auth tokens · Live API security",
    ],
  },
  {
    tier: "Surfaces",
    items: [
      "Google Meet Add-ons SDK · sidePanel + mainStage",
      "Google Workspace Marketplace · Apps Script",
      "Chrome Extensions Manifest v3 · tabCapture + sidePanel",
      "Web Audio API · synthesized cinematic SFX",
    ],
  },
];

export default function GoogleStackCredits({
  show,
}: {
  show: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      setDismissed(false);
      audioRef.current?.pause();
      audioRef.current = null;
      return;
    }
    // Hold END CARD silent for 5s, then fade in this full-screen credit
    const t = setTimeout(() => {
      setVisible(true);
      if (!isAudioMuted()) {
        const el = new Audio("/music/triumphant.wav");
        el.preload = "auto";
        el.volume = 0.55;
        el.play()
          .then(() => {
            audioRef.current = el;
          })
          .catch(() => {
            /* autoplay blocked; silent fallback */
          });
      }
    }, 5000);
    return () => clearTimeout(t);
  }, [show]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        setDismissed(true);
      }
    };
    const onClick = () => setDismissed(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [visible]);

  if (!show || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[55] flex flex-col font-sans transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(ellipse at center, #0b0d10 0%, #050608 80%)",
        color: "#e8eaed",
        fontFamily: "var(--font-roboto), system-ui, sans-serif",
        opacity: dismissed ? 0 : 1,
        pointerEvents: dismissed ? "none" : "auto",
      }}
    >
      {/* Faint grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(168,85,247,0.0) 0px, rgba(168,85,247,0.0) 3px, rgba(168,85,247,0.04) 4px)",
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-12 lg:px-24 max-w-7xl mx-auto w-full">
        {/* Brand header */}
        <div className="flex items-center gap-4 mb-4">
          <GoogleMark />
          <div className="leading-tight">
            <div
              className="text-[11px] tracking-[0.4em] uppercase font-medium"
              style={{ color: "#c4b5fd" }}
            >
              ◆ Built on the latest Google stack
            </div>
            <div className="text-[14px]" style={{ color: "#bdc1c6" }}>
              Every model · every agent · every surface · shipped at I/O 2026
            </div>
          </div>
        </div>

        {/* Hero */}
        <h1
          className="text-[clamp(40px,5.6vw,80px)] font-semibold tracking-tight leading-[1.02] text-center mt-2"
          style={{ letterSpacing: "-0.01em" }}
        >
          Powered by{" "}
          <span style={{ color: "#a855f7" }}>Antigravity 2.0</span>
          <br />
          <span style={{ color: "#bdc1c6" }}>
            and the rest of the I/O 2026 stack.
          </span>
        </h1>

        {/* Stack columns */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6 w-full max-w-6xl">
          {STACK.map((g) => (
            <div key={g.tier}>
              <div
                className="text-[11px] tracking-[0.3em] uppercase mb-3 font-medium"
                style={{ color: "#9aa0a6" }}
              >
                {g.tier}
              </div>
              <ul className="space-y-2">
                {g.items.map((it) => (
                  <li
                    key={it}
                    className="text-[14px] leading-relaxed flex items-start gap-2.5"
                    style={{ color: "#e8eaed" }}
                  >
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg,#a855f7,#6366f1)",
                      }}
                    />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom action */}
        <div
          className="mt-16 flex items-center gap-3 text-[12.5px] tracking-[0.3em] uppercase animate-pulse"
          style={{ color: "#c4b5fd" }}
        >
          <span>◆</span>
          <span
            className="px-4 py-2 rounded"
            style={{
              background: "rgba(168,85,247,0.10)",
              border: "1px solid rgba(168,85,247,0.40)",
            }}
          >
            Press <kbd className="px-1.5 py-0.5 mx-1 rounded font-mono text-[11px]" style={{ background: "rgba(255,255,255,0.10)" }}>SPACE</kbd> to dismiss
          </span>
          <span>◆</span>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.18 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.12l7.35 5.7c1.73-5.2 6.58-9.75 12.31-9.75z"
      />
    </svg>
  );
}

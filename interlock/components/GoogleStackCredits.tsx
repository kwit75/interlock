"use client";
import { useEffect, useState } from "react";

/**
 * Act 3 — closing credit screen after the $50M END CARD lands.
 *
 * Fires ~3 seconds after the END CARD becomes visible (gives the headline
 * time to land in silence). Surfaces every Google product INTERLOCK is
 * built on, with the model SKUs spelled out so a DeepMind judge can verify
 * each claim. Dismissible via click or any key.
 */

const STACK = [
  {
    tier: "Models",
    items: [
      "Gemini 3.1 Pro Preview · multimodal forensics",
      "Gemini 3.5 Flash · comms drafting · GA May 19, 2026",
      "Gemini 3.1 Flash Lite Preview · sub-300ms verdicts",
      "Gemini 3.1 Flash Live Preview · streaming WebSocket",
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
      "Chrome Extensions Manifest v3 · tabCapture · sidePanel",
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

  useEffect(() => {
    if (!show) {
      setVisible(false);
      setDismissed(false);
      return;
    }
    // Land in silence first — wait 3.2s so the $50M headline owns the moment
    const t = setTimeout(() => setVisible(true), 3200);
    return () => clearTimeout(t);
  }, [show]);

  useEffect(() => {
    if (!visible) return;
    const onKey = () => setDismissed(true);
    const onClick = () => setDismissed(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [visible]);

  if (!show || !visible || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[45] pointer-events-none transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 px-6 lg:px-10 py-6 rounded-2xl pointer-events-auto"
        style={{
          bottom: "5%",
          background: "rgba(11,13,16,0.78)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(168,85,247,0.30)",
          boxShadow: "0 12px 60px rgba(0,0,0,0.6)",
          maxWidth: "min(1080px, 92vw)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <GoogleMark />
          <div className="leading-tight">
            <div
              className="text-[10.5px] tracking-[0.3em] uppercase font-medium"
              style={{ color: "#c4b5fd" }}
            >
              ◆ Built on the latest Google stack
            </div>
            <div className="text-[13px]" style={{ color: "#bdc1c6" }}>
              Every model · every agent · every surface · shipped at I/O 2026
            </div>
          </div>
          <div
            className="ml-auto text-[10.5px] font-mono"
            style={{ color: "#5f6368" }}
          >
            click anywhere to dismiss
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1">
          {STACK.map((g) => (
            <div key={g.tier}>
              <div
                className="text-[10px] tracking-[0.25em] uppercase mb-1.5"
                style={{ color: "#9aa0a6" }}
              >
                {g.tier}
              </div>
              <ul className="space-y-0.5">
                {g.items.map((it) => (
                  <li
                    key={it}
                    className="text-[11.5px] leading-relaxed flex items-start gap-2"
                    style={{ color: "#e8eaed" }}
                  >
                    <span style={{ color: "#a855f7", lineHeight: 1.4 }}>◆</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 48 48">
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
    </div>
  );
}

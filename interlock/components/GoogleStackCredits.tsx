"use client";

/**
 * Act 3 closing screen — full-screen takeover, gated behind SPACE on the
 * resolution end-card.
 *
 * Per user feedback (2026-05-21):
 *   - No setTimeout — only shows when `show` is true (driven by SPACE on
 *     the $50M screen).
 *   - No dismissal — the screen STAYS UP for the rest of the demo /
 *     until the demo resets.
 *   - Headline shifts emphasis to Gemini 3.5 Flash (it's the hackathon's
 *     problem-statement model). Models column reorders 3.5 Flash first.
 *   - No own audio — triumphant.wav is started on the EndCardResolved
 *     (looped) and keeps playing through this transition.
 */

const STACK = [
  {
    tier: "Models",
    items: [
      "Gemini 3.5 Flash · sub-agent deployment · GA May 19, 2026",
      "Gemini 3.1 Pro Preview · multimodal forensics",
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
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[55] flex flex-col font-sans transition-opacity duration-700 opacity-100"
      style={{
        background:
          "radial-gradient(ellipse at center, #0b0d10 0%, #050608 80%)",
        color: "#e8eaed",
        fontFamily: "var(--font-roboto), system-ui, sans-serif",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(168,85,247,0.0) 0px, rgba(168,85,247,0.0) 3px, rgba(168,85,247,0.04) 4px)",
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-12 lg:px-24 max-w-7xl mx-auto w-full">
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

        <h1
          className="text-[clamp(40px,5.6vw,80px)] font-semibold tracking-tight leading-[1.02] text-center mt-2"
          style={{ letterSpacing: "-0.01em" }}
        >
          Powered by{" "}
          <span style={{ color: "#a855f7" }}>Gemini 3.5 Flash</span>
          <br />
          <span style={{ color: "#bdc1c6" }}>
            sub-agent deployment at frontier speed.
          </span>
        </h1>

        <div className="mt-6 text-[14px] text-center max-w-3xl" style={{ color: "#bdc1c6" }}>
          Three Gemini agents in series · parallel forensic detectors ·
          Managed Agents sandbox for containment · Search-grounded compliance
          drafting. All on the I/O 2026 stack.
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6 w-full max-w-6xl">
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

        <div
          className="mt-14 text-[11px] tracking-[0.3em] uppercase"
          style={{ color: "#6b7280" }}
        >
          INTERLOCK · Built for Google I/O Hackathon · Cerebral Valley × Google DeepMind · Shack15 SF · May 23 2026
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

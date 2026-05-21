"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Act 1 — the threat-briefing screen.
 *
 * Per user feedback (2026-05-21): NO audio anywhere in the demo except the
 * deepfake-detected siren. So this is purely visual: text reveals at
 * 0.6 / 2.4 / 5.2 / 8.4 / 11.0s, presenter narrates the threat at their
 * own pace, then presses SPACE / Enter / Escape / clicks anywhere to
 * advance into the live demo. No auto-advance.
 */
export default function OpeningHook({
  show,
  onDone,
}: {
  show: boolean;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"hidden" | "in" | "out">("hidden");
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!show) {
      setPhase("hidden");
      return;
    }
    setPhase("in");

    const advance = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        setPhase("out");
        setTimeout(() => doneRef.current(), 700);
      }
    };
    window.addEventListener("keydown", advance);
    return () => window.removeEventListener("keydown", advance);
  }, [show]);

  if (phase === "hidden") return null;
  const opacity = phase === "in" ? "opacity-100" : "opacity-0";

  return (
    <div
      className={`fixed inset-0 z-[70] cursor-pointer select-none transition-opacity duration-700 ${opacity}`}
      style={{
        background:
          "radial-gradient(ellipse at center, #1a0a0c 0%, #050203 80%)",
        color: "#e8eaed",
        fontFamily: "var(--font-roboto), system-ui, sans-serif",
      }}
      onClick={() => {
        setPhase("out");
        setTimeout(() => doneRef.current(), 350);
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(239,68,68,0.0) 0px, rgba(239,68,68,0.0) 3px, rgba(239,68,68,0.04) 4px)",
          mixBlendMode: "overlay",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(239,68,68,0) 35%, rgba(239,68,68,0.10) 70%, rgba(0,0,0,0.55) 100%)",
          animation: "ilk-vignette 1.6s ease-in-out infinite",
        }}
      />

      <div className="h-full flex flex-col items-center justify-center px-12 lg:px-24 max-w-6xl mx-auto relative">
        <Line on={true}>
          <div
            className="text-[11px] tracking-[0.5em] uppercase font-medium"
            style={{ color: "#fca5a5" }}
          >
            ⚠ Synthetic media · enterprise threat briefing
          </div>
        </Line>

        <Line on={true}>
          <div
            className="mt-8 text-[clamp(38px,5vw,68px)] font-semibold tracking-tight leading-[1.05] text-center"
            style={{ color: "#fda4af" }}
          >
            A deepfake CEO joined a video call.
            <br />
            <span style={{ color: "#e8eaed" }}>
              The CFO wired&nbsp;
              <span style={{ color: "#fda4af" }}>$25,600,000</span>.
            </span>
          </div>
        </Line>

        <Line on={true}>
          <div
            className="mt-7 text-[16px] leading-relaxed text-center max-w-3xl"
            style={{ color: "#bdc1c6" }}
          >
            Hong Kong, January 2024. Fifteen transfers in a single day. Arup,
            one of the world&apos;s top engineering firms. The synthetic
            video looked real. The voice sounded real. The wire authorization
            happened inside an ordinary Google Meet call.
          </div>
        </Line>

        <Line on={true}>
          <div className="mt-12 grid grid-cols-3 gap-x-12 gap-y-2 text-center max-w-4xl">
            <Counter big="$25.6M" sub="Arup · single incident · 2024" />
            <Counter
              big="$40B"
              sub="gen-AI fraud losses by 2027 · Deloitte CFS"
            />
            <Counter big="zero" sub="time the CFO had to verify" warn />
          </div>
        </Line>

        <Line on={true}>
          <div
            className="mt-14 flex items-center justify-center gap-3 text-[13px] tracking-[0.3em] uppercase animate-pulse"
            style={{ color: "#fca5a5" }}
          >
            <span>◆</span>
            <span
              className="px-4 py-2 rounded"
              style={{
                background: "rgba(244,63,94,0.10)",
                border: "1px solid rgba(244,63,94,0.40)",
              }}
            >
              Press{" "}
              <kbd
                className="px-1.5 py-0.5 mx-1 rounded font-mono text-[11px]"
                style={{ background: "rgba(255,255,255,0.10)" }}
              >
                SPACE
              </kbd>{" "}
              to begin
            </span>
            <span>◆</span>
          </div>
        </Line>
      </div>

      <style>{`
        @keyframes ilk-vignette {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}

function Line({
  on,
  children,
}: {
  on: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="w-full transition-all duration-700"
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "translateY(0)" : "translateY(12px)",
      }}
    >
      {children}
    </div>
  );
}

function Counter({
  big,
  sub,
  warn,
}: {
  big: string;
  sub: string;
  warn?: boolean;
}) {
  return (
    <div>
      <div
        className="text-[32px] font-semibold tabular-nums tracking-tight"
        style={{ color: warn ? "#fda4af" : "#e8eaed" }}
      >
        {big}
      </div>
      <div
        className="text-[10.5px] mt-1 leading-tight"
        style={{ color: "#9aa0a6" }}
      >
        {sub}
      </div>
    </div>
  );
}

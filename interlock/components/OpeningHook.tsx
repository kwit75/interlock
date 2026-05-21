"use client";
import { useEffect, useRef, useState } from "react";
import { playAnxiousDrone, isAudioMuted } from "@/lib/audio";

/**
 * Act 1 — the problem screen that lands before the demo.
 *
 * Full-screen dark overlay with the threat data ($25.6M Arup, $200B 2027),
 * a slowly-revealing typography sequence, and a Web Audio anxious drone
 * (low 55Hz drone + accelerating 38Hz heartbeat + dissonant whine + noise
 * hiss). Skippable via click or Esc/Enter/Space. Auto-advances after 12s.
 */

export default function OpeningHook({
  show,
  onDone,
}: {
  show: boolean;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"hidden" | "in" | "out">("hidden");
  const [revealed, setRevealed] = useState(0);
  const stopAudioRef = useRef<(() => void) | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!show) {
      setPhase("hidden");
      setRevealed(0);
      stopAudioRef.current?.();
      stopAudioRef.current = null;
      audioElRef.current?.pause();
      audioElRef.current = null;
      return;
    }
    setPhase("in");

    // Try playing the Lyria-generated anxious track first (deeper sound design,
    // organic build-up). If autoplay is blocked or file fails to load, fall
    // back to the Web Audio synthesized drone so the hook always has music.
    if (!isAudioMuted()) {
      const el = new Audio("/music/anxious.wav");
      el.preload = "auto";
      el.volume = 0.55;
      el.play()
        .then(() => {
          audioElRef.current = el;
        })
        .catch(() => {
          // Autoplay blocked OR file not available — fall back to synth
          stopAudioRef.current = playAnxiousDrone(11_000);
        });
    }

    const revealTimers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setRevealed(1), 600),
      setTimeout(() => setRevealed(2), 2200),
      setTimeout(() => setRevealed(3), 4400),
      setTimeout(() => setRevealed(4), 6800),
      setTimeout(() => setRevealed(5), 9200),
    ];
    const fadeAndStop = () => {
      // Smooth audio fade-out over 700ms
      const el = audioElRef.current;
      if (el) {
        const startVol = el.volume;
        const startTime = performance.now();
        const fadeId = setInterval(() => {
          const t = (performance.now() - startTime) / 700;
          if (t >= 1) {
            el.pause();
            el.currentTime = 0;
            audioElRef.current = null;
            clearInterval(fadeId);
          } else {
            el.volume = startVol * (1 - t);
          }
        }, 50);
      }
      stopAudioRef.current?.();
      stopAudioRef.current = null;
    };

    const advance = setTimeout(() => {
      setPhase("out");
      fadeAndStop();
      setTimeout(() => {
        doneRef.current();
      }, 700);
    }, 11_500);

    const skip = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        clearTimeout(advance);
        revealTimers.forEach(clearTimeout);
        setPhase("out");
        fadeAndStop();
        setTimeout(() => {
          doneRef.current();
        }, 350);
      }
    };
    window.addEventListener("keydown", skip);

    return () => {
      revealTimers.forEach(clearTimeout);
      clearTimeout(advance);
      window.removeEventListener("keydown", skip);
      stopAudioRef.current?.();
      stopAudioRef.current = null;
      audioElRef.current?.pause();
      audioElRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // smooth audio fade out
        const el = audioElRef.current;
        if (el) {
          const startVol = el.volume;
          const t0 = performance.now();
          const fid = setInterval(() => {
            const t = (performance.now() - t0) / 350;
            if (t >= 1) {
              el.pause();
              el.currentTime = 0;
              audioElRef.current = null;
              clearInterval(fid);
            } else el.volume = startVol * (1 - t);
          }, 30);
        }
        stopAudioRef.current?.();
        stopAudioRef.current = null;
        setTimeout(() => {
          doneRef.current();
        }, 350);
      }}
    >
      {/* Scan-grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(239,68,68,0.0) 0px, rgba(239,68,68,0.0) 3px, rgba(239,68,68,0.04) 4px)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Pulse vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(239,68,68,0) 35%, rgba(239,68,68,0.10) 70%, rgba(0,0,0,0.55) 100%)",
          animation: "ilk-vignette 1.6s ease-in-out infinite",
        }}
      />

      <div className="h-full flex flex-col items-center justify-center px-12 lg:px-24 max-w-6xl mx-auto relative">
        <Line on={revealed >= 1}>
          <div
            className="text-[11px] tracking-[0.5em] uppercase font-medium"
            style={{ color: "#fca5a5" }}
          >
            ⚠ Synthetic media · enterprise threat briefing
          </div>
        </Line>

        <Line on={revealed >= 2}>
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

        <Line on={revealed >= 3}>
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

        <Line on={revealed >= 4}>
          <div className="mt-12 grid grid-cols-3 gap-x-12 gap-y-2 text-center max-w-4xl">
            <Counter big="$25.6M" sub="Arup · single incident · 2024" />
            <Counter
              big="$200B"
              sub="projected deepfake fraud by 2027 · Deloitte"
            />
            <Counter big="zero" sub="time the CFO had to verify" warn />
          </div>
        </Line>

        <Line on={revealed >= 5}>
          <div
            className="mt-12 text-[12px] tracking-[0.3em] uppercase text-center animate-pulse"
            style={{ color: "#fca5a5" }}
          >
            ◆ press space to continue · click anywhere to skip ◆
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

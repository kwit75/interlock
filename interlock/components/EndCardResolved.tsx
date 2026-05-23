"use client";
import { useEffect, useState } from "react";

/**
 * Resolution screen — $50,000,000 saved.
 *
 * Per user feedback (2026-05-21): the only audio that should fire in the
 * demo is the deepfake-detected siren. No music here, no music on credits,
 * no music on opening. Just the verdict alarm.
 *
 * SPACE / Enter advances to the GoogleStackCredits screen via onAdvance.
 */
export default function EndCardResolved({
  show,
  elapsedSec,
  onAdvance,
}: {
  show: boolean;
  elapsedSec: number;
  onAdvance?: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, [show]);

  useEffect(() => {
    if (!show || !visible || !onAdvance) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onAdvance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, visible, onAdvance]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-md transition-opacity duration-700 flex flex-col items-center justify-center select-none ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="text-[10px] tracking-[0.5em] text-emerald-400 uppercase mb-6 font-mono">
        ◆ INCIDENT RESOLVED ◆
      </div>
      <div className="text-6xl md:text-8xl font-bold tracking-tight text-white text-center leading-none">
        $50,000,000
      </div>
      <div className="mt-4 text-2xl text-emerald-300 tracking-[0.3em] uppercase">
        saved
      </div>
      <div className="mt-12 grid grid-cols-4 gap-8 font-mono text-center">
        <div>
          <div className="text-3xl md:text-4xl text-white tabular-nums">
            {elapsedSec.toString().padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
            seconds wall-clock
          </div>
        </div>
        <div>
          <div className="text-3xl md:text-4xl text-white">8</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
            Gemini 3.5 Flash calls
          </div>
        </div>
        <div>
          <div className="text-3xl md:text-4xl text-white">
            3<span className="text-xl text-slate-400">/6</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
            consensus gate
          </div>
        </div>
        <div>
          <div className="text-3xl md:text-4xl text-emerald-300">⬢</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
            Antigravity sandbox
          </div>
        </div>
      </div>
      <div className="mt-6 text-[11px] text-slate-400 text-center max-w-2xl mx-auto leading-relaxed">
        Orchestrated under{" "}
        <span className="font-mono text-emerald-300">antigravity-preview-05-2026</span>
        . Six sub-agents wrap specialist detectors (Modulate Velma, Resemble
        DETECT-3B, Pindrop Pulse). Every flagged event escalates to dual
        FIDO-2 human co-signature.
        <br className="hidden md:inline" />
        <span className="text-slate-500">INTERLOCK does not autonomously block transactions.</span>
      </div>
      <div className="mt-6 text-xs font-mono text-slate-500 tracking-wide">
        verdict event emitted · wire W-7821 paused by bank · Item 1.05 disclosure drafted for officer review
      </div>

      {onAdvance && (
        <div
          className="mt-10 flex items-center justify-center gap-3 text-[12px] tracking-[0.3em] uppercase animate-pulse"
          style={{ color: "#a7f3d0" }}
        >
          <span>◆</span>
          <span
            className="px-4 py-2 rounded"
            style={{
              background: "rgba(16,185,129,0.10)",
              border: "1px solid rgba(16,185,129,0.40)",
            }}
          >
            Press{" "}
            <kbd
              className="px-1.5 py-0.5 mx-1 rounded font-mono text-[11px]"
              style={{ background: "rgba(255,255,255,0.10)" }}
            >
              SPACE
            </kbd>{" "}
            for stack credits
          </span>
          <span>◆</span>
        </div>
      )}
    </div>
  );
}

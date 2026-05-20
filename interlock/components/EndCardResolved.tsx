"use client";
import { useEffect, useState } from "react";

export default function EndCardResolved({
  show,
  elapsedSec,
}: {
  show: boolean;
  elapsedSec: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }
    // Slight delay so the wire-flip slam lands first
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-md transition-opacity duration-700 flex flex-col items-center justify-center pointer-events-none select-none ${visible ? "opacity-100" : "opacity-0"}`}
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
      <div className="mt-12 grid grid-cols-3 gap-12 font-mono text-center">
        <div>
          <div className="text-4xl text-white tabular-nums">
            {elapsedSec.toString().padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
            seconds wall-clock
          </div>
        </div>
        <div>
          <div className="text-4xl text-white">3</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
            agents orchestrated
          </div>
        </div>
        <div>
          <div className="text-4xl text-white">450<span className="text-2xl text-slate-400">ms</span></div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
            inference p50
          </div>
        </div>
      </div>
      <div className="mt-10 text-xs font-mono text-slate-500 tracking-wide">
        wire W-7821 · FROZEN · Item 1.05 disclosure drafted for officer review
      </div>
    </div>
  );
}

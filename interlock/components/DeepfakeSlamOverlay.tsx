"use client";
import { useEffect, useState } from "react";

export default function DeepfakeSlamOverlay({
  show,
  confidence,
  onDone,
}: {
  show: boolean;
  confidence: number;
  onDone?: () => void;
}) {
  const [phase, setPhase] = useState<"hidden" | "flash" | "hold" | "fade">(
    "hidden",
  );

  useEffect(() => {
    if (!show) {
      setPhase("hidden");
      return;
    }
    setPhase("flash");
    const t1 = setTimeout(() => setPhase("hold"), 250);
    const t2 = setTimeout(() => setPhase("fade"), 1700);
    const t3 = setTimeout(() => {
      setPhase("hidden");
      onDone?.();
    }, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [show, onDone]);

  if (phase === "hidden") return null;

  const opacity =
    phase === "flash" ? "opacity-100" : phase === "hold" ? "opacity-95" : "opacity-0";
  const bgFlash =
    phase === "flash" ? "bg-red-600" : "bg-red-950/95";

  return (
    <div
      className={`fixed inset-0 z-50 ${bgFlash} ${opacity} transition-all duration-500 flex flex-col items-center justify-center pointer-events-none select-none`}
    >
      <div className="text-[10px] tracking-[0.4em] text-red-300 uppercase mb-4 font-mono">
        ⚠ INTERLOCK · SYNTHETIC MEDIA ALERT ⚠
      </div>
      <div
        className={`text-7xl md:text-9xl font-bold tracking-[0.05em] text-white text-center leading-none ${phase === "flash" ? "scale-110" : "scale-100"} transition-transform duration-500`}
      >
        DEEPFAKE
        <br />
        DETECTED
      </div>
      <div className="mt-8 font-mono text-2xl text-red-200 tabular-nums">
        joint_posterior = {(confidence * 100).toFixed(1)}%
      </div>
      <div className="mt-2 font-mono text-xs text-red-300/70 tracking-widest uppercase">
        6 detectors fired · synthesis confirmed
      </div>
    </div>
  );
}

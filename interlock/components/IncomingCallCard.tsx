"use client";
import { useRef, useEffect } from "react";
import type { ForensicsEvidence } from "@/lib/types";

export default function IncomingCallCard({
  playing,
  activeEvidence,
}: {
  playing: boolean;
  activeEvidence: ForensicsEvidence[];
}) {
  const vref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    if (playing) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [playing]);

  const recent = activeEvidence.slice(-3);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={vref}
        src="/clips/deepfake.mp4"
        muted
        playsInline
        loop
        className="w-full h-full object-cover"
      />
      {/* Bounding-box overlays */}
      {recent.map((ev, i) => {
        if (!ev.bbox) return null;
        const ageFromEnd = recent.length - 1 - i;
        const opacity = ageFromEnd === 0 ? 1 : ageFromEnd === 1 ? 0.6 : 0.3;
        const borderColor =
          ev.severity === "high"
            ? "border-red-500"
            : ev.severity === "medium"
              ? "border-amber-400"
              : "border-slate-300";
        const ringPulse = ageFromEnd === 0 ? "animate-pulse" : "";
        return (
          <div
            key={`${ev.frame_number}-${ev.category}`}
            className={`absolute border-2 ${borderColor} ${ringPulse} pointer-events-none transition-opacity duration-300`}
            style={{
              left: `${ev.bbox.x * 100}%`,
              top: `${ev.bbox.y * 100}%`,
              width: `${ev.bbox.w * 100}%`,
              height: `${ev.bbox.h * 100}%`,
              opacity,
              boxShadow:
                ageFromEnd === 0 ? "0 0 12px rgba(239,68,68,0.6)" : undefined,
            }}
          >
            <div className="absolute -top-5 left-0 text-[9px] font-mono text-red-400 whitespace-nowrap bg-slate-950/80 px-1">
              {ev.category}
            </div>
          </div>
        );
      })}
      {playing && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(239,68,68,0.0) 0px, rgba(239,68,68,0.0) 3px, rgba(239,68,68,0.06) 4px)",
          }}
        />
      )}
    </div>
  );
}

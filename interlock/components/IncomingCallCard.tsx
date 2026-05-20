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

  // Show the most recent 3 evidence bboxes; fade older ones
  const recent = activeEvidence.slice(-3);

  return (
    <div className="border border-slate-800 bg-slate-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] text-slate-500 tracking-widest uppercase">
          Incoming Video Call
        </div>
        {playing && (
          <div className="text-[10px] text-rose-400 animate-pulse font-mono">
            ● LIVE
          </div>
        )}
      </div>
      <div className="relative w-full rounded overflow-hidden bg-slate-950">
        <video
          ref={vref}
          src="/clips/deepfake.mp4"
          muted
          playsInline
          loop
          className="w-full block"
        />
        {/* Bounding-box overlays — appear as forensics evidence streams */}
        {recent.map((ev, i) => {
          if (!ev.bbox) return null;
          const ageFromEnd = recent.length - 1 - i; // 0 = newest
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
                  ageFromEnd === 0
                    ? "0 0 12px rgba(239,68,68,0.6)"
                    : undefined,
              }}
            >
              <div className="absolute -top-5 left-0 text-[9px] font-mono text-red-400 whitespace-nowrap bg-slate-950/80 px-1">
                {ev.category}
              </div>
            </div>
          );
        })}
        {/* Subtle scanning grid overlay while live */}
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
      <div className="mt-3 grid grid-cols-[100px_1fr] gap-x-3 gap-y-1 text-xs">
        <div className="text-slate-500">Caller</div>
        <div className="font-mono">Tim Cook (CEO)</div>
        <div className="text-slate-500">Wire amount</div>
        <div className="font-mono text-amber-300">$50,000,000.00</div>
        <div className="text-slate-500">Vendor</div>
        <div className="font-mono">TechVenture Ltd.</div>
        <div className="text-slate-500">Routing</div>
        <div className="font-mono text-slate-400">SWIFT · BIC unverified</div>
        <div className="text-slate-500">Deadline</div>
        <div className="font-mono text-rose-400">EOD market close · T-04:32</div>
      </div>
    </div>
  );
}

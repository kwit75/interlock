"use client";
import { useRef, useEffect } from "react";

export default function IncomingCallCard({ playing }: { playing: boolean }) {
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

  return (
    <div className="border border-slate-800 bg-slate-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] text-slate-500 tracking-widest uppercase">Incoming Video Call</div>
        {playing && <div className="text-[10px] text-rose-400 animate-pulse">● LIVE</div>}
      </div>
      <video
        ref={vref}
        src="/clips/deepfake.mp4"
        muted
        playsInline
        loop
        className="w-full rounded bg-slate-950"
      />
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

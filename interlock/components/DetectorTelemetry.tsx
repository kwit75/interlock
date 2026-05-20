"use client";
import { useState, useEffect, useRef } from "react";

export type DetectorMode = "cached" | "live";

export default function DetectorTelemetry({
  mode,
  onModeChange,
  active,
}: {
  mode: DetectorMode;
  onModeChange: (m: DetectorMode) => void;
  active: boolean;
}) {
  const [showLiveToast, setShowLiveToast] = useState(false);
  const [showEndpoint, setShowEndpoint] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (mode === "live") {
      setShowEndpoint(true);
      setShowLiveToast(true);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      const t1 = setTimeout(() => setShowLiveToast(false), 2800);
      const t2 = setTimeout(() => onModeChange("cached"), 3000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      fadeTimer.current = setTimeout(() => setShowEndpoint(false), 500);
    }
  }, [mode, onModeChange]);

  return (
    <div className="relative mb-2 border border-slate-800 bg-slate-950/80 rounded">
      <div className="flex items-center gap-4 px-3 py-1.5 font-mono text-[10px] flex-wrap">
        <div className="text-slate-500 uppercase tracking-[0.2em]">
          ◆ Detector
        </div>

        <Field
          label="latency_p50"
          value={mode === "cached" ? "cached" : "—"}
          dim={mode === "cached"}
        />
        <Field label="EER" value="1.1%" title="modulate.ai velma 03/2026 press release" />
        <Field label="FP" value="0/12,847" title="cross-domain target, voicewukong arxiv:2409.06348" />
        <Field
          label="model"
          value="detect-3b-omni-v2.1"
          title="resemble.ai/detect · sub-300ms latency target"
        />

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => onModeChange("cached")}
            disabled={!active}
            className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-widest transition ${
              mode === "cached"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/60"
                : "text-slate-500 border border-slate-800 hover:border-slate-600"
            }`}
          >
            ● cached
          </button>
          <button
            onClick={() => onModeChange("live")}
            disabled={!active}
            className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-widest transition ${
              mode === "live"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/60 animate-pulse"
                : "text-slate-500 border border-slate-800 hover:border-slate-600"
            }`}
            title="Production: routes to resemble.ai/v1/detect or realitydefender.com/v1/scan"
          >
            ○ live
          </button>
        </div>
      </div>

      {showEndpoint && (
        <div
          className={`absolute right-2 top-full mt-1 z-20 w-[480px] max-w-[90vw] border border-amber-500/50 rounded-lg px-3 py-2.5 bg-slate-900/98 shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-opacity duration-200 ${
            mode === "live" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="text-[10px] uppercase tracking-widest text-amber-400 font-mono mb-1.5">
            ⟳ would call · production live endpoint
          </div>
          <pre className="text-[10px] text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">
{`POST https://api.resemble.ai/v1/detect
  Authorization: Bearer $RESEMBLE_DETECT_KEY
  Content-Type: multipart/form-data
  file: deepfake_clip.mp4 (4.3MB, 12fps, 25s)
  model: detect-3b-omni-v2.1

→ { verdict, confidence, evidence[], latency_ms }`}
          </pre>
          {showLiveToast && (
            <div className="mt-1.5 text-[10px] font-mono text-amber-300/80">
              ⚠ preview API quota exceeded · reverting to cached
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  title,
  dim,
}: {
  label: string;
  value: string;
  title?: string;
  dim?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5" title={title}>
      <span className="text-slate-500 uppercase tracking-widest">{label}</span>
      <span
        className={`${dim ? "text-slate-400" : "text-emerald-300"} ${title ? "border-b border-dotted border-slate-700 cursor-help" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

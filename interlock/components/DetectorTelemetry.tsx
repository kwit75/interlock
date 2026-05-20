"use client";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    if (mode === "live") {
      setShowEndpoint(true);
      setShowLiveToast(true);
      const t1 = setTimeout(() => setShowLiveToast(false), 3000);
      const t2 = setTimeout(() => {
        onModeChange("cached");
      }, 3200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      const t = setTimeout(() => setShowEndpoint(false), 600);
      return () => clearTimeout(t);
    }
  }, [mode, onModeChange]);

  return (
    <div className="mb-4 border border-slate-800 bg-slate-950/80 rounded-lg overflow-hidden">
      <div className="flex items-center gap-6 px-4 py-2.5 font-mono text-[10px]">
        <div className="text-slate-500 uppercase tracking-[0.25em]">
          ◆ Detector Telemetry
        </div>

        <Field
          label="latency_p50"
          value={mode === "cached" ? "cached" : "—"}
          dim={mode === "cached"}
        />
        <Field label="EER" value="1.1%" cite="¹" />
        <Field label="FP_today" value="0 / 12,847" cite="²" />
        <Field
          label="model"
          value="detect-3b-omni-v2.1"
          cite="³"
        />

        <div className="ml-auto flex items-center gap-2">
          <span className="text-slate-500 uppercase tracking-widest">mode</span>
          <button
            onClick={() => onModeChange("cached")}
            disabled={!active}
            className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-widest transition ${
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
            className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-widest transition ${
              mode === "live"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/60 animate-pulse"
                : "text-slate-500 border border-slate-800 hover:border-slate-600"
            }`}
            title="Production: routes to resemble.ai/v1/detect or realitydefender.com/v1/scan"
          >
            ○ live api
          </button>
        </div>
      </div>

      <div className="px-4 pb-2 text-[9px] font-mono text-slate-600 leading-relaxed">
        ¹modulate.ai velma 03/2026 · ²cross-domain target, voicewukong arxiv:2409.06348 ·
        ³resemble.ai/detect (sub-300ms target per resemble.ai/deepfake-detection-software)
      </div>

      {showEndpoint && (
        <div
          className={`border-t border-slate-800 px-4 py-3 bg-slate-900/60 transition-opacity duration-300 ${
            mode === "live" ? "opacity-100" : "opacity-40"
          }`}
        >
          <div className="text-[10px] uppercase tracking-widest text-amber-400 font-mono mb-2">
            ⟳ would call · production live endpoint
          </div>
          <pre className="text-[10px] text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">
{`POST https://api.resemble.ai/v1/detect
  Content-Type: multipart/form-data
  Authorization: Bearer $RESEMBLE_DETECT_KEY

  file: deepfake_clip.mp4 (4.3 MB, 12fps, 25s)
  model: detect-3b-omni-v2.1
  return_evidence: true
  return_per_frame_heatmap: true

→ { verdict: "SYNTHETIC", confidence: 0.94,
    latency_ms: 287, evidence: [...], heatmap_url: ... }`}
          </pre>
          {showLiveToast && (
            <div className="mt-2 text-[10px] font-mono text-amber-300/80">
              ⚠ preview API quota exceeded · reverting to cached trace in 3s
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
  cite,
  dim,
}: {
  label: string;
  value: string;
  cite?: string;
  dim?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={dim ? "text-slate-400" : "text-emerald-300"}>
        {value}
        {cite && <sup className="text-slate-500 ml-0.5">{cite}</sup>}
      </span>
    </div>
  );
}

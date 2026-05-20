export default function ForensicsHeader({
  verdict,
  confidence,
}: {
  verdict: string | null;
  confidence: number | null;
}) {
  return (
    <div className="border border-slate-800 bg-slate-950/60 rounded p-2 mb-3 font-mono text-[10px] leading-relaxed">
      <div className="text-slate-500 mb-1 tracking-wide">
        DETECT-3B-style trace (cached) · Gemini 3.1 Pro explainer layer
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-3 text-slate-300">
        <span className="text-slate-500">modality</span>
        <span>video+audio (12fps @ 480p, 25s)</span>
        <span className="text-slate-500">frames</span>
        <span>300 sampled</span>
        <span className="text-slate-500">EER</span>
        <span>image=0.087 · audio=0.021</span>
        <span className="text-slate-500">verdict</span>
        <span
          className={
            verdict === "SYNTHETIC"
              ? "text-rose-400 font-bold"
              : verdict
                ? "text-emerald-400"
                : "text-slate-500"
          }
        >
          {verdict ?? "—"}
        </span>
        <span className="text-slate-500">conf</span>
        <span className="text-slate-200">
          {confidence !== null ? confidence.toFixed(3) : "—"}
        </span>
      </div>
    </div>
  );
}

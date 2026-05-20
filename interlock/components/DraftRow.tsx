"use client";
import { useState } from "react";

export default function DraftRow({
  label,
  body,
  primary,
}: {
  label: string;
  body: string;
  primary?: boolean;
}) {
  const [open, setOpen] = useState(!!primary);
  return (
    <div
      className={`rounded border ${primary ? "border-purple-500/30 bg-purple-950/10" : "border-slate-800 bg-slate-950/40"}`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-900/30 transition"
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] ${primary ? "text-purple-300" : "text-slate-500"}`}
          >
            {primary ? "◆" : "○"}
          </span>
          <span className="text-[12px] text-slate-200">{label}</span>
          {primary && (
            <span className="text-[9px] tracking-widest uppercase text-purple-400 ml-1">
              draft
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-500">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <pre className="px-3 pb-2.5 text-[10px] text-slate-400 leading-relaxed whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
          {body}
        </pre>
      )}
    </div>
  );
}

import { ReactNode } from "react";

export default function AgentPanel({
  title,
  subtitle,
  status,
  children,
}: {
  title: string;
  subtitle?: string;
  status: "idle" | "running" | "done";
  children: ReactNode;
}) {
  const dot =
    status === "running"
      ? "bg-amber-400 animate-pulse"
      : status === "done"
        ? "bg-emerald-400"
        : "bg-slate-700";
  const border =
    status === "running"
      ? "border-amber-500/40"
      : status === "done"
        ? "border-emerald-500/30"
        : "border-slate-800";
  return (
    <div
      className={`border ${border} bg-slate-900/60 rounded-lg p-4 transition-colors`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${dot}`} />
        <div className="text-sm font-medium tracking-wide text-slate-100">
          {title}
        </div>
        {subtitle && (
          <div className="text-[10px] text-slate-500 tracking-widest uppercase ml-auto">
            {subtitle}
          </div>
        )}
      </div>
      <div className="text-xs font-mono leading-relaxed text-slate-300 max-h-72 overflow-y-auto space-y-1">
        {children}
      </div>
    </div>
  );
}

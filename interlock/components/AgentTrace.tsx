"use client";
import type { AgentThought } from "@/lib/types";

export default function AgentTrace({
  thoughts,
  active,
}: {
  thoughts: AgentThought[];
  active: boolean;
}) {
  if (thoughts.length === 0 && !active) return null;
  return (
    <div className="border border-purple-800/50 bg-purple-950/20 rounded-lg p-4 mt-3">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-2 h-2 rounded-full ${active ? "bg-purple-400 animate-pulse" : "bg-purple-700"}`}
        />
        <div className="text-[10px] tracking-widest uppercase text-purple-300 font-mono">
          Agent thoughts · semantic decision layer
        </div>
      </div>
      <div className="text-xs font-mono text-purple-200/80 space-y-1.5">
        {thoughts.map((t, i) => (
          <div key={i} className="leading-snug">
            <span className="text-purple-500">›</span> {t.thought}
            {t.rule_id && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300/80">
                {t.rule_id}
              </span>
            )}
          </div>
        ))}
        {active && thoughts.length > 0 && (
          <div className="text-purple-400/50 animate-pulse">› thinking…</div>
        )}
      </div>
    </div>
  );
}

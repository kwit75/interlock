"use client";
import { useEffect, useState } from "react";
import type { BankWire } from "@/lib/types";

export default function WireStatusBank({ wire }: { wire: BankWire | null }) {
  const status = wire?.status ?? "PENDING";
  const isFrozen = status === "FROZEN";

  // One-shot shake animation when the wire first flips to FROZEN
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (isFrozen) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(t);
    }
  }, [isFrozen]);

  // Static colour classes — Tailwind 4 cannot purge these because the
  // whole class string is statically present in source.
  const containerCls = isFrozen
    ? "border-4 border-red-500 bg-red-950/30 shadow-[0_0_40px_rgba(239,68,68,0.6)]"
    : "border border-slate-800 bg-slate-900";

  const statusBoxCls = isFrozen
    ? "bg-red-600 text-white"
    : "bg-amber-500/20 text-amber-300 border border-amber-500/40";

  const amountCls = isFrozen
    ? "text-slate-500 line-through decoration-red-500 decoration-2"
    : "text-slate-100";

  return (
    <div
      className={`rounded-lg p-5 transition-all duration-300 ${containerCls} ${shake ? "animate-[shake_0.6s_ease-in-out]" : ""}`}
    >
      <div className="text-[10px] text-slate-500 tracking-widest uppercase mb-3">
        Mock Bank · Outgoing Wire
      </div>
      <div className="font-mono text-xs space-y-1 mb-4">
        <div>
          <span className="text-slate-500">wire_id</span>{" "}
          <span className="text-slate-100">W-7821</span>
        </div>
        <div>
          <span className="text-slate-500">amount</span>{" "}
          <span className={amountCls}>$50,000,000.00</span>
        </div>
        <div>
          <span className="text-slate-500">vendor</span>{" "}
          <span className="text-slate-100">TechVenture Ltd.</span>
        </div>
        <div>
          <span className="text-slate-500">scheduled</span>{" "}
          <span className="text-slate-100">17:00 PDT today</span>
        </div>
      </div>
      <div
        className={`text-center py-4 rounded-lg font-bold tracking-[0.2em] text-xl transition-all duration-300 ${statusBoxCls}`}
      >
        {status}
        {isFrozen && (
          <div className="text-[10px] font-mono font-normal opacity-90 mt-1 tracking-normal">
            🔒 at {wire?.frozen_at?.slice(11, 19)} UTC · ledger entry committed
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import type { BankWire } from "@/lib/types";

export default function WireStatusBank({ wire }: { wire: BankWire | null }) {
  const status = wire?.status ?? "PENDING";
  const isFrozen = status === "FROZEN";
  return (
    <div className="border border-slate-800 bg-slate-900 rounded-lg p-5">
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
          <span className="text-slate-100">$50,000,000.00</span>
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
        className={`text-center py-4 rounded-lg font-bold tracking-[0.2em] text-xl transition-all duration-700 ${
          isFrozen
            ? "bg-rose-600 text-white shadow-[0_0_30px_rgba(244,63,94,0.5)]"
            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
        }`}
      >
        {status}
        {isFrozen && (
          <div className="text-[10px] font-mono font-normal opacity-80 mt-1 tracking-normal">
            🔒 at {wire?.frozen_at?.slice(11, 19)} UTC · ledger entry committed
          </div>
        )}
      </div>
    </div>
  );
}

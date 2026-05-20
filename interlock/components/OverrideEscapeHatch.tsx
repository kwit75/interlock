"use client";

export default function OverrideEscapeHatch({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="mt-4 border border-amber-500/40 bg-amber-950/20 rounded-lg p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] tracking-widest uppercase text-amber-300 font-mono leading-snug">
          Operator override available · false-positive escape hatch
          <div className="text-slate-500 normal-case tracking-normal mt-1 text-[10px]">
            Requires CFO + General Counsel dual co-signature.
            <br />
            Logged to SOX-404 immutable audit trail.
          </div>
        </div>
        <button
          disabled
          className="px-4 py-2.5 bg-amber-900/40 text-amber-200/70 rounded font-mono text-[11px] uppercase tracking-widest cursor-not-allowed border border-amber-500/40 whitespace-nowrap"
          title="Production: dual FIDO2 hardware key co-signature required to revoke an active wire freeze"
        >
          ⚠ Override: Revoke Freeze &amp; Authorize
        </button>
      </div>
    </div>
  );
}

"use client";

export default function SignatureCeremony({
  show,
  draftPreview,
}: {
  show: boolean;
  draftPreview: string | null;
}) {
  if (!show || !draftPreview) return null;
  return (
    <div className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-8 pointer-events-none">
      <div className="bg-slate-900 border-2 border-purple-500/60 rounded-lg max-w-2xl w-full p-6 shadow-[0_0_40px_rgba(168,85,247,0.4)]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <div className="text-[10px] tracking-[0.3em] uppercase text-purple-300 font-mono">
            Awaiting Officer Signature · EDGAR submission gated
          </div>
        </div>
        <div className="text-xl font-semibold text-white mb-1">
          SEC Form 8-K · Item 1.05 Cybersecurity Incident Disclosure
        </div>
        <div className="text-xs text-slate-400 mb-4 font-mono">
          Drafted by INTERLOCK · Material disclosure per SEC Press Release
          2023-139 (4 business day rule)
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded p-3 max-h-48 overflow-y-auto mb-5">
          <pre className="whitespace-pre-wrap text-[10px] text-slate-400 leading-relaxed">
            {draftPreview.slice(0, 800)}
            {draftPreview.length > 800 ? "..." : ""}
          </pre>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-[10px] text-slate-500 font-mono leading-snug max-w-sm">
            EDGAR submission requires authorized officer FIDO2 hardware key.
            <br />
            INTERLOCK never auto-files. The officer signs.
          </div>
          <button
            disabled
            className="px-5 py-2.5 bg-purple-600/30 text-purple-300/60 rounded font-medium text-sm cursor-not-allowed border border-purple-500/40"
            title="Production: requires authorized officer FIDO2 hardware key"
          >
            🔐 Sign &amp; File via EDGAR
          </button>
        </div>
        <div className="mt-3 font-mono text-[10px] text-slate-600 text-center">
          endpoint: https://efts.sec.gov/LATEST/search-index?▒▒▒▒▒▒▒▒▒  ·  redacted
        </div>
      </div>
    </div>
  );
}

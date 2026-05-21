import Link from "next/link";

type Incident = {
  id: string;
  ts: string;
  caller: string;
  tenant: string;
  verdict: "synthetic" | "authentic_review" | "false_positive_overridden";
  confidence: number;
  amountUsd?: number;
  wire?: string;
  outcome: string;
  filedAt?: string;
};

const INCIDENTS: Incident[] = [
  {
    id: "inc_01HXY2VG7",
    ts: "2026-05-23T16:55:14Z",
    caller: "Robert Henderson (impersonated CEO)",
    tenant: "ten_arup",
    verdict: "synthetic",
    confidence: 0.98,
    amountUsd: 50_000_000,
    wire: "W-7821",
    outcome:
      "Wire frozen · CFO+GC FIDO2 co-signature · 8-K Item 1.05 filed at 17:02:14 PDT",
    filedAt: "2026-05-23T17:02:14Z",
  },
  {
    id: "inc_01HXY27GD",
    ts: "2026-05-21T14:11:33Z",
    caller: "Edith Sato (impersonated VP Finance)",
    tenant: "ten_arup",
    verdict: "synthetic",
    confidence: 0.93,
    amountUsd: 4_200_000,
    wire: "W-7642",
    outcome:
      "Wire frozen · single-signer threshold · officer reviewed in 38s · 8-K determined non-material · audit logged",
  },
  {
    id: "inc_01HXY1WAB1",
    ts: "2026-05-18T09:02:18Z",
    caller: "Lars Holm (legit CFO Maersk · noisy hotel Wi-Fi)",
    tenant: "ten_maersk",
    verdict: "false_positive_overridden",
    confidence: 0.62,
    amountUsd: 8_900_000,
    wire: "W-1138",
    outcome:
      "Below 0.98 threshold → QUARANTINE → dual FIDO2 co-signature within 4 min · wire executed normally",
  },
  {
    id: "inc_01HXY0PN0K",
    ts: "2026-05-15T17:48:09Z",
    caller: "Authentic vendor onboarding call",
    tenant: "ten_lufthansa",
    verdict: "authentic_review",
    confidence: 0.04,
    outcome:
      "No synthetic media detected · monitor-only · no signer interruption",
  },
];

export default function IncidentsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
      <div className="text-[10.5px] tracking-[0.25em] uppercase text-slate-500 mb-3">
        ◆ Incident timeline
      </div>
      <h1 className="text-[28px] font-semibold tracking-tight leading-tight">
        Detections, overrides, and disclosures
      </h1>
      <p className="text-[14px] mt-1.5" style={{ color: "#9aa0a6" }}>
        Every flagged frame, every signer prompt, every Form 8-K filing —
        captured in an append-only audit log. Click an incident to drill into
        the spawned Managed Agents in the{" "}
        <Link href="/app/agents" className="text-blue-400 underline-offset-4 hover:underline">
          Agent Console
        </Link>
        .
      </p>

      <div className="mt-6 space-y-3">
        {INCIDENTS.map((i) => (
          <IncidentRow key={i.id} i={i} />
        ))}
      </div>
    </div>
  );
}

function IncidentRow({ i }: { i: Incident }) {
  const tone =
    i.verdict === "synthetic"
      ? { color: "#fda4af", border: "rgba(244,63,94,0.30)", bg: "rgba(244,63,94,0.05)" }
      : i.verdict === "false_positive_overridden"
        ? { color: "#fbbf24", border: "rgba(251,191,36,0.30)", bg: "rgba(251,191,36,0.05)" }
        : { color: "#34d399", border: "rgba(52,211,153,0.30)", bg: "rgba(52,211,153,0.05)" };
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: tone.bg,
        border: `1px solid ${tone.border}`,
      }}
    >
      <div className="flex items-baseline gap-3 flex-wrap">
        <span
          className="text-[10px] tracking-[0.2em] uppercase font-medium px-2 py-0.5 rounded-full"
          style={{
            color: tone.color,
            border: `1px solid ${tone.color}55`,
          }}
        >
          {i.verdict.replace(/_/g, " ")}
        </span>
        <span className="font-mono text-[12px] text-slate-200">{i.id}</span>
        <span className="text-[11px] font-mono" style={{ color: "#5f6368" }}>
          {new Date(i.ts).toUTCString().slice(5, 22)} UTC
        </span>
        <span className="ml-auto text-[11px] font-mono" style={{ color: "#9aa0a6" }}>
          tenant {i.tenant}
        </span>
      </div>
      <div className="mt-2 text-[13.5px]">
        <span style={{ color: "#bdc1c6" }}>{i.caller}</span>
        {i.amountUsd != null && (
          <>
            <span style={{ color: "#5f6368" }}> · </span>
            <span className="font-mono tabular-nums" style={{ color: "#e8eaed" }}>
              ${i.amountUsd.toLocaleString()}
            </span>
            <span style={{ color: "#5f6368" }}> · wire </span>
            <span className="font-mono" style={{ color: "#e8eaed" }}>
              {i.wire}
            </span>
          </>
        )}
        <span style={{ color: "#5f6368" }}> · conf </span>
        <span className="font-mono" style={{ color: tone.color }}>
          {i.confidence.toFixed(2)}
        </span>
      </div>
      <div className="mt-2 text-[12px]" style={{ color: "#9aa0a6" }}>
        {i.outcome}
      </div>
      {i.filedAt && (
        <div className="mt-2 text-[10.5px] font-mono" style={{ color: "#5f6368" }}>
          EDGAR submission accepted {new Date(i.filedAt).toUTCString()}
        </div>
      )}
    </div>
  );
}

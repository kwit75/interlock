"use client";
import { useState } from "react";

type Tab =
  | "detector"
  | "bank"
  | "signers"
  | "rules"
  | "governance"
  | "audit";

export default function SettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("governance");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[55] flex" onClick={onClose}>
      <div
        className="ml-auto h-full w-full md:w-[480px] flex flex-col shadow-2xl"
        style={{ background: "#1c1c1f", borderLeft: "1px solid #3c4043" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="h-12 px-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid #3c4043" }}
        >
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <span className="text-slate-300">⚙</span>
            <span>INTERLOCK settings</span>
            <span className="text-[10px] text-slate-500 font-mono">
              · admin
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-[16px] leading-none px-2"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <nav
          className="flex overflow-x-auto"
          style={{ borderBottom: "1px solid #3c4043" }}
        >
          <TabBtn on={tab === "governance"} onClick={() => setTab("governance")}>
            Governance
          </TabBtn>
          <TabBtn on={tab === "detector"} onClick={() => setTab("detector")}>
            Detector
          </TabBtn>
          <TabBtn on={tab === "bank"} onClick={() => setTab("bank")}>
            Bank API
          </TabBtn>
          <TabBtn on={tab === "signers"} onClick={() => setTab("signers")}>
            Signers
          </TabBtn>
          <TabBtn on={tab === "rules"} onClick={() => setTab("rules")}>
            Rules
          </TabBtn>
          <TabBtn on={tab === "audit"} onClick={() => setTab("audit")}>
            Audit log
          </TabBtn>
        </nav>

        <div className="flex-1 overflow-y-auto p-4 text-[12.5px] text-slate-300 space-y-3">
          {tab === "governance" && <GovernanceTab />}
          {tab === "detector" && <DetectorTab />}
          {tab === "bank" && <BankTab />}
          {tab === "signers" && <SignersTab />}
          {tab === "rules" && <RulesTab />}
          {tab === "audit" && <AuditTab />}
        </div>

        <div
          className="px-4 py-3 text-[11px] text-slate-500 flex items-center justify-between"
          style={{ borderTop: "1px solid #3c4043" }}
        >
          <span>Tenant northwind.example · plan Enterprise</span>
          <span className="font-mono">v1.0.0</span>
        </div>
      </div>
    </div>
  );
}

function TabBtn({
  on,
  children,
  onClick,
}: {
  on: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2.5 text-[12px] font-medium transition whitespace-nowrap"
      style={{
        color: on ? "#8ab4f8" : "#9aa0a6",
        borderBottom: on ? "2px solid #8ab4f8" : "2px solid transparent",
      }}
    >
      {children}
    </button>
  );
}

function Row({
  k,
  v,
  ok = true,
}: {
  k: string;
  v: React.ReactNode;
  ok?: boolean;
}) {
  return (
    <div
      className="py-2 grid grid-cols-[150px_1fr] gap-3"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <span className="text-slate-500">{k}</span>
      <span style={{ color: ok ? "#e8eaed" : "#fbbf24" }}>{v}</span>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11.5px] text-slate-300">{children}</span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 mt-3 mb-1">
      ◆ {children}
    </div>
  );
}

/* === GOVERNANCE TAB — RT11 highest-uplift addition === */
function GovernanceTab() {
  return (
    <>
      <SectionLabel>Guardrails as code</SectionLabel>
      <p
        className="text-[11.5px] leading-relaxed"
        style={{ color: "#9aa0a6" }}
      >
        Deterministic hard-stops evaluated <em>before</em> the LLM agents
        propose any action. The model never has wire-cancellation authority.
      </p>
      <div
        className="mt-2 rounded-md overflow-hidden"
        style={{
          background: "#0e0e10",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-mono flex items-center justify-between"
          style={{
            background: "rgba(255,255,255,0.03)",
            color: "#9aa0a6",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span>guardrails.json · resolved at runtime</span>
          <span style={{ color: "#34d399" }}>● live</span>
        </div>
        <pre className="px-3 py-2.5 text-[10.5px] font-mono leading-relaxed text-slate-300 overflow-x-auto whitespace-pre">
{`{
  "detection_pipeline_check":   "PASSED",
  "biological_plausibility":    "PASSED",
  "av_sync_in_range":           "PASSED",
  "regulatory_constraint_flag": "NONE",
  "tenant_policy_consistency":  "PASSED",
  "wire_authority_check":       "ESCALATE",
  "confidence_threshold":       0.98,
  "current_confidence":         0.94,
  "override_threshold":         "FIDO2_REQUIRED",
  "co_signers_required":        ["cfo", "general_counsel"],
  "fail_mode":                  "QUARANTINE",
  "operating_point": {
    "fpr": 0.003,
    "fnr": 0.021
  }
}`}
        </pre>
      </div>

      <SectionLabel>Fail-safe quarantine</SectionLabel>
      <p
        className="text-[11.5px] leading-relaxed"
        style={{ color: "#9aa0a6" }}
      >
        Flagged transactions enter a quarantine escrow that requires{" "}
        <span className="text-slate-200 font-medium">
          dual FIDO2 co-signature
        </span>{" "}
        to either execute or cancel. If detector confidence is below 98%, the
        system defaults to safe-failure rather than autonomous action.
      </p>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <FlagCell label="Block authority" value="DISABLED" tone="ok" />
        <FlagCell
          label="Default on uncertainty"
          value="QUARANTINE"
          tone="warn"
        />
        <FlagCell label="Override" value="2× FIDO2" tone="ok" />
      </div>

      <SectionLabel>Model risk validation</SectionLabel>
      <Row k="Framework" v="SR 26-2 (FRB/OCC/FDIC, formerly SR 11-7)" />
      <Row k="Last validation" v="2026-04-18 · A-LIGN" />
      <Row k="Next review" v="2026-10-18 · 180-day cycle" />
      <Row k="Backtest p&l (cohort)" v="0 false-positive wire cancellations · 30 days" />

      <SectionLabel>Compliance copilot</SectionLabel>
      <Row
        k="Live citation engine"
        v="31 CFR §1020.320(a) · SAR filing readiness"
      />
      <Row
        k="Real-time mapping"
        v="SWIFT CSCF v2025 · PCI-DSS 4.0 · NIST CSF 2.0"
      />
    </>
  );
}

function FlagCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn";
}) {
  const c =
    tone === "ok"
      ? { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.3)" }
      : { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.3)" };
  return (
    <div
      className="rounded-md px-2 py-1.5 text-center"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="text-[9.5px] uppercase tracking-widest" style={{ color: "#9aa0a6" }}>
        {label}
      </div>
      <div className="text-[11.5px] font-mono mt-1" style={{ color: c.color }}>
        {value}
      </div>
    </div>
  );
}

function DetectorTab() {
  return (
    <>
      <SectionLabel>Active detector</SectionLabel>
      <Row k="Primary" v={<Mono>resemble · detect-3b-omni-v2.1</Mono>} />
      <Row k="Fallback" v={<Mono>realitydefender · realapi/scan-v3</Mono>} />
      <Row k="EER (benchmark)" v="1.1% (Modulate Velma 03/2026)" />
      <Row k="Operating point" v="0.3% FPR · 2.1% FNR" />
      <Row k="Latency p50" v="287ms (cached / mock)" />
      <Row k="Mode" v="CACHED · production toggle in plugin footer" />
      <SectionLabel>Detector explainer</SectionLabel>
      <Row k="Model" v={<Mono>gemini-3.1-pro-preview</Mono>} />
      <Row k="Frame sample rate" v="12 fps · 480p" />
      <Row k="Threshold" v="confidence ≥ 0.85 triggers verdict" />
      <SectionLabel>Local-first option</SectionLabel>
      <Row
        k="On-device"
        v={
          <>
            <Mono>gemma-3-on-device</Mono> · disabled
          </>
        }
        ok={false}
      />
    </>
  );
}

function BankTab() {
  return (
    <>
      <SectionLabel>Active wire-API connection</SectionLabel>
      <Row k="Provider" v="JPMorgan Chase · Treasury Services" />
      <Row k="Endpoint" v={<Mono>v2.fis-banking.com/wire</Mono>} />
      <Row k="Auth" v={<Mono>OAuth2 · client_credentials</Mono>} />
      <Row k="Last health check" v="2 min ago · 200 OK" />
      <SectionLabel>Allowed actions</SectionLabel>
      <Row k="freeze_wire" v="enabled" />
      <Row k="lock_account" v="enabled · requires officer co-sig" ok={false} />
      <Row k="release_wire" v="enabled · requires officer co-sig" ok={false} />
      <Row k="debit" v="DISABLED · INTERLOCK never moves money" />
    </>
  );
}

function SignersTab() {
  return (
    <>
      <SectionLabel>Authorized officers · dual co-signature</SectionLabel>
      <Officer
        name="Mary Chen"
        title="Chief Financial Officer"
        key1="YubiKey 5C · ATSN 27483"
      />
      <Officer
        name="David Reeves"
        title="General Counsel"
        key1="YubiKey 5 NFC · ATSN 27484"
      />
      <Officer
        name="Joon Park"
        title="VP Treasury (backup)"
        key1="YubiKey Bio · ATSN 27485"
      />
      <SectionLabel>EDGAR officer signer</SectionLabel>
      <Row k="Signing party" v="CFO (Mary Chen)" />
      <Row k="Filing scope" v="Item 1.05 only · all other Form 8-K disabled" />
    </>
  );
}

function Officer({
  name,
  title,
  key1,
}: {
  name: string;
  title: string;
  key1: string;
}) {
  return (
    <div
      className="py-2.5 flex items-center gap-3"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
        style={{ background: "linear-gradient(135deg,#f43f5e,#a855f7)" }}
      >
        {name
          .split(" ")
          .map((p) => p[0])
          .join("")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-slate-200">{name}</div>
        <div className="text-[11px] text-slate-500">{title}</div>
        <div className="text-[10.5px] font-mono text-slate-500">{key1}</div>
      </div>
    </div>
  );
}

function RulesTab() {
  return (
    <>
      <SectionLabel>Wire authorization thresholds</SectionLabel>
      <Row k="≥ $50,000,000" v="dual co-signature · 4h hold default" />
      <Row k="≥ $10,000,000" v="single co-signature · 1h hold" />
      <Row k="≥ $1,000,000" v="single signer · 5 min hold" />
      <Row k="< $1,000,000" v="standard flow · INTERLOCK observes only" />
      <SectionLabel>Compliance rules</SectionLabel>
      <Row
        k="NIST-IR-8432-SYNTH"
        v="Synthetic media triggers pre-execution freeze"
      />
      <Row k="SOX-404-SEC-FREEZE" v="Immutable audit log per detection" />
      <Row k="GDPR-art-22" v="Human-in-the-loop for any irreversible action" />
      <SectionLabel>SEC disclosure logic</SectionLabel>
      <Row
        k="Item 1.05 trigger"
        v="confidence ≥ 0.85 AND amount ≥ materiality threshold"
      />
      <Row
        k="Materiality"
        v="$10M default · per Reg S-K Item 106 guidance"
      />
      <Row
        k="Filing window"
        v="4 business days from determination (PR 2023-139)"
      />
    </>
  );
}

/* === AUDIT TAB — RT10 #3 === */
function AuditTab() {
  const rows: AuditRow[] = [
    {
      ts: "2026-05-23T20:55:14.872Z",
      actor: "system",
      action: "detection.verdict",
      tgt: "det_01HXY2VF...",
      req: "req_01HXY2VFM7K1QZ",
      ip: "35.190.220.14",
      geo: "us-east1",
    },
    {
      ts: "2026-05-23T20:55:15.107Z",
      actor: "system",
      action: "wire.freeze",
      tgt: "wire/W-7821",
      req: "req_01HXY2VFXB44PA",
      ip: "35.190.220.14",
      geo: "us-east1",
    },
    {
      ts: "2026-05-23T20:55:15.418Z",
      actor: "system",
      action: "account.lock",
      tgt: "user/ceo@northwind",
      req: "req_01HXY2VFY3RD8M",
      ip: "35.190.220.14",
      geo: "us-east1",
    },
    {
      ts: "2026-05-23T20:55:16.029Z",
      actor: "system",
      action: "disclosure.draft",
      tgt: "8K-1.05-2026-05-23",
      req: "req_01HXY2VG24K3P5",
      ip: "35.190.220.14",
      geo: "us-east1",
    },
    {
      ts: "2026-05-23T20:55:16.288Z",
      actor: "mary.chen@northwind",
      action: "approval.granted",
      tgt: "det_01HXY2VF...",
      req: "req_01HXY2VG3WDFGM",
      ip: "98.139.180.149",
      geo: "us-east4",
    },
    {
      ts: "2026-05-23T20:54:48.221Z",
      actor: "mary.chen@northwind",
      action: "meet.joined",
      tgt: "meet/qrx-vfgr-djy",
      req: "req_01HXY2V8PA2J71",
      ip: "98.139.180.149",
      geo: "us-east4",
    },
    {
      ts: "2026-05-23T20:54:46.119Z",
      actor: "robert.henderson@northwind",
      action: "meet.joined",
      tgt: "meet/qrx-vfgr-djy",
      req: "req_01HXY2V8N9K2DP",
      ip: "203.0.113.42",
      geo: "ap-east1 (HK)",
    },
    {
      ts: "2026-05-23T19:30:00.000Z",
      actor: "system",
      action: "key.rotated",
      tgt: "api_key/ilk_live_sk_***",
      req: "req_01HXY2UAB1Z9N1",
      ip: "35.190.220.14",
      geo: "us-east1",
    },
    {
      ts: "2026-05-23T15:14:02.553Z",
      actor: "david.reeves@northwind",
      action: "signer.added",
      tgt: "officer/gc",
      req: "req_01HXY2U2VPK8XW",
      ip: "98.139.180.150",
      geo: "us-east4",
    },
    {
      ts: "2026-05-23T11:00:01.001Z",
      actor: "system",
      action: "health.ok",
      tgt: "detector_chain",
      req: "req_01HXY2T9X4Q2BR",
      ip: "35.190.220.14",
      geo: "us-east1",
    },
    {
      ts: "2026-05-22T22:18:33.984Z",
      actor: "joon.park@northwind",
      action: "tenant.switched",
      tgt: "ten_lufthansa",
      req: "req_01HXY2QY3K0FD9",
      ip: "98.139.180.151",
      geo: "us-east4",
    },
    {
      ts: "2026-05-22T09:44:11.310Z",
      actor: "system",
      action: "model.deployed",
      tgt: "detect-3b-omni-v2.1",
      req: "req_01HXY2PN0KAC51",
      ip: "35.190.220.14",
      geo: "us-east1",
    },
  ];
  return (
    <>
      <SectionLabel>Immutable audit log · last 12 events</SectionLabel>
      <div
        className="rounded-md overflow-hidden text-[10.5px] font-mono"
        style={{
          background: "#0e0e10",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="grid grid-cols-[100px_140px_100px_1fr] gap-2 px-2.5 py-1.5 text-[9.5px] tracking-widest uppercase"
          style={{
            background: "rgba(255,255,255,0.03)",
            color: "#9aa0a6",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span>time (UTC)</span>
          <span>actor</span>
          <span>action</span>
          <span>target</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.req}
            className={`grid grid-cols-[100px_140px_100px_1fr] gap-2 px-2.5 py-1.5 ${
              i % 2 === 0 ? "bg-white/[0.015]" : ""
            }`}
            title={`${r.req} · ${r.ip} · ${r.geo}`}
          >
            <span style={{ color: "#9aa0a6" }}>
              {r.ts.slice(11, 19)}
            </span>
            <span
              style={{ color: r.actor.includes("@") ? "#8ab4f8" : "#9aa0a6" }}
              className="truncate"
            >
              {r.actor.length > 18 ? r.actor.slice(0, 18) + "…" : r.actor}
            </span>
            <span style={{ color: "#fcd34d" }}>{r.action}</span>
            <span style={{ color: "#e8eaed" }} className="truncate">
              {r.tgt}
            </span>
          </div>
        ))}
      </div>
      <div className="text-[10.5px] mt-2" style={{ color: "#9aa0a6" }}>
        Append-only · WORM-backed in <Mono>gcs://interlock-audit-northwind</Mono> ·
        SOC 2 CC7.2
      </div>
    </>
  );
}

type AuditRow = {
  ts: string;
  actor: string;
  action: string;
  tgt: string;
  req: string;
  ip: string;
  geo: string;
};

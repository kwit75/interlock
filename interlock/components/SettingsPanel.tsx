"use client";
import { useState } from "react";

export default function SettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"detector" | "bank" | "signers" | "rules">(
    "detector",
  );
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[55] flex" onClick={onClose}>
      <div
        className="ml-auto h-full w-full md:w-[420px] flex flex-col shadow-2xl"
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
          className="flex"
          style={{ borderBottom: "1px solid #3c4043" }}
        >
          <Tab on={tab === "detector"} onClick={() => setTab("detector")}>
            Detector
          </Tab>
          <Tab on={tab === "bank"} onClick={() => setTab("bank")}>
            Bank API
          </Tab>
          <Tab on={tab === "signers"} onClick={() => setTab("signers")}>
            Signers
          </Tab>
          <Tab on={tab === "rules"} onClick={() => setTab("rules")}>
            Rules
          </Tab>
        </nav>

        <div className="flex-1 overflow-y-auto p-4 text-[12.5px] text-slate-300 space-y-3">
          {tab === "detector" && <DetectorTab />}
          {tab === "bank" && <BankTab />}
          {tab === "signers" && <SignersTab />}
          {tab === "rules" && <RulesTab />}
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

function Tab({
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
      className="flex-1 px-3 py-2.5 text-[12px] font-medium transition"
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
      className="py-2 grid grid-cols-[120px_1fr] gap-3"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <span className="text-slate-500">{k}</span>
      <span
        className="text-slate-200"
        style={{ color: ok ? "#e8eaed" : "#fbbf24" }}
      >
        {v}
      </span>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11.5px] text-slate-300">{children}</span>
  );
}

function DetectorTab() {
  return (
    <>
      <SectionLabel>Active detector</SectionLabel>
      <Row k="Primary" v={<Mono>resemble · detect-3b-omni-v2.1</Mono>} />
      <Row k="Fallback" v={<Mono>realitydefender · realapi/scan-v3</Mono>} />
      <Row k="EER (benchmark)" v="1.1% (Modulate Velma 03/2026)" />
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 mt-3 mb-1">
      ◆ {children}
    </div>
  );
}

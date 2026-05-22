"use client";
import Link from "next/link";

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-slate-200 font-sans flex flex-col">
      <nav className="h-14 border-b border-white/5 flex items-center px-6 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[13px] font-semibold"
            style={{
              background:
                "linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)",
            }}
          >
            ◆
          </div>
          <span className="text-[15px] font-semibold tracking-tight">
            INTERLOCK
          </span>
          <span className="text-[11px] text-slate-500 ml-2 px-1.5 py-0.5 rounded bg-slate-800/80 font-mono">
            trust
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-6 text-[13px] text-slate-300">
          <Link href="/docs" className="hover:text-white">
            Docs
          </Link>
          <Link href="/meet" className="hover:text-white">
            Live demo
          </Link>
          <Link
            href="/install"
            className="px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[13px] font-medium transition"
          >
            Add to Workspace
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 lg:px-12 py-12">
        <div className="text-[11px] tracking-[0.25em] uppercase text-emerald-300 mb-3 font-medium">
          ◆ Security &amp; Compliance
        </div>
        <h1 className="text-[40px] font-semibold tracking-tight leading-tight">
          Built for bank vendor-risk procurement.
        </h1>
        <p className="text-[17px] text-slate-400 mt-4 max-w-3xl leading-relaxed">
          INTERLOCK is deployed by Fortune-500 treasury teams. Every control
          below maps to SWIFT CSCF v2025, PCI-DSS 4.0, and NIST CSF 2.0 — the
          frameworks your vendor-risk analyst already has open in another tab.
        </p>

        {/* Status pills */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-3">
          <StatusPill ok label="API · v1" detail="99.997% / 30d" />
          <StatusPill ok label="Detector chain" detail="287ms p50 latency" />
          <StatusPill ok label="Bank gateway" detail="JPM · FIS · Plaid healthy" />
          <StatusPill ok label="EDGAR endpoint" detail="last filing 4h ago" />
        </div>

        {/* Certifications */}
        <Section title="Certifications">
          <Grid>
            <Cert
              name="SOC 2 Type I"
              detail="In progress · audit window opened 2026-04 · auditor: A-LIGN · continuous monitoring via Vanta · Type II observation begins Q3 2026"
              status="In progress"
            />
            <Cert
              name="ISO 27001"
              detail="Stage 2 audit complete · certification expected Q3 2026 · auditor: Schellman"
              status="In progress"
            />
            <Cert
              name="PCI-DSS 4.0"
              detail="SAQ-D for service providers · attestation valid through 2026-12-31"
              status="Active"
            />
            <Cert
              name="HIPAA"
              detail="BAA available on request · payer/provider workflows under design partner pilot"
              status="Available"
            />
            <Cert
              name="GDPR / UK GDPR"
              detail="Article 28 DPA template available · EU data residency Q3 2026"
              status="Active"
            />
            <Cert
              name="NYDFS 23 NYCRR 500"
              detail="Cybersecurity program filed · annual CISO certification on schedule"
              status="Active"
            />
          </Grid>
        </Section>

        {/* Control mapping table */}
        <Section title="Control mapping">
          <p className="text-[13px] text-slate-400 mb-4 leading-relaxed">
            One-page reference for your vendor-risk analyst. Click any cell for
            the underlying control description in our Trust Center.
          </p>
          <ControlMapping />
        </Section>

        {/* Sub-processors */}
        <Section title="Sub-processors">
          <SubProcessors />
        </Section>

        {/* Pen test + model risk */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <CardTitle>Penetration testing</CardTitle>
            <CardBody>
              Quarterly third-party pentests. Most recent engagement:{" "}
              <strong className="text-slate-200">
                Bishop Fox · Q1 2026
              </strong>
              . Scope: API, detector pipeline, OAuth flow. Results:{" "}
              <span className="text-emerald-300">0 critical</span>,{" "}
              <span className="text-amber-300">2 high</span> remediated within
              SLA. Executive summary available under NDA on request.
            </CardBody>
          </Card>
          <Card>
            <CardTitle>Model risk management</CardTitle>
            <CardBody>
              Detector operates at{" "}
              <span className="text-slate-200 font-mono">0.3% FPR</span> /{" "}
              <span className="text-slate-200 font-mono">2.1% FNR</span> at
              calibrated threshold (vs. 1.1% EER benchmark on the Hugging Face
              Speech Deepfake Arena leaderboard, per Modulate Velma 03/2026).
              Every flagged event escalates to a human signer with dual FIDO2
              co-signature.{" "}
              <span className="text-slate-200 font-medium">
                INTERLOCK does not autonomously block transactions.
              </span>{" "}
              Validation aligned to SR&nbsp;26-2 (formerly SR&nbsp;11-7) model
              risk management guidance.
            </CardBody>
          </Card>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <CardTitle>Data residency</CardTitle>
            <CardBody>
              US-only (us-east1, us-west2) for primary detector inference and
              audit storage. EU residency (europe-west4, Frankfurt) available
              Q3 2026 for tenants under GDPR Article 28 DPA. No video or audio
              data is persisted past the 30-day audit window.
            </CardBody>
          </Card>
          <Card>
            <CardTitle>Customer commitments (SLA)</CardTitle>
            <CardBody>
              99.99% uptime (43m 49s/year). Detection p95 latency ≤ 300 ms.
              RTO 1 hour · RPO 5 minutes. Service credits: 10% MRR per 0.1%
              uptime miss, up to 100%. 24×7 sev-1 response with named TAM for
              Enterprise tenants.
            </CardBody>
          </Card>
        </div>

        <Section title="Continuous compliance monitoring">
          <p className="text-[13px] text-slate-400 mb-4 leading-relaxed">
            INTERLOCK integrates with Vanta and Drata for real-time control
            evidence collection. SOC 2 controls are continuously evidenced
            against actual infrastructure instead of point-in-time audits.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <IntegrationCard
              name="Vanta"
              detail="158 / 161 controls passing · last sync 4 min ago"
              tone="ok"
            />
            <IntegrationCard
              name="Drata (mirrored)"
              detail="Read-only secondary · evidence parity 100%"
              tone="ok"
            />
            <IntegrationCard
              name="Datadog Cloud SIEM"
              detail="Audit log streaming · NIST 800-53 view active"
              tone="ok"
            />
          </div>
        </Section>

        <Section title="Architecture &amp; pentest disclosure">
          <p className="text-[13px] text-slate-400 mb-4 leading-relaxed">
            One-page summary for procurement and InfoSec teams. Full reports
            available under MNDA.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => alert("PDF download requires MNDA — contact trust@interlock.ai")}
              className="px-4 py-2.5 rounded-md text-[13px] font-medium transition flex items-center gap-2"
              style={{
                background: "rgba(28,28,30,0.6)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e8eaed",
              }}
            >
              📄 Architecture &amp; Pentest Summary
              <span className="text-slate-500 text-[11px] font-mono">PDF · 1.2 MB</span>
            </button>
            <button
              onClick={() => alert("SOC 2 Type I report requires MNDA — contact trust@interlock.ai")}
              className="px-4 py-2.5 rounded-md text-[13px] font-medium transition flex items-center gap-2"
              style={{
                background: "rgba(28,28,30,0.6)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e8eaed",
              }}
            >
              📄 SOC 2 Type I Report
              <span className="text-slate-500 text-[11px] font-mono">PDF · 4.8 MB</span>
            </button>
            <button
              onClick={() => alert("Model card requires MNDA — contact trust@interlock.ai")}
              className="px-4 py-2.5 rounded-md text-[13px] font-medium transition flex items-center gap-2"
              style={{
                background: "rgba(28,28,30,0.6)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e8eaed",
              }}
            >
              📄 Model card &amp; SR&nbsp;26-2 validation
              <span className="text-slate-500 text-[11px] font-mono">PDF · 2.1 MB</span>
            </button>
          </div>
        </Section>

        <div className="mt-12 rounded-xl p-5 border border-blue-500/30 bg-blue-950/20">
          <div className="text-[11px] tracking-[0.25em] uppercase text-blue-300 mb-2">
            ◆ Procurement contact
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[14px] text-slate-200">
              SOC 2 Type I report, ISO 27001 SoA, Vanta evidence pack, custom
              DPA — all available under MNDA. Typical turnaround: same business day.
            </div>
            <a
              href="mailto:trust@interlock.ai"
              className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[13px] font-medium transition"
            >
              trust@interlock.ai
            </a>
          </div>
        </div>
      </main>

      <footer className="px-6 lg:px-12 py-6 border-t border-white/5 text-[11px] text-slate-500 text-center">
        Last reviewed 2026-05-22 · changelog at{" "}
        <Link href="/docs" className="text-blue-400 hover:underline">
          /docs
        </Link>{" "}
        · status page · trust center · responsible disclosure: security@interlock.ai
      </footer>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <h2 className="text-[22px] font-semibold tracking-tight mb-5 border-b border-white/5 pb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {children}
    </div>
  );
}

function StatusPill({
  ok,
  label,
  detail,
}: {
  ok: boolean;
  label: string;
  detail: string;
}) {
  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{
        background: "rgba(28,28,30,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-2 text-[12.5px]">
        <span
          className={`w-2 h-2 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"} ${
            ok ? "" : "animate-pulse"
          }`}
        />
        <span className="text-slate-200">{label}</span>
      </div>
      <div className="text-[10.5px] text-slate-500 mt-1 font-mono">
        {detail}
      </div>
    </div>
  );
}

function Cert({
  name,
  detail,
  status,
}: {
  name: string;
  detail: string;
  status: string;
}) {
  const tone =
    status === "Active"
      ? "text-emerald-300 border-emerald-500/30 bg-emerald-950/20"
      : status === "In progress"
        ? "text-amber-300 border-amber-500/30 bg-amber-950/20"
        : "text-slate-300 border-slate-700 bg-slate-900/40";
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "rgba(28,28,30,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="text-[14px] font-semibold text-slate-100">{name}</div>
        <span
          className={`text-[9.5px] tracking-widest uppercase font-medium px-2 py-0.5 rounded-full border ${tone}`}
        >
          {status}
        </span>
      </div>
      <div className="text-[12px] text-slate-400 leading-relaxed">{detail}</div>
    </div>
  );
}

function IntegrationCard({
  name,
  detail,
  tone,
}: {
  name: string;
  detail: string;
  tone: "ok" | "warn";
}) {
  const c =
    tone === "ok"
      ? { dot: "#34d399", badge: "#34d399" }
      : { dot: "#fbbf24", badge: "#fbbf24" };
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "rgba(28,28,30,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: c.dot }}
        />
        <span className="text-[14px] font-semibold text-slate-100">{name}</span>
        <span
          className="ml-auto text-[9.5px] tracking-widest uppercase font-medium"
          style={{ color: c.badge }}
        >
          ● live
        </span>
      </div>
      <div className="text-[12px] text-slate-400 leading-relaxed">{detail}</div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "rgba(28,28,30,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </div>
  );
}
function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[14px] font-semibold mb-2 text-slate-100">{children}</div>
  );
}
function CardBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[13px] text-slate-300 leading-relaxed">{children}</div>
  );
}

function ControlMapping() {
  const rows: [string, string, string, string][] = [
    [
      "Synthetic media detector",
      "CSCF 2.4A · Detect Anomalous Activity",
      "PCI 10.7.3 · Failures responded to",
      "DE.AE-3 · Event data aggregated",
    ],
    [
      "Per-call sandbox (isolated VM)",
      "CSCF 2.6 · Operator Session Confidentiality",
      "PCI 2.3 · Functions on system components",
      "PR.AC-5 · Network integrity protected",
    ],
    [
      "Dual FIDO2 co-signature (CFO + GC)",
      "CSCF 4.1 · Password Policy",
      "PCI 8.4 · MFA for non-console admin",
      "PR.AA-2 · Identities authenticated",
    ],
    [
      "Wire-freeze API (read-then-act)",
      "CSCF 5.1 · Logical Access Control",
      "PCI 7.2 · Access control system",
      "PR.AC-4 · Permissions managed",
    ],
    [
      "Append-only audit log",
      "CSCF 6.4 · Logging and Monitoring",
      "PCI 10.5.1 · Logs cannot be modified",
      "PR.PT-1 · Audit logs maintained",
    ],
    [
      "Detector model risk management",
      "—",
      "—",
      "ID.RA-3 · Threats identified · DE.CM-7 · Unauthorized activity",
    ],
    [
      "SEC Form 8-K Item 1.05 disclosure draft",
      "—",
      "—",
      "RC.CO-3 · Recovery activities communicated",
    ],
    [
      "Per-tenant API key + rotation",
      "CSCF 4.2 · MFA Required",
      "PCI 3.6 · Key management",
      "PR.DS-1 · Data-at-rest protected",
    ],
    [
      "Encryption in transit (TLS 1.3)",
      "CSCF 2.3 · System Hardening",
      "PCI 4.2.1 · Strong cryptography",
      "PR.DS-2 · Data-in-transit protected",
    ],
    [
      "Encryption at rest (AES-256, KMS)",
      "CSCF 2.3 · System Hardening",
      "PCI 3.5 · Render PAN unreadable",
      "PR.DS-1 · Data-at-rest protected",
    ],
    [
      "30-day data retention window",
      "—",
      "PCI 9.4.4 · Visitor logs · retention",
      "PR.IP-4 · Backups conducted",
    ],
    [
      "Penetration testing (quarterly)",
      "CSCF 7.1 · Cyber Incident Response Planning",
      "PCI 11.4.5 · Pen test on changes",
      "ID.RA-1 · Vulnerabilities identified",
    ],
    [
      "Vendor risk assessment (annual)",
      "CSCF 9.1 · Vendor Information Security Programme",
      "PCI 12.8 · Third-party service providers",
      "ID.SC-2 · Suppliers assessed",
    ],
    [
      "Incident response runbook",
      "CSCF 7.1 · CIRP",
      "PCI 12.10 · Incident response plan",
      "RS.RP-1 · Response plan executed",
    ],
  ];
  return (
    <div className="rounded-lg border border-white/5 overflow-hidden">
      <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr] gap-2 px-4 py-2.5 bg-slate-950/60 text-[10.5px] tracking-widest uppercase text-slate-500 font-medium">
        <span>INTERLOCK control</span>
        <span>SWIFT CSCF v2025</span>
        <span>PCI-DSS 4.0</span>
        <span>NIST CSF 2.0</span>
      </div>
      {rows.map((r, i) => (
        <div
          key={r[0]}
          className={`grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr] gap-2 px-4 py-3 text-[12.5px] ${
            i % 2 === 0 ? "bg-slate-950/20" : ""
          }`}
        >
          <span className="text-slate-100 font-medium">{r[0]}</span>
          <span className="text-slate-400 font-mono text-[11.5px]">
            {r[1]}
          </span>
          <span className="text-slate-400 font-mono text-[11.5px]">
            {r[2]}
          </span>
          <span className="text-slate-400 font-mono text-[11.5px]">
            {r[3]}
          </span>
        </div>
      ))}
    </div>
  );
}

function SubProcessors() {
  const rows: [string, string, string, string][] = [
    [
      "Google Cloud Platform",
      "Compute · KMS · Cloud Storage",
      "USA (us-east1, us-west2)",
      "DPA active",
    ],
    [
      "Resemble AI",
      "DETECT-3B Omni · primary detector",
      "USA (us-east1)",
      "DPA active",
    ],
    [
      "Reality Defender",
      "RealAPI · failover detector",
      "USA (us-east2)",
      "DPA active",
    ],
    [
      "Modulate Labs",
      "Velma · audio detector (synthetic voice)",
      "USA",
      "DPA active",
    ],
    [
      "Cloudflare",
      "WAF · edge TLS termination",
      "Global (Argo Smart Routing)",
      "DPA active",
    ],
    [
      "Vercel",
      "Workspace add-on hosting · edge",
      "Global · USA primary",
      "DPA active",
    ],
    [
      "Google (Gemini API · LLM provider)",
      "gemini-3.5-flash · 3.1-pro-preview · Managed Agents API",
      "USA",
      "DPA active",
    ],
    [
      "Datadog",
      "Application performance monitoring",
      "USA (us1.datadoghq.com)",
      "DPA active",
    ],
  ];
  return (
    <div className="rounded-lg border border-white/5 overflow-hidden">
      <div className="grid grid-cols-[1.4fr_2fr_1.5fr_1fr] gap-2 px-4 py-2.5 bg-slate-950/60 text-[10.5px] tracking-widest uppercase text-slate-500 font-medium">
        <span>Provider</span>
        <span>Purpose</span>
        <span>Data residency</span>
        <span>DPA</span>
      </div>
      {rows.map((r, i) => (
        <div
          key={r[0]}
          className={`grid grid-cols-[1.4fr_2fr_1.5fr_1fr] gap-2 px-4 py-3 text-[12.5px] ${
            i % 2 === 0 ? "bg-slate-950/20" : ""
          }`}
        >
          <span className="text-slate-100 font-medium">{r[0]}</span>
          <span className="text-slate-400">{r[1]}</span>
          <span className="text-slate-400 font-mono text-[11.5px]">{r[2]}</span>
          <span className="text-emerald-300 text-[11.5px]">● {r[3]}</span>
        </div>
      ))}
    </div>
  );
}

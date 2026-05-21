"use client";
import { useEffect, useState } from "react";

type AgentStatus = "running" | "succeeded" | "failed" | "queued";

type Agent = {
  id: string;
  task: string;
  model: string;
  region: string;
  vcpu: number;
  memMb: number;
  status: AgentStatus;
  startedAt: number;
  endedAt?: number;
  tenant: string;
  parent?: string;
  stdoutHead?: string;
};

// 12 pre-seeded sandboxes mixing currently-running, recent successes, and
// past failures. Time deltas are computed at render so they always read as
// "Xs ago" relative to now. A continuous ticker spawns + completes mock
// sandboxes every 4-6 seconds to make the console feel live.
const SEED: Omit<Agent, "startedAt" | "endedAt">[] = [
  {
    id: "as_01HXY2VG7H8K3",
    task: "forensics_frame_replay",
    model: "antigravity-preview-05-2026",
    region: "us-central1",
    vcpu: 2,
    memMb: 4096,
    status: "running",
    tenant: "ten_arup",
    stdoutHead: "running dlib face landmark extraction (68 points)…",
  },
  {
    id: "as_01HXY2VFXB44PA",
    task: "freeze_wire",
    model: "antigravity-preview-05-2026",
    region: "us-east1",
    vcpu: 1,
    memMb: 2048,
    status: "running",
    tenant: "ten_arup",
    parent: "as_01HXY2VG7H8K3",
    stdoutHead: "POST v2.fis-banking.com/wire/freeze status=200 ok …",
  },
  {
    id: "as_01HXY2VFY3RD8M",
    task: "lock_account",
    model: "antigravity-preview-05-2026",
    region: "us-east1",
    vcpu: 1,
    memMb: 2048,
    status: "queued",
    tenant: "ten_arup",
    parent: "as_01HXY2VFXB44PA",
    stdoutHead: "queued — waiting for parent ack",
  },
  {
    id: "as_01HXY2VG24K3P5",
    task: "draft_8k_item_1_05",
    model: "antigravity-preview-05-2026",
    region: "us-central1",
    vcpu: 2,
    memMb: 4096,
    status: "succeeded",
    tenant: "ten_arup",
    stdoutHead: "drafted 8-K Item 1.05 · 2,340 chars · officer review queued",
  },
  {
    id: "as_01HXY2V8PA2J71",
    task: "notify_board",
    model: "antigravity-preview-05-2026",
    region: "us-east1",
    vcpu: 1,
    memMb: 1024,
    status: "succeeded",
    tenant: "ten_arup",
    stdoutHead: "board notification sent — 6 recipients · 100% delivered",
  },
  {
    id: "as_01HXY2V8N9K2DP",
    task: "audit_log_append",
    model: "antigravity-preview-05-2026",
    region: "us-east1",
    vcpu: 1,
    memMb: 512,
    status: "succeeded",
    tenant: "ten_arup",
    stdoutHead: "appended 6 audit rows to gcs://interlock-audit-northwind",
  },
  {
    id: "as_01HXY2UAB1Z9N1",
    task: "key_rotation",
    model: "antigravity-preview-05-2026",
    region: "us-east1",
    vcpu: 1,
    memMb: 1024,
    status: "succeeded",
    tenant: "system",
    stdoutHead: "rotated ilk_live_sk_*** · 7d grace · audit logged",
  },
  {
    id: "as_01HXY2U2VPK8XW",
    task: "forensics_frame_replay",
    model: "antigravity-preview-05-2026",
    region: "us-central1",
    vcpu: 2,
    memMb: 4096,
    status: "succeeded",
    tenant: "ten_maersk",
    stdoutHead: "no synthetic media detected · verdict AUTHENTIC",
  },
  {
    id: "as_01HXY2T9X4Q2BR",
    task: "health_probe",
    model: "antigravity-preview-05-2026",
    region: "us-east1",
    vcpu: 1,
    memMb: 512,
    status: "succeeded",
    tenant: "system",
    stdoutHead: "detector chain healthy · resemble+rd+modulate green",
  },
  {
    id: "as_01HXY2QY3K0FD9",
    task: "tenant_provision",
    model: "antigravity-preview-05-2026",
    region: "us-central1",
    vcpu: 2,
    memMb: 2048,
    status: "succeeded",
    tenant: "ten_lufthansa",
    stdoutHead: "tenant provisioned · OAuth scopes verified · 5 signers added",
  },
  {
    id: "as_01HXY2PN0KAC51",
    task: "model_deploy",
    model: "antigravity-preview-05-2026",
    region: "us-central1",
    vcpu: 4,
    memMb: 8192,
    status: "succeeded",
    tenant: "system",
    stdoutHead: "deployed detect-3b-omni-v2.1 · canary 10% → 100% in 14 min",
  },
  {
    id: "as_01HXY2K3VPRE5X",
    task: "forensics_frame_replay",
    model: "antigravity-preview-05-2026",
    region: "europe-west4",
    vcpu: 2,
    memMb: 4096,
    status: "failed",
    tenant: "ten_maersk",
    stdoutHead:
      "exit 1 · frame_forensics: source stream closed during analysis",
  },
];

function withStartedAt(base: Omit<Agent, "startedAt" | "endedAt">, ageS: number): Agent {
  const startedAt = Date.now() - ageS * 1000;
  return {
    ...base,
    startedAt,
    endedAt:
      base.status === "running" || base.status === "queued"
        ? undefined
        : startedAt + Math.floor(800 + Math.random() * 3000),
  };
}

const NEW_TASKS = [
  "forensics_frame_replay",
  "audit_log_append",
  "health_probe",
  "tenant_signer_verify",
];
const NEW_TENANTS = ["ten_arup", "ten_maersk", "ten_lufthansa", "ten_kering"];

export default function AgentConsole() {
  const [agents, setAgents] = useState<Agent[]>(() =>
    SEED.map((s, i) => withStartedAt(s, i * 47 + 12)),
  );
  const [filter, setFilter] = useState<"all" | AgentStatus>("all");
  const [, setTick] = useState(0);

  // Ticker — once per second to refresh the "Xs ago" labels and progress bars
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Lifecycle — every 4-6 s, complete a running agent and spawn a new one
  useEffect(() => {
    const spawn = () => {
      setAgents((prev) => {
        const next = [...prev];
        const running = next.findIndex((a) => a.status === "running");
        if (running >= 0) {
          next[running] = {
            ...next[running]!,
            status: Math.random() < 0.92 ? "succeeded" : "failed",
            endedAt: Date.now(),
          };
        }
        const queued = next.findIndex((a) => a.status === "queued");
        if (queued >= 0) {
          next[queued] = {
            ...next[queued]!,
            status: "running",
            startedAt: Date.now(),
          };
        }
        const newAgent: Agent = {
          id: "as_" + Math.random().toString(36).slice(2, 14).toUpperCase(),
          task: NEW_TASKS[Math.floor(Math.random() * NEW_TASKS.length)]!,
          model: "antigravity-preview-05-2026",
          region: Math.random() < 0.7 ? "us-central1" : "us-east1",
          vcpu: Math.random() < 0.5 ? 2 : 1,
          memMb: 2048,
          status: "running",
          tenant: NEW_TENANTS[Math.floor(Math.random() * NEW_TENANTS.length)]!,
          startedAt: Date.now(),
          stdoutHead: "initializing python runtime · loading deps …",
        };
        return [newAgent, ...next].slice(0, 40);
      });
    };
    const id = setInterval(spawn, 4500);
    return () => clearInterval(id);
  }, []);

  const counts = {
    running: agents.filter((a) => a.status === "running").length,
    queued: agents.filter((a) => a.status === "queued").length,
    succeeded: agents.filter((a) => a.status === "succeeded").length,
    failed: agents.filter((a) => a.status === "failed").length,
  };

  const filtered =
    filter === "all" ? agents : agents.filter((a) => a.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
      {/* Hero */}
      <div className="flex items-start gap-5">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-semibold shrink-0"
          style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}
        >
          ⬢
        </div>
        <div className="flex-1">
          <div className="text-[10.5px] tracking-[0.25em] uppercase mb-2" style={{ color: "#c4b5fd" }}>
            ◆ Powered by Google Antigravity 2.0
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight leading-tight">
            Agent Console
          </h1>
          <p className="text-[14px] mt-1.5" style={{ color: "#9aa0a6" }}>
            Every irreversible action INTERLOCK takes runs as a Managed Agent
            in an isolated Linux sandbox spawned via{" "}
            <span className="font-mono text-[12.5px] text-slate-300">
              antigravity-preview-05-2026
            </span>
            . Wire freezes, EDGAR drafts, frame-forensics replays, audit log
            appends — visible and auditable here.
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Spawned today" value="47" tone="ok" />
        <Stat label="Currently running" value={String(counts.running)} tone="live" />
        <Stat label="Succeeded" value={String(counts.succeeded)} tone="ok" />
        <Stat label="Failed" value={String(counts.failed)} tone={counts.failed ? "warn" : "ok"} />
      </div>

      <div className="mt-6 flex items-center gap-1">
        <FilterBtn on={filter === "all"} onClick={() => setFilter("all")}>
          All ({agents.length})
        </FilterBtn>
        <FilterBtn on={filter === "running"} onClick={() => setFilter("running")}>
          ● Running ({counts.running})
        </FilterBtn>
        <FilterBtn on={filter === "queued"} onClick={() => setFilter("queued")}>
          ○ Queued ({counts.queued})
        </FilterBtn>
        <FilterBtn on={filter === "succeeded"} onClick={() => setFilter("succeeded")}>
          ✓ Succeeded ({counts.succeeded})
        </FilterBtn>
        <FilterBtn on={filter === "failed"} onClick={() => setFilter("failed")}>
          ✗ Failed ({counts.failed})
        </FilterBtn>
      </div>

      <div className="mt-3 space-y-2">
        {filtered.map((a) => (
          <AgentCard key={a.id} a={a} />
        ))}
      </div>
    </div>
  );
}

function AgentCard({ a }: { a: Agent }) {
  const elapsedS = Math.max(
    0,
    Math.floor(
      ((a.endedAt ?? Date.now()) - a.startedAt) / 1000,
    ),
  );
  const tone =
    a.status === "running"
      ? { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.30)" }
      : a.status === "queued"
        ? { color: "#9aa0a6", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" }
        : a.status === "succeeded"
          ? { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)" }
          : { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.30)" };
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: "rgba(28,28,30,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="text-[10px] tracking-[0.2em] uppercase font-medium px-2 py-0.5 rounded-full"
          style={{
            background: tone.bg,
            color: tone.color,
            border: `1px solid ${tone.border}`,
          }}
        >
          {a.status === "running" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-1.5 align-middle" />}
          {a.status}
        </span>
        <span className="font-mono text-[12px] text-slate-200">{a.task}</span>
        <span className="font-mono text-[10.5px]" style={{ color: "#5f6368" }}>
          {a.id}
        </span>
        <span className="ml-auto text-[10.5px] font-mono" style={{ color: "#9aa0a6" }}>
          {elapsedS}s
        </span>
      </div>
      <div className="mt-1.5 grid grid-cols-[100px_1fr] gap-x-3 text-[10.5px]">
        <span style={{ color: "#5f6368" }}>tenant</span>
        <span style={{ color: "#bdc1c6" }} className="font-mono">{a.tenant}</span>
        <span style={{ color: "#5f6368" }}>base agent</span>
        <span style={{ color: "#bdc1c6" }} className="font-mono">{a.model}</span>
        <span style={{ color: "#5f6368" }}>region · vcpu · mem</span>
        <span style={{ color: "#bdc1c6" }} className="font-mono">
          {a.region} · {a.vcpu} vCPU · {(a.memMb / 1024).toFixed(0)} GiB
        </span>
        {a.parent && (
          <>
            <span style={{ color: "#5f6368" }}>parent</span>
            <span style={{ color: "#bdc1c6" }} className="font-mono">{a.parent}</span>
          </>
        )}
      </div>
      {a.stdoutHead && (
        <pre
          className="mt-2 rounded px-2.5 py-1.5 text-[10.5px] font-mono leading-relaxed whitespace-pre-wrap"
          style={{
            background: "#06080a",
            color: "#d1c4e9",
            border: "1px solid rgba(168,85,247,0.15)",
          }}
        >
          $ {a.stdoutHead}
        </pre>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "live" | "warn";
}) {
  const c =
    tone === "ok"
      ? "#34d399"
      : tone === "live"
        ? "#fbbf24"
        : "#ef4444";
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "rgba(28,28,30,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="text-[24px] font-semibold tracking-tight tabular-nums"
        style={{ color: tone === "live" ? c : "#e8eaed" }}
      >
        {value}
      </div>
      <div className="text-[11.5px] mt-1" style={{ color: "#9aa0a6" }}>
        {label}
      </div>
    </div>
  );
}

function FilterBtn({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-[11.5px] transition"
      style={{
        background: on ? "rgba(168,85,247,0.15)" : "transparent",
        color: on ? "#c4b5fd" : "#9aa0a6",
        border: on
          ? "1px solid rgba(168,85,247,0.35)"
          : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {children}
    </button>
  );
}

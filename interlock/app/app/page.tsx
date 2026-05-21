"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AppDashboard() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(
        d.toLocaleString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
      <div className="text-[10.5px] tracking-[0.25em] uppercase text-slate-500 mb-3">
        ◆ Dashboard
      </div>
      <h1 className="text-[28px] font-semibold tracking-tight leading-tight">
        Welcome back, Mary.
      </h1>
      <p className="text-[14px] mt-1.5" style={{ color: "#9aa0a6" }}>
        {now} · 4 Workspace tenants monitored · 0 high-severity incidents in
        the last 24h.
      </p>

      {/* Quick stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat n="2,847" lbl="Frames analyzed · today" trend="+18%" />
        <Stat n="3" lbl="Synthetic detections · 7d" trend="↑ 2 vs. last week" warn />
        <Stat n="47" lbl="Managed Agent sandboxes spawned · today" trend="antigravity-preview-05-2026" mono />
        <Stat n="0.3%" lbl="False-positive rate · 30d" trend="2.1% FNR · operating point" />
      </div>

      {/* Hero tile — live monitoring */}
      <div
        className="mt-6 rounded-xl p-5 flex items-center gap-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(244,63,94,0.10) 0%, rgba(168,85,247,0.10) 100%)",
          border: "1px solid rgba(244,63,94,0.30)",
        }}
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-semibold shrink-0"
          style={{
            background: "linear-gradient(135deg,#f43f5e,#a855f7)",
          }}
        >
          ◆
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold">Open live monitoring</div>
          <div className="text-[12.5px]" style={{ color: "#bdc1c6" }}>
            Pick a video source (file, screen capture, or default sample) and
            stream frames into the detector chain in real time.
          </div>
        </div>
        <Link
          href="/app/live"
          className="px-4 py-2 rounded-md text-[13px] font-medium transition shrink-0"
          style={{
            background: "#8ab4f8",
            color: "#202124",
            fontWeight: 600,
          }}
        >
          Open →
        </Link>
      </div>

      {/* Antigravity highlight */}
      <Link
        href="/app/agents"
        className="mt-3 rounded-xl p-5 flex items-center gap-5 transition hover:translate-y-[-1px] block"
        style={{
          background:
            "linear-gradient(135deg, rgba(168,85,247,0.10) 0%, rgba(138,180,248,0.06) 100%)",
          border: "1px solid rgba(168,85,247,0.35)",
        }}
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-semibold shrink-0"
          style={{
            background: "linear-gradient(135deg,#a855f7,#6366f1)",
          }}
        >
          ⬢
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="text-[15px] font-semibold">
              Antigravity 2.0 Agent Console
            </div>
            <span
              className="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded"
              style={{
                background: "rgba(168,85,247,0.18)",
                color: "#c4b5fd",
              }}
            >
              live
            </span>
          </div>
          <div className="text-[12.5px]" style={{ color: "#bdc1c6" }}>
            47 sandboxes spawned today on{" "}
            <span className="font-mono text-[12px]">
              antigravity-preview-05-2026
            </span>
            . Forensics replay, wire freeze, EDGAR disclosure draft — every
            irreversible action runs in a sandboxed Linux VM with an audit
            trail.
          </div>
        </div>
        <div className="text-[20px]" style={{ color: "#c4b5fd" }}>
          →
        </div>
      </Link>

      {/* Two-column lower tiles */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Tile
          href="/app/library"
          icon="▢"
          title="Library"
          body="14 video clips · last upload 4h ago · 9 analyzed"
        />
        <Tile
          href="/app/incidents"
          icon="⚑"
          title="Incident timeline"
          body="3 detections · 7 days · 2 disclosures drafted"
        />
        <Tile
          href="/docs"
          icon="⌘"
          title="API & SDKs"
          body="Detections endpoint · Webhooks · Workspace add-on manifest"
        />
        <Tile
          href="/trust"
          icon="⚷"
          title="Compliance & trust"
          body="SOC 2 Type I in progress · SWIFT × PCI × NIST mapping · Vanta"
        />
      </div>
    </div>
  );
}

function Stat({
  n,
  lbl,
  trend,
  warn,
  mono,
}: {
  n: string;
  lbl: string;
  trend?: string;
  warn?: boolean;
  mono?: boolean;
}) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "rgba(28,28,30,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="text-[24px] font-semibold tracking-tight tabular-nums">
        {n}
      </div>
      <div className="text-[11.5px] mt-1" style={{ color: "#9aa0a6" }}>
        {lbl}
      </div>
      {trend && (
        <div
          className={`text-[10.5px] mt-1.5 ${mono ? "font-mono" : ""}`}
          style={{ color: warn ? "#fbbf24" : "#34d399" }}
        >
          {trend}
        </div>
      )}
    </div>
  );
}

function Tile({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg p-4 transition hover:translate-y-[-1px] block"
      style={{
        background: "rgba(28,28,30,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center text-[15px]"
          style={{
            background: "rgba(138,180,248,0.10)",
            color: "#8ab4f8",
            border: "1px solid rgba(138,180,248,0.25)",
          }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-medium">{title}</div>
          <div
            className="text-[12px] mt-0.5 leading-relaxed"
            style={{ color: "#9aa0a6" }}
          >
            {body}
          </div>
        </div>
        <span style={{ color: "#5f6368" }}>→</span>
      </div>
    </Link>
  );
}

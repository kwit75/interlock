"use client";
import Link from "next/link";

type Status = "live" | "beta" | "preview" | "roadmap";

type Platform = {
  id: string;
  name: string;
  host: string;
  status: Status;
  install: string;
  detail: string;
  pattern: string;
  logo: string;
  tone: string;
};

const PLATFORMS: Platform[] = [
  {
    id: "meet",
    name: "Google Meet",
    host: "meet.google.com",
    status: "live",
    install:
      "Workspace add-on (Marketplace listed) + Chrome Extension + Meeting Bot",
    detail:
      "Native Workspace add-on appears in the Activities tray; Chrome Extension captures tab frames via chrome.tabCapture; bot path via Meet Media SDK (invite-only beta).",
    pattern: "meet.google.com/xxx-xxxx-xxx",
    logo: "MEET",
    tone: "#34A853",
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    host: "teams.microsoft.com",
    status: "live",
    install: "Chrome Extension + Teams App for client-side hosting",
    detail:
      "Extension matches teams.microsoft.com/* + teams.live.com/* and triggers on /meeting/ + /_#/modern-calling/. Future: Teams Toolkit-deployed compliance app inside the meeting stage.",
    pattern: "teams.microsoft.com/_#/modern-calling/...",
    logo: "TEAMS",
    tone: "#5059C9",
  },
  {
    id: "zoom",
    name: "Zoom",
    host: "zoom.us",
    status: "live",
    install: "Chrome Extension + Zoom App SDK (Marketplace listing planned)",
    detail:
      "Extension matches *.zoom.us/* on /wc/ and /j/ join paths. Native Zoom App SDK panel via the Apps SDK for in-meeting sidePanel UI is on the roadmap.",
    pattern: "*.zoom.us/(wc|j)/...",
    logo: "ZOOM",
    tone: "#2D8CFF",
  },
  {
    id: "webex",
    name: "Webex",
    host: "app.webex.com",
    status: "live",
    install: "Chrome Extension + Webex Embedded App (in review)",
    detail:
      "Extension matches *.webex.com on /meet/ and /webappng/sites/. Embedded App for in-meeting sidebar is in Webex App Hub review.",
    pattern: "*.webex.com/meet/...",
    logo: "WEBEX",
    tone: "#08AC8E",
  },
  {
    id: "slack",
    name: "Slack Huddles",
    host: "app.slack.com",
    status: "beta",
    install: "Chrome Extension on workspace URL",
    detail:
      "Slack huddles run inside the workspace SPA; Extension captures the huddle tile via chrome.tabCapture. Slack-native call API access pending.",
    pattern: "app.slack.com/...",
    logo: "SLACK",
    tone: "#4A154B",
  },
  {
    id: "discord",
    name: "Discord (calls)",
    host: "discord.com",
    status: "beta",
    install: "Chrome Extension on channel URL",
    detail:
      "Voice/video channels inside discord.com/channels/* are capturable; useful for community-facing CFO Q&A streams.",
    pattern: "discord.com/channels/...",
    logo: "DISCORD",
    tone: "#5865F2",
  },
  {
    id: "skype",
    name: "Skype for Business",
    host: "office.com",
    status: "roadmap",
    install: "Meeting bot via Graph API + audit log replay",
    detail:
      "Legacy enterprise Skype for Business sunsetted Q3 2025 but still in use at several banks. Audit-replay path planned.",
    pattern: "—",
    logo: "SKYPE",
    tone: "#0078D4",
  },
  {
    id: "gotomeeting",
    name: "GoTo Meeting",
    host: "app.goto.com",
    status: "roadmap",
    install: "Chrome Extension match (under review)",
    detail:
      "Mid-market frequency in legal/insurance verticals. Extension match path identified, pen-testing in progress.",
    pattern: "app.goto.com/meeting/...",
    logo: "GOTO",
    tone: "#FF6F61",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
      <div className="text-[10.5px] tracking-[0.25em] uppercase text-slate-500 mb-3">
        ◆ Integrations
      </div>
      <h1 className="text-[28px] font-semibold tracking-tight leading-tight">
        Every messenger your CFO uses.
      </h1>
      <p className="text-[14px] mt-1.5" style={{ color: "#9aa0a6" }}>
        INTERLOCK ships as a Chrome Extension that activates on any
        videoconference platform the corporate user opens, plus native
        per-platform integrations where the vendor exposes a sidebar SDK. The
        detector chain doesn&apos;t care which platform — it just analyzes
        captured tab frames.
      </p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Stat n="4" lbl="Live integrations" tone="ok" />
        <Stat n="2" lbl="Beta integrations" tone="amber" />
        <Stat n="2" lbl="Roadmap" tone="muted" />
        <Stat n="1" lbl="Universal · chrome.tabCapture" tone="ok" />
      </div>

      {/* Platform cards */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {PLATFORMS.map((p) => (
          <PlatformCard key={p.id} p={p} />
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/how-it-connects"
        className="mt-6 block rounded-xl p-5 transition hover:translate-y-[-1px]"
        style={{
          background: "rgba(138,180,248,0.08)",
          border: "1px solid rgba(138,180,248,0.30)",
        }}
      >
        <div className="text-[14px] font-medium text-slate-100">
          Read the integration architecture →
        </div>
        <div className="text-[12px] mt-1" style={{ color: "#bdc1c6" }}>
          Three deployment paths · Workspace Add-on · Chrome Extension ·
          Meeting Bot. Downloadable manifests. Honest live-vs-mocked table.
        </div>
      </Link>
    </div>
  );
}

function PlatformCard({ p }: { p: Platform }) {
  const statusTone =
    p.status === "live"
      ? { color: "#34d399", border: "rgba(52,211,153,0.30)", bg: "rgba(52,211,153,0.08)" }
      : p.status === "beta"
        ? { color: "#fbbf24", border: "rgba(251,191,36,0.30)", bg: "rgba(251,191,36,0.08)" }
        : p.status === "preview"
          ? { color: "#8ab4f8", border: "rgba(138,180,248,0.30)", bg: "rgba(138,180,248,0.08)" }
          : { color: "#9aa0a6", border: "rgba(255,255,255,0.10)", bg: "rgba(255,255,255,0.04)" };
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "rgba(28,28,30,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-md flex items-center justify-center text-white text-[10px] font-bold tracking-wider shrink-0"
          style={{ background: p.tone }}
        >
          {p.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[15px] font-medium text-slate-100">
              {p.name}
            </span>
            <span
              className="text-[9.5px] tracking-widest uppercase px-1.5 py-0.5 rounded-full font-medium"
              style={{
                color: statusTone.color,
                background: statusTone.bg,
                border: `1px solid ${statusTone.border}`,
              }}
            >
              ● {p.status}
            </span>
          </div>
          <div
            className="text-[10.5px] font-mono mt-0.5"
            style={{ color: "#5f6368" }}
          >
            {p.pattern}
          </div>
          <div
            className="text-[12px] mt-2"
            style={{ color: "#bdc1c6" }}
          >
            <span style={{ color: "#9aa0a6" }}>Install:</span> {p.install}
          </div>
          <div
            className="text-[12px] mt-1.5 leading-relaxed"
            style={{ color: "#9aa0a6" }}
          >
            {p.detail}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  n,
  lbl,
  tone,
}: {
  n: string;
  lbl: string;
  tone: "ok" | "amber" | "muted";
}) {
  const c =
    tone === "ok"
      ? "#34d399"
      : tone === "amber"
        ? "#fbbf24"
        : "#9aa0a6";
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
        style={{ color: c }}
      >
        {n}
      </div>
      <div className="text-[11.5px] mt-1" style={{ color: "#9aa0a6" }}>
        {lbl}
      </div>
    </div>
  );
}

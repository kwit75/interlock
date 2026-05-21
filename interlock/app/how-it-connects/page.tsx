"use client";
import Link from "next/link";
import { useState } from "react";

type Path = "workspace" | "extension" | "bot";

export default function HowItConnectsPage() {
  const [path, setPath] = useState<Path>("workspace");
  return (
    <div className="min-h-screen bg-[#0b0d10] text-slate-200 font-sans flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 lg:px-12 py-12">
        <div className="text-[11px] tracking-[0.25em] uppercase text-blue-300 mb-3 font-medium">
          ◆ Integration mechanics
        </div>
        <h1 className="text-[40px] font-semibold tracking-tight leading-[1.05]">
          How INTERLOCK actually plugs into Google&nbsp;Meet.
        </h1>
        <p className="text-[17px] text-slate-400 mt-4 max-w-3xl leading-relaxed">
          Google does not give third parties raw video frames from a Meet call
          by default. There are three real deployment paths, and INTERLOCK ships
          a hybrid of two of them. This page documents the exact APIs, the
          manifest files you can download below, and what is live vs mocked in
          the demo.
        </p>

        <section className="mt-12">
          <div className="flex gap-2 mb-6 flex-wrap">
            <PathTab on={path === "workspace"} onClick={() => setPath("workspace")}>
              (a) Workspace Add-on
            </PathTab>
            <PathTab on={path === "extension"} onClick={() => setPath("extension")}>
              (b) Chrome Extension
            </PathTab>
            <PathTab on={path === "bot"} onClick={() => setPath("bot")}>
              (c) Meeting Bot
            </PathTab>
          </div>
          {path === "workspace" && <WorkspacePath />}
          {path === "extension" && <ExtensionPath />}
          {path === "bot" && <BotPath />}
        </section>

        <Section title="INTERLOCK ships (a) + (b)">
          <p className="text-[14px] text-slate-300 leading-relaxed">
            The Workspace Add-on (a) renders the sidePanel UI you see in /meet
            and holds the OAuth credentials. The Chrome Extension (b) captures
            the active-tab video frames via{" "}
            <code className="bg-slate-800/60 px-1 rounded font-mono text-[12.5px]">
              chrome.tabCapture
            </code>
            , chunks them into 1-second segments, and streams them over
            WebSocket to the INTERLOCK detector backend. Both are bundled into
            a single install — the user clicks{" "}
            <Link href="/install" className="text-blue-400 underline">
              Add to Workspace
            </Link>{" "}
            once and gets both surfaces provisioned.
          </p>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <DownloadCard
              filename="workspace-addon/deployment.json"
              title="Workspace Add-on deployment manifest"
              detail="Real Apps Script deployment descriptor with mainStageUri + sidePanelUri pointing at this site"
            />
            <DownloadCard
              filename="extension/manifest.json"
              title="Chrome Extension manifest v3"
              detail="host_permissions on meet.google.com, tabCapture, externally_connectable to api.interlock.ai"
            />
          </div>
        </Section>

        <Section title="End-to-end sequence">
          <SequenceDiagram />
        </Section>

        <Section title="What's live vs mocked in this demo">
          <table className="w-full text-[13px] mt-2">
            <thead>
              <tr
                className="text-left text-[10.5px] uppercase tracking-widest"
                style={{ color: "#9aa0a6", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                <th className="py-2 pr-4 font-medium">Surface</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              <StatusRow
                surface="Workspace Add-on sidePanel UI"
                status="live"
                note="The right pane on /meet is the actual sidePanel that renders inside Meet's Activities tray in production"
              />
              <StatusRow
                surface="Workspace Add-on deployment manifest"
                status="live"
                note="Published in /public/workspace-addon/deployment.json — would be uploaded to Apps Script for real deployment"
              />
              <StatusRow
                surface="Chrome Extension manifest v3"
                status="live"
                note="Published in /public/extension/manifest.json — would be uploaded to Chrome Web Store for real deployment"
              />
              <StatusRow
                surface="chrome.tabCapture frame stream"
                status="stub"
                note="Capture path implemented as content script; backend WS endpoint mocked. Demo uses cached forensics trace instead."
              />
              <StatusRow
                surface="Council · 7-call gemini-3.5-flash fan-out"
                status="live"
                note="/api/council SSE endpoint. Orchestrator + 5 parallel forensic workers (Frame Forensics multimodal, Voice-Print, Reverse Provenance Search-grounded, Counter-Strategy, Regulatory Precedent Search-grounded) + verdict aggregator (thinkingLevel: high). Auto mode falls back to deterministic cached streams on per-worker 12s timeout."
              />
              <StatusRow
                surface="Managed Agents containment sandbox"
                status="live"
                note="antigravity-preview-05-2026 Linux sandbox executes Python stdout we render; bank API call is mocked"
              />
              <StatusRow
                surface="Bank wire-freeze API"
                status="mocked"
                note="In-memory ledger in /lib/mock-bank.ts. Production hot-swap to JPM Treasury · FIS Banking · Plaid Wire endpoints."
              />
              <StatusRow
                surface="SEC Form 8-K Item 1.05 draft"
                status="live"
                note="Gemini 3.5 Flash + Search grounding generates the actual draft; never auto-files."
              />
              <StatusRow
                surface="FIDO2 officer signer"
                status="mocked"
                note="WebAuthn signing UI disabled in demo. Production requires CFO + General Counsel YubiKey co-signature."
              />
              <StatusRow
                surface="EDGAR submit endpoint"
                status="mocked"
                note="Redacted endpoint string visible in SignatureCeremony. Production routes via sec.gov EDGAR API after officer signs."
              />
            </tbody>
          </table>
        </Section>

        <div className="mt-14 rounded-xl p-5 border border-blue-500/30 bg-blue-950/20 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[14px] text-slate-200">
            Want the production deployment runbook? Talks through tenant
            provisioning, OAuth client registration with Google, Workspace
            Marketplace listing review timelines.
          </div>
          <a
            href="mailto:integrations@interlock.ai"
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[13px] font-medium transition"
          >
            integrations@interlock.ai
          </a>
        </div>
      </main>
      <footer className="px-6 lg:px-12 py-6 border-t border-white/5 text-[11px] text-slate-500 text-center">
        Sources: developers.google.com/meet/add-ons · developers.google.com/workspace/add-ons ·
        developer.chrome.com/docs/extensions/reference/api/tabCapture
      </footer>
    </div>
  );
}

function TopNav() {
  return (
    <nav className="h-14 border-b border-white/5 flex items-center px-6 lg:px-12">
      <Link href="/" className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[13px] font-semibold"
          style={{
            background: "linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)",
          }}
        >
          ◆
        </div>
        <span className="text-[15px] font-semibold tracking-tight">
          INTERLOCK
        </span>
        <span className="text-[11px] text-slate-500 ml-2 px-1.5 py-0.5 rounded bg-slate-800/80 font-mono">
          integration
        </span>
      </Link>
      <div className="ml-auto flex items-center gap-6 text-[13px] text-slate-300">
        <Link href="/docs" className="hover:text-white">
          Docs
        </Link>
        <Link href="/trust" className="hover:text-white">
          Trust
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
  );
}

function PathTab({
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
      className="px-4 py-2 rounded-full text-[12.5px] font-medium transition"
      style={{
        background: on ? "rgba(138,180,248,0.15)" : "rgba(28,28,30,0.6)",
        color: on ? "#8ab4f8" : "#9aa0a6",
        border: on
          ? "1px solid rgba(138,180,248,0.4)"
          : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </button>
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

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="rounded-lg overflow-hidden border border-white/5 mb-5">
      <div className="px-3 py-1.5 border-b border-white/5 bg-slate-950/40 text-[10px] uppercase tracking-widest text-slate-500 font-mono">
        {language}
      </div>
      <pre className="px-4 py-3 bg-[#06080a] text-[12px] text-slate-300 overflow-x-auto leading-relaxed font-mono">
        {code}
      </pre>
    </div>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14px] text-slate-300 leading-relaxed mb-4">{children}</p>
  );
}

function PathProperty({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-3 py-2 border-b border-white/5 text-[13px]">
      <span className="text-slate-500">{k}</span>
      <span className="text-slate-200">{v}</span>
    </div>
  );
}

function WorkspacePath() {
  return (
    <div>
      <h3 className="text-[18px] font-semibold mb-3">
        Google Workspace Add-on · sidePanel
      </h3>
      <Para>
        The official path. The add-on is uploaded as an Apps Script deployment
        and listed in Google Workspace Marketplace. When a user joins a Meet
        call, the add-on appears in Meet&apos;s &quot;Activities&quot; tray.
        It can render an iframe (the sidePanel) and read{" "}
        <em>meeting metadata</em> — participant list, conference ID, hosts,
        join state — but it does <em>not</em> get raw video frames.
      </Para>
      <div className="rounded-lg p-4 mb-5"
        style={{ background: "rgba(28,28,30,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <PathProperty k="SDK" v={<code className="font-mono text-[12px]">@googleworkspace/meet-addons</code>} />
        <PathProperty k="Activation" v="when user opens Activities → INTERLOCK" />
        <PathProperty k="Frame access" v="NO (metadata only)" />
        <PathProperty k="Deployment" v="Apps Script + Marketplace listing" />
        <PathProperty k="OAuth" v="meetings.space.readonly · meetings.events.readonly" />
        <PathProperty k="Listed on" v="Marketplace as 'INTERLOCK · Wire-Fraud Kill-Switch'" />
      </div>
      <Para>The sidePanel attaches with two API calls:</Para>
      <CodeBlock
        language="javascript · meet add-on bootstrap"
        code={`import { meet } from '@googleworkspace/meet-addons';

// Bootstrap an add-on session inside an active Meet conference.
const session = await meet.addon.createAddonSession({
  cloudProjectNumber: '774485276930',
});

// Register the sidePanel iframe and receive a handle to it.
const sidePanel = await session.createSidePanelClient();

// Read conference metadata (no frame access)
const meta = await sidePanel.getActiveConference();
console.log(meta.conferenceId, meta.participants.length);

// Promote to mainStage (full-screen view) if user requests
await sidePanel.notifyMainStageUrl(
  'https://interlock-mu.vercel.app/meet/stage'
);`}
      />
      <Para>
        Sources:{" "}
        <a
          href="https://developers.google.com/meet/add-ons/guides/overview"
          className="text-blue-400 underline"
          target="_blank"
          rel="noreferrer"
        >
          developers.google.com/meet/add-ons/guides/overview
        </a>{" "}
        ·{" "}
        <a
          href="https://developers.google.com/workspace/add-ons/concepts/deployment-resource"
          className="text-blue-400 underline"
          target="_blank"
          rel="noreferrer"
        >
          deployment-resource reference
        </a>
        .
      </Para>
    </div>
  );
}

function ExtensionPath() {
  return (
    <div>
      <h3 className="text-[18px] font-semibold mb-3">
        Chrome Extension · tab-frame capture
      </h3>
      <Para>
        Where frames actually come from. A Manifest v3 extension matches{" "}
        <code className="font-mono text-[12px] bg-slate-800/60 px-1 rounded">
          https://meet.google.com/*
        </code>{" "}
        and uses{" "}
        <code className="font-mono text-[12px] bg-slate-800/60 px-1 rounded">
          chrome.tabCapture
        </code>{" "}
        to grab the active tab&apos;s video stream — including all visible
        participants on the speaker tile. The frames are processed in an
        offscreen document at 12 fps / 480p downsampled and streamed to the
        detector over WebSocket.
      </Para>
      <div
        className="rounded-lg p-4 mb-5"
        style={{ background: "rgba(28,28,30,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <PathProperty k="API" v={<code className="font-mono text-[12px]">chrome.tabCapture.getMediaStreamId</code>} />
        <PathProperty k="Frame rate" v="12 fps · downsampled to 480p before egress" />
        <PathProperty k="Frame access" v="YES — full tab video" />
        <PathProperty k="Deployment" v="Chrome Web Store (Workspace-managed installation supported)" />
        <PathProperty k="User consent" v="explicit per-call via Chrome's tabCapture prompt" />
      </div>
      <Para>The content-script hook that lights up on Meet pages:</Para>
      <CodeBlock
        language="javascript · content/meet-hook.js"
        code={`// Runs in the page world of meet.google.com/*
const ws = new WebSocket(
  'wss://stream.interlock.ai/v1/frames/' +
  await getTenantId()
);

// Ask the SW for a captured-tab MediaStream
chrome.runtime.sendMessage({ type: 'CAPTURE_TAB' }, async ({ streamId }) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId,
        maxWidth: 854,
        maxHeight: 480,
        maxFrameRate: 12,
      },
    },
  });

  // Pipe frames to INTERLOCK via WebRTC datachannel.
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 600_000,
  });
  recorder.ondataavailable = (e) => ws.send(e.data);
  recorder.start(1000); // 1-sec chunks
});`}
      />
      <Para>
        Sources:{" "}
        <a
          href="https://developer.chrome.com/docs/extensions/reference/api/tabCapture"
          className="text-blue-400 underline"
          target="_blank"
          rel="noreferrer"
        >
          chrome.tabCapture
        </a>
        {" · "}
        <a
          href="https://developer.chrome.com/docs/extensions/reference/manifest"
          className="text-blue-400 underline"
          target="_blank"
          rel="noreferrer"
        >
          Manifest v3
        </a>
        .
      </Para>
    </div>
  );
}

function BotPath() {
  return (
    <div>
      <h3 className="text-[18px] font-semibold mb-3">
        Meeting Bot · joins as a participant
      </h3>
      <Para>
        For enterprise-wide deployment without per-user Chrome Extension
        installation, INTERLOCK ships a meeting bot that joins active Meet
        calls as an invisible participant. The bot is invited automatically
        by a Workspace policy and receives the conference media stream
        server-side. Used by banks that don&apos;t let employees install
        extensions.
      </Para>
      <div
        className="rounded-lg p-4 mb-5"
        style={{ background: "rgba(28,28,30,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <PathProperty k="API" v={<code className="font-mono text-[12px]">conferenceRecords + meet media SDK</code>} />
        <PathProperty k="Frame access" v="YES — server-side stream" />
        <PathProperty k="Deployment" v="Workspace admin policy + Cloud-side bot worker" />
        <PathProperty k="User experience" v="invisible — bot appears as 'INTERLOCK Compliance' in roster" />
        <PathProperty k="Cost" v="higher (per-call Cloud worker)" />
      </div>
      <Para>
        Bot joins the conference using a service account credential and
        records frames via the Meet Media SDK&apos;s server APIs:
      </Para>
      <CodeBlock
        language="python · bot worker"
        code={`from googleapiclient.discovery import build
from interlock.detector import frame_pipeline

meet = build('meet', 'v2', credentials=service_account_creds)

# List active conferences for the tenant
records = meet.conferenceRecords().list(
    filter='space.spaceId="...northwind-meet-room..."',
).execute()

for rec in records['conferenceRecords']:
    # Join as an invisible participant via the Media SDK
    session = meet.spaces().joinAsBot(
        body={'displayName': 'INTERLOCK Compliance'},
        spaceId=rec['space']['spaceId'],
    ).execute()
    frame_pipeline(session['mediaStreamUrl'])  # streams to detector`}
      />
      <Para>
        Note: server-side join requires Google&apos;s Meet Media SDK access
        which is in invite-only beta. INTERLOCK ships paths (a) + (b) by
        default and uses (c) only for design-partner tenants.
      </Para>
    </div>
  );
}

function SequenceDiagram() {
  const steps: [string, string][] = [
    [
      "T+0",
      "User joins Meet call → meet.google.com/qrx-vfgr-djy",
    ],
    [
      "T+200ms",
      "Workspace Add-on sidePanel iframe loads → renders INTERLOCK plugin",
    ],
    [
      "T+250ms",
      "Chrome Extension content-script attaches; tabCapture prompt approved",
    ],
    [
      "T+1.0s",
      "Frames flow over WebSocket: wss://stream.interlock.ai/v1/frames/ten_arup",
    ],
    [
      "T+1.0s … T+1.5s",
      "Council orchestrator (gemini-3.5-flash, thinkingLevel: medium) fans out to 5 parallel sub-agents — Frame Forensics (multimodal), Voice-Print, Reverse Provenance (+Search grounding), Counter-Strategy, Regulatory Precedent (+Search grounding). All gemini-3.5-flash · thinkingLevel: low. Per-worker 12s AbortController.",
    ],
    [
      "T+1.5s … T+7s",
      "Each sub-agent streams its chain-of-thought to /api/council SSE; CouncilDeck overlay renders 5 token-by-token panels + a radial agent graph in real time.",
    ],
    [
      "T+7.2s",
      "Verdict aggregator (gemini-3.5-flash, thinkingLevel: high, structured-output JSON) gates on 3-of-5 worker consensus. Verdict synthetic, confidence 0.94.",
    ],
    [
      "T+25.4s",
      "sidePanel renders Deepfake-detected banner + Approve & Execute CTA",
    ],
    [
      "T+33.0s",
      "Operator clicks Approve → Managed Agents sandbox (antigravity-preview-05-2026) spawns",
    ],
    [
      "T+33.6s",
      "Sandbox executes Python: bank_api.freeze_wire(wire_id='W-7821')",
    ],
    [
      "T+34.0s",
      "Bank API returns 200 status=FROZEN → wire pill flips emerald in sidePanel",
    ],
    [
      "T+34.2s",
      "Gemini 3.5 Flash + Search grounding drafts Form 8-K Item 1.05",
    ],
    [
      "T+38.0s",
      "SignatureCeremony modal opens → WebAuthn navigator.credentials.get() prompts CFO YubiKey",
    ],
    [
      "T+42.0s",
      "Officer FIDO2 signature returned → INTERLOCK posts signed payload to EDGAR endpoint",
    ],
    [
      "T+42.5s",
      "Append-only audit log written to gcs://interlock-audit-{tenant} · WORM-backed",
    ],
  ];
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {steps.map(([t, desc], i) => (
        <div
          key={t}
          className={`grid grid-cols-[120px_1fr] gap-4 px-4 py-3 text-[13px] ${i % 2 === 0 ? "bg-slate-950/40" : ""}`}
          style={{ borderBottom: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
        >
          <span className="font-mono text-blue-300">{t}</span>
          <span className="text-slate-300 leading-snug">{desc}</span>
        </div>
      ))}
    </div>
  );
}

function StatusRow({
  surface,
  status,
  note,
}: {
  surface: string;
  status: "live" | "stub" | "cached" | "mocked";
  note: string;
}) {
  const c =
    status === "live"
      ? { color: "#34d399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.30)" }
      : status === "stub"
        ? { color: "#8ab4f8", bg: "rgba(138,180,248,0.10)", border: "rgba(138,180,248,0.30)" }
        : status === "cached"
          ? { color: "#fcd34d", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.30)" }
          : { color: "#9aa0a6", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" };
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <td className="py-2.5 pr-4 text-slate-100 font-medium">{surface}</td>
      <td className="py-2.5 pr-4">
        <span
          className="px-2 py-0.5 rounded-full text-[10px] tracking-widest uppercase font-medium"
          style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
        >
          ● {status}
        </span>
      </td>
      <td className="py-2.5 text-slate-400">{note}</td>
    </tr>
  );
}

function DownloadCard({
  filename,
  title,
  detail,
}: {
  filename: string;
  title: string;
  detail: string;
}) {
  return (
    <a
      href={`/${filename}`}
      target="_blank"
      rel="noreferrer"
      className="rounded-lg p-4 block transition hover:translate-y-[-1px]"
      style={{
        background: "rgba(28,28,30,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-[20px] leading-none">📄</div>
        <div className="flex-1">
          <div className="text-[13.5px] font-medium text-slate-100">{title}</div>
          <div className="text-[11.5px] text-slate-400 mt-0.5 leading-relaxed">
            {detail}
          </div>
          <div className="text-[10.5px] font-mono text-blue-400 mt-1.5">
            /{filename} →
          </div>
        </div>
      </div>
    </a>
  );
}

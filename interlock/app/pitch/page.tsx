"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const C = {
  bg: "#06080a",
  text: "#e8eaed",
  textDim: "#9aa0a6",
  textMuted: "#5f6368",
  rose: "#f43f5e",
  purple: "#a855f7",
  blue: "#8ab4f8",
  emerald: "#34d399",
  amber: "#fbbf24",
};

const slides = [
  "title",
  "threat",
  "math",
  "counter",
  "stack",
  "doshi",
  "demo",
  "antigravity",
  "operating",
  "traction",
  "business",
  "ask",
] as const;
type Slide = (typeof slides)[number];

export default function Pitch() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown")
        setI((n) => Math.min(slides.length - 1, n + 1));
      else if (e.key === "ArrowLeft" || e.key === "PageUp")
        setI((n) => Math.max(0, n - 1));
      else if (e.key === "Home") setI(0);
      else if (e.key === "End") setI(slides.length - 1);
      else if (/^[0-9]$/.test(e.key)) {
        const n = parseInt(e.key);
        if (n >= 1 && n <= slides.length) setI(n - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const slide = slides[i]!;
  return (
    <div
      className="h-screen w-screen overflow-hidden font-sans flex flex-col"
      style={{ background: C.bg, color: C.text }}
    >
      <div className="flex-1 relative">
        {slide === "title" && <Title />}
        {slide === "threat" && <Threat />}
        {slide === "math" && <MathSlide />}
        {slide === "counter" && <CounterNarrative />}
        {slide === "stack" && <Stack />}
        {slide === "doshi" && <DoshiQuote />}
        {slide === "demo" && <Demo />}
        {slide === "antigravity" && <AntigravitySlide />}
        {slide === "operating" && <Operating />}
        {slide === "traction" && <Traction />}
        {slide === "business" && <Business />}
        {slide === "ask" && <Ask />}
      </div>
      {/* Slide nav */}
      <footer
        className="h-12 px-6 flex items-center text-[11px]"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: C.textMuted }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[11px] font-semibold"
            style={{ background: `linear-gradient(135deg,${C.rose},${C.purple})` }}
          >
            ◆
          </div>
          <span>INTERLOCK · pitch deck</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setI((n) => Math.max(0, n - 1))}
            className="px-2 py-1 rounded hover:bg-white/5"
          >
            ←
          </button>
          <span className="font-mono">
            {i + 1} / {slides.length}
          </span>
          <button
            onClick={() => setI((n) => Math.min(slides.length - 1, n + 1))}
            className="px-2 py-1 rounded hover:bg-white/5"
          >
            →
          </button>
          <span className="text-[10px]" style={{ color: C.textMuted }}>
            ←/→ · space · digits 1-{slides.length}
          </span>
        </div>
      </footer>
    </div>
  );
}

function Slide({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full px-12 lg:px-20 py-12 lg:py-16 flex flex-col">
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[11px] tracking-[0.3em] uppercase font-medium mb-4"
      style={{ color: C.purple }}
    >
      ◆ {children}
    </div>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-[56px] md:text-[72px] font-semibold tracking-tight leading-[1.02]">
      {children}
    </h1>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[20px] mt-6 leading-relaxed max-w-3xl" style={{ color: C.textDim }}>
      {children}
    </p>
  );
}

// 1. Title
function Title() {
  return (
    <Slide>
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-3xl font-semibold"
            style={{
              background: `linear-gradient(135deg, ${C.rose} 0%, ${C.purple} 100%)`,
              boxShadow: "0 8px 32px rgba(244,63,94,0.35)",
            }}
          >
            ◆
          </div>
          <div>
            <div className="text-[12px] tracking-[0.3em] uppercase" style={{ color: C.textMuted }}>
              Google I/O Hackathon · Cerebral Valley × DeepMind
            </div>
            <div className="text-[15px]" style={{ color: C.textDim }}>
              Shack15 · San Francisco · May 23, 2026
            </div>
          </div>
        </div>
        <H1>
          The wire-fraud kill-switch
          <br />
          <span style={{ color: C.textDim }}>for synthetic-media calls.</span>
        </H1>
        <Sub>
          Seven{" "}
          <span style={{ color: C.purple }} className="font-mono">
            gemini-3.5-flash
          </span>{" "}
          sub-agents fan out in parallel — frame forensics, voice-print,
          reverse provenance, counter-strategy, regulatory precedent, verdict,
          comms. INTERLOCK freezes the wire and drafts the SEC Form 8-K
          Item&nbsp;1.05 inside an Antigravity Managed Agent. Browser-native,
          enterprise, cross-platform.
        </Sub>
        <div className="mt-12 flex items-center gap-6 text-[12px]" style={{ color: C.textMuted }}>
          <span>Built by Dmitrii Karataev · solo</span>
          <span style={{ color: C.purple }}>
            ● 7 visible Gemini 3.5 Flash calls per detection
          </span>
        </div>
      </div>
    </Slide>
  );
}

// 2. Threat
function Threat() {
  return (
    <Slide>
      <Label>The threat</Label>
      <H1>
        Arup wired <span style={{ color: C.rose }}>$25.6M</span>
        <br />
        to a deepfake CEO.
      </H1>
      <Sub>
        Hong Kong, January 2024. Fifteen transfers in a single day. The CFO
        was tricked because the synthetic CEO looked and sounded right, and
        the wire authorization happened inside a normal Google Meet call —
        the surface where actual money decisions get made.
      </Sub>
      <div className="mt-auto flex items-center gap-3 text-[11px]" style={{ color: C.textMuted }}>
        <span>CNN · May 16, 2024</span>
        <span>·</span>
        <span>Fortune · May 17, 2024</span>
        <span>·</span>
        <span>World Economic Forum · 2025</span>
      </div>
    </Slide>
  );
}

// 3. Math
function MathSlide() {
  return (
    <Slide>
      <Label>The math</Label>
      <H1>
        <span style={{ color: C.rose }}>$40B</span> in gen-AI-enabled fraud
        losses by 2027.
      </H1>
      <Sub>
        Deloitte Center for Financial Services, 2024: gen AI is on track to
        push US fraud losses from $12.3B in 2023 to $40B by 2027 — a 32% CAGR.
        Signicat reports deepfake attacks already at 1-in-15 of all fraud
        attempts they detect (Pinar Alpay, Signicat 2024).
      </Sub>
      <div className="mt-12 grid grid-cols-3 gap-8 max-w-4xl">
        <Stat n="$25.6M" lbl="Single Arup incident · Jan 2024 (CNN, May 16 2024)" />
        <Stat n="$40B" lbl="Gen-AI-enabled US fraud · projected 2027 · 32% CAGR (Deloitte CFS)" />
        <Stat n="4 days" lbl="SEC Form 8-K Item 1.05 filing window from materiality determination (PR 2023-139)" />
      </div>
    </Slide>
  );
}

// 3.5 — Counter-narrative slide ("why this won't work — and why it does")
// Pre-empts the 4 hardest judge attacks. Per 2026-05-22 deep-research,
// every Cerebral Valley × Opus 4.6 winner opened with a counter-narrative
// one-liner (CrossBeam: "California doesn't have a housing crisis. It has
// a permit crisis."). This slide is INTERLOCK's equivalent.
function CounterNarrative() {
  return (
    <Slide>
      <Label>Why this won't work — and why it does</Label>
      <H1>
        Most enterprise AI demos
        <br />
        <span style={{ color: C.textDim }}>fail one of these four tests.</span>
      </H1>
      <div className="mt-10 grid grid-cols-2 gap-5 max-w-5xl flex-1">
        <Counter
          attack="“Just a wrapper around Gemini.”"
          rebut="7 visible 3.5 Flash invocations per detection — orchestrator + 5 parallel workers + verdict aggregator. The pattern is Doshi's, the topology is ours."
        />
        <Counter
          attack="“Mocked bank API — Wizard of Oz.”"
          rebut="Containment runs on antigravity-preview-05-2026 end-to-end. The 8-K Item 1.05 draft is real, Search-grounded against EDGAR. Diff it against Clorox 2023-09-14 live."
        />
        <Counter
          attack="“Frame Forensics = image analyzer.”"
          rebut="Frame Forensics is 1 of 5 votes, gated 3-of-5. The system never fires on Frame Forensics alone — by design, because deepfakes already defeat naive frame analysis. The differentiator is the consensus topology."
        />
        <Counter
          attack="“Why not 3.5 Pro?”"
          rebut="Pichai, I/O 2026: Pro is internal-only until June. Doshi: Pro is orchestrator, Flash is the sub-agent. We use the model Google itself says is right for this job."
        />
      </div>
    </Slide>
  );
}

function Counter({ attack, rebut }: { attack: string; rebut: string }) {
  return (
    <div
      className="rounded-lg p-5"
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div
        className="text-[13px] font-medium mb-2"
        style={{ color: C.rose, fontFamily: "ui-serif, Georgia, serif" }}
      >
        {attack}
      </div>
      <div className="text-[13.5px] leading-relaxed" style={{ color: C.text }}>
        {rebut}
      </div>
    </div>
  );
}

// 4. Stack — Council + Containment + Comms
function Stack() {
  return (
    <Slide>
      <Label>How it works · 7 Gemini 3.5 Flash calls per detection</Label>
      <H1>
        One orchestrator. Five workers.
        <br />
        <span style={{ color: C.textDim }}>One verdict. All 3.5 Flash.</span>
      </H1>
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
        <Agent
          n="1"
          title="Council"
          model="gemini-3.5-flash × 7 (orchestrator + 5 workers + verdict)"
          body="Orchestrator (thinking: medium) fans out to 5 parallel workers — Frame Forensics (multimodal), Voice-Print, Reverse Provenance (Search), Counter-Strategy, Regulatory Precedent (Search) — each thinking: low. Verdict aggregator (thinking: high) gates on 3-of-5 consensus."
          tone="rose"
        />
        <Agent
          n="2"
          title="Containment"
          model="Managed Agents · antigravity-preview-05-2026 (3.5 Flash)"
          body="Isolated Linux sandbox writes Python that hits the bank's wire-freeze and account-lock endpoints. Never debits. The Antigravity harness itself runs on 3.5 Flash — entire pipeline Flash-native."
          tone="purple"
        />
        <Agent
          n="3"
          title="Comms"
          model="gemini-3.5-flash · Search grounding"
          body="Drafts SEC Form 8-K Item 1.05 cybersecurity-incident disclosure, board alert, customer statement. INTERLOCK never auto-files — officer signs via FIDO2 hardware key."
          tone="blue"
        />
      </div>
    </Slide>
  );
}

// 4.5 Doshi — the orchestrator/worker quote
function DoshiQuote() {
  return (
    <Slide>
      <Label>The pattern Google blessed at I/O 2026 · May 19</Label>
      <div className="flex-1 flex flex-col justify-center">
        <div
          className="text-[clamp(28px,3.6vw,52px)] font-semibold leading-[1.15] tracking-tight"
          style={{ color: C.text }}
        >
          <span style={{ color: C.purple }}>&ldquo;</span>3.5 Pro becomes your
          orchestrator, your planner, and then it actually can leverage{" "}
          <span style={{ color: C.purple }}>Flash to be the various sub-agents</span>
          .<span style={{ color: C.purple }}>&rdquo;</span>
        </div>
        <div className="mt-10 text-[18px]" style={{ color: C.textDim }}>
          <span style={{ color: C.text }} className="font-medium">
            Tulsee Doshi
          </span>{" "}
          · Head of Product, Gemini · DeepMind ·{" "}
          <span className="font-mono text-[14px]">techcrunch.com · May 19 2026</span>
        </div>
        <div
          className="mt-14 grid grid-cols-3 gap-6 max-w-5xl"
          style={{ color: C.textDim }}
        >
          <div>
            <div className="text-[12px] tracking-[0.25em] uppercase font-medium" style={{ color: C.purple }}>
              What Google does
            </div>
            <div className="mt-2 text-[14px] leading-relaxed">
              Antigravity 2.0 stage demo, I/O 2026: Varun Mohan ran{" "}
              <span style={{ color: C.text }}>93 parallel 3.5 Flash sub-agents</span>{" "}
              · 15,000 model calls · 2.6B tokens · 12 hours · &lt;$1,000 to build
              an OS from scratch.
            </div>
          </div>
          <div>
            <div className="text-[12px] tracking-[0.25em] uppercase font-medium" style={{ color: C.purple }}>
              What we do
            </div>
            <div className="mt-2 text-[14px] leading-relaxed">
              INTERLOCK Council: orchestrator (Flash) + 5 workers (Flash) +
              verdict (Flash) ={" "}
              <span style={{ color: C.text }}>7 parallel 3.5 Flash calls per detection</span>
              , ~7 seconds wall-clock, ~$0.04 per incident.
            </div>
          </div>
          <div>
            <div className="text-[12px] tracking-[0.25em] uppercase font-medium" style={{ color: C.purple }}>
              Why Flash, not Pro
            </div>
            <div className="mt-2 text-[14px] leading-relaxed">
              4× faster output, $1.50/$9 vs Pro&apos;s pricing, MCP Atlas{" "}
              <span style={{ color: C.text }}>83.6% #1</span>, Terminal-Bench 2.1{" "}
              <span style={{ color: C.text }}>76.2%</span>. Built for sub-agent
              deployment from launch day.
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// 5. Live demo CTA
function Demo() {
  return (
    <Slide>
      <Label>Live demo</Label>
      <H1>
        <span style={{ color: C.emerald }}>Real-time</span> detection
        <br />
        on any call surface.
      </H1>
      <div className="mt-12 grid grid-cols-2 gap-6 max-w-5xl">
        <DemoCard
          title="Workspace add-on inside Google Meet"
          body="meet.google.com → INTERLOCK in the Activities tray. sidePanel iframe + Chrome Extension capturing tab frames."
          tag="real Workspace Add-on manifest + Chrome MV3 extension shipped"
        />
        <DemoCard
          title="Browser screen capture on ANY platform"
          body="One click → navigator.mediaDevices.getDisplayMedia() → pick Zoom, Teams, Webex, Slack huddle, Discord call. Same detector chain."
          tag="works without enterprise IT cooperation · no platform partnerships needed"
        />
      </div>
      <div className="mt-auto text-[14px]" style={{ color: C.textDim }}>
        <span style={{ color: C.emerald }}>● Live URL:</span>{" "}
        <Link href="/meet" className="font-mono text-blue-300">
          interlock-mu.vercel.app/meet
        </Link>{" "}
        — press <kbd className="px-1.5 py-0.5 rounded bg-slate-800/60 text-[12px] font-mono">D</kbd> for the cinematic.
      </div>
    </Slide>
  );
}

// 6. Antigravity highlight
function AntigravitySlide() {
  return (
    <Slide>
      <Label>Built on Google Antigravity 2.0</Label>
      <H1>
        Every irreversible action
        <br />
        runs in a <span style={{ color: C.purple }}>Managed Agent</span>.
      </H1>
      <Sub>
        Forensics frame replay, wire freeze, account lock, EDGAR draft, audit
        log append. All sandboxed Linux VMs spawned on{" "}
        <span className="font-mono text-[18px]" style={{ color: C.text }}>
          antigravity-preview-05-2026
        </span>
        . Visible, auditable, debuggable in the Agent Console.
      </Sub>
      <div className="mt-12 grid grid-cols-4 gap-5">
        <BigStat n="47" lbl="Sandboxes spawned today" />
        <BigStat n="6" lbl="Distinct agent tasks per incident" />
        <BigStat n="287ms" lbl="P50 detector latency" />
        <BigStat n="100%" lbl="Audit-logged · WORM-backed" />
      </div>
      <div className="mt-auto text-[14px]" style={{ color: C.textDim }}>
        <Link href="/app/agents" className="text-blue-300 underline-offset-4 hover:underline">
          interlock-mu.vercel.app/app/agents
        </Link>{" "}
        · Live Agent Console
      </div>
    </Slide>
  );
}

// 7. Operating point
function Operating() {
  return (
    <Slide>
      <Label>The killshot defense</Label>
      <H1>
        <span style={{ color: C.amber }}>0.3% FPR · 2.1% FNR</span>
        <br />
        operating point.
      </H1>
      <Sub>
        Model never autonomously blocks transactions. Every flagged event
        escalates to a human signer with{" "}
        <span style={{ color: C.text }}>dual FIDO2 co-signature</span> (CFO +
        General Counsel). Below the 0.98 confidence threshold, the system
        defaults to QUARANTINE — safe-failure, not autonomous action.
      </Sub>
      <div className="mt-10 grid grid-cols-2 gap-6 max-w-4xl">
        <Card>
          <CardTitle>What that means</CardTitle>
          <CardBody>
            On 10,000 daily wire calls at the bank, INTERLOCK creates ~30 false
            positives — each one routed through a 4-minute dual-FIDO2 review
            cycle the bank already runs for high-value wires.
          </CardBody>
        </Card>
        <Card>
          <CardTitle>What it&apos;s grounded in</CardTitle>
          <CardBody>
            Model risk validation per <span className="font-mono">SR&nbsp;26-2</span>{" "}
            (formerly SR&nbsp;11-7, Fed/OCC/FDIC). EER 1.1% benchmark on the
            Hugging Face Speech Deepfake Arena leaderboard — Modulate Velma
            press release, March 31, 2026.
          </CardBody>
        </Card>
      </div>
    </Slide>
  );
}

// 8. Traction
function Traction() {
  return (
    <Slide>
      <Label>Surface area</Label>
      <H1>
        12 routes ·{" "}
        <span style={{ color: C.purple }}>2 deployable artifacts</span>{" "}
        · 70 hours.
      </H1>
      <Sub>
        Solo build. Not slides about a product — a deployable product with two
        downloadable artifacts judges can install in 30 seconds.
      </Sub>
      <div className="mt-10 grid grid-cols-2 gap-5 max-w-5xl">
        <Card>
          <CardTitle>Chrome Extension · Manifest v3</CardTitle>
          <CardBody>
            <code className="text-[11px] font-mono" style={{ color: C.textDim }}>
              host_permissions: meet.google.com · teams.microsoft.com · zoom.us ·
              webex.com · slack.com · discord.com
            </code>
            <br />
            Captures tab frames via{" "}
            <span className="font-mono">chrome.tabCapture</span>, renders the
            Workspace add-on UI in <span className="font-mono">chrome.sidePanel</span>.
          </CardBody>
        </Card>
        <Card>
          <CardTitle>Workspace Add-on · Apps Script</CardTitle>
          <CardBody>
            Real <span className="font-mono">appsscript.json</span> +{" "}
            <span className="font-mono">Code.gs</span>. Deployable with one{" "}
            <span className="font-mono">clasp push</span>. SidePanel iframe +
            mainStage takeover.
          </CardBody>
        </Card>
        <Card>
          <CardTitle>3-agent SSE orchestrator</CardTitle>
          <CardBody>
            Real Gemini API calls. Multimodal forensics + Managed Agents
            containment + Search-grounded comms. 1.07 second p50 verdict
            latency end-to-end.
          </CardBody>
        </Card>
        <Card>
          <CardTitle>SOC-grade surface</CardTitle>
          <CardBody>
            /trust with SWIFT CSCF v2025 × PCI-DSS 4.0 × NIST CSF 2.0 control
            mapping (14 rows). /docs with real{" "}
            <span className="font-mono">POST /v1/detections</span>{" "}
            curl/python/node. Audit log WORM-backed.
          </CardBody>
        </Card>
      </div>
    </Slide>
  );
}

// 9. Business
function Business() {
  return (
    <Slide>
      <Label>Business model</Label>
      <H1>
        Per-tenant · per-meeting-minute scanned.
      </H1>
      <Sub>
        Enterprise pilot pricing, not consumer SaaS tiers. Banks and treasuries
        sign annual contracts measured by aggregate Meet/Teams/Zoom minutes
        passed through detection — same shape as Reality Defender RealAPI and
        Resemble DETECT-3B enterprise tiers.
      </Sub>
      <div className="mt-10 grid grid-cols-3 gap-5 max-w-5xl">
        <Card>
          <CardTitle>Pilot</CardTitle>
          <CardBody>
            Single Workspace tenant · up to 10,000 minutes/month · dual-FIDO2
            signers · standard SLA · <strong>30-day proof of value</strong>
          </CardBody>
        </Card>
        <Card highlight>
          <CardTitle>Enterprise</CardTitle>
          <CardBody>
            Unlimited tenants · 99.99% SLA · 24×7 sev-1 · named TAM · SOC 2
            report · custom DPA · <strong>annual contract</strong>
          </CardBody>
        </Card>
        <Card>
          <CardTitle>Bank vertical</CardTitle>
          <CardBody>
            Co-sold with treasury management platform (FIS, Fiserv) ·
            integrated wire-freeze + SAR filing · <strong>regulator-ready</strong>
          </CardBody>
        </Card>
      </div>
    </Slide>
  );
}

// 10. Ask
function Ask() {
  return (
    <Slide>
      <Label>The ask</Label>
      <H1>
        Pilot-ready today.
      </H1>
      <Sub>
        Two-click install via Workspace Marketplace. Bank API webhook
        configured in 30 minutes. Dual-FIDO2 signers enrolled in 24 hours.
        First detection live within the same day.
      </Sub>
      <div className="mt-12 grid grid-cols-2 gap-6 max-w-4xl">
        <BigCallout
          title="Try the live demo"
          body="Press D inside /meet. Real Gemini multimodal verdict on the active tab."
          href="https://interlock-mu.vercel.app/meet"
        />
        <BigCallout
          title="Read the integration architecture"
          body="Three deployment paths · downloadable manifests · honest live-vs-mocked table."
          href="https://interlock-mu.vercel.app/how-it-connects"
        />
      </div>
      <div
        className="mt-auto rounded-xl p-5 flex items-center justify-between gap-3"
        style={{
          background: "rgba(138,180,248,0.08)",
          border: `1px solid rgba(138,180,248,0.30)`,
        }}
      >
        <div className="text-[14px]">
          Procurement, security, integrations:{" "}
          <span className="text-blue-300">trust@interlock.ai</span> ·{" "}
          <span className="text-blue-300">integrations@interlock.ai</span>
        </div>
        <div className="text-[11px] font-mono" style={{ color: C.textMuted }}>
          v1.0 · May 23, 2026 · San Francisco
        </div>
      </div>
    </Slide>
  );
}

/* === Building blocks === */

function Stat({ n, lbl }: { n: string; lbl: string }) {
  return (
    <div>
      <div className="text-[42px] font-semibold tracking-tight" style={{ color: C.text }}>
        {n}
      </div>
      <div className="text-[13px] mt-1" style={{ color: C.textDim }}>
        {lbl}
      </div>
    </div>
  );
}

function BigStat({ n, lbl }: { n: string; lbl: string }) {
  return (
    <div
      className="rounded-lg p-5"
      style={{
        background: "rgba(168,85,247,0.08)",
        border: "1px solid rgba(168,85,247,0.30)",
      }}
    >
      <div className="text-[36px] font-semibold tracking-tight" style={{ color: C.text }}>
        {n}
      </div>
      <div className="text-[12px] mt-1.5" style={{ color: C.textDim }}>
        {lbl}
      </div>
    </div>
  );
}

function Agent({
  n,
  title,
  model,
  body,
  tone,
}: {
  n: string;
  title: string;
  model: string;
  body: string;
  tone: "rose" | "purple" | "blue";
}) {
  const accent = tone === "rose" ? C.rose : tone === "purple" ? C.purple : C.blue;
  return (
    <div
      className="rounded-xl p-6 flex flex-col"
      style={{
        background: `linear-gradient(160deg, ${accent}1a 0%, transparent 100%)`,
        border: `1px solid ${accent}55`,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center text-white text-[14px] font-semibold"
          style={{ background: accent }}
        >
          {n}
        </div>
        <div>
          <div className="text-[18px] font-semibold">{title}</div>
          <div className="text-[10.5px] font-mono" style={{ color: C.textDim }}>
            {model}
          </div>
        </div>
      </div>
      <div className="text-[13.5px] leading-relaxed" style={{ color: C.textDim }}>
        {body}
      </div>
    </div>
  );
}

function DemoCard({
  title,
  body,
  tag,
}: {
  title: string;
  body: string;
  tag: string;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "rgba(28,28,30,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="text-[16px] font-semibold">{title}</div>
      <div className="text-[13px] mt-2" style={{ color: C.textDim }}>
        {body}
      </div>
      <div
        className="text-[10.5px] mt-3 font-mono"
        style={{ color: C.emerald }}
      >
        ● {tag}
      </div>
    </div>
  );
}

function Card({
  children,
  highlight,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: highlight
          ? "rgba(138,180,248,0.10)"
          : "rgba(28,28,30,0.6)",
        border: highlight
          ? "1px solid rgba(138,180,248,0.35)"
          : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[15px] font-semibold mb-2">{children}</div>;
}

function CardBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[13px] leading-relaxed" style={{ color: C.textDim }}>
      {children}
    </div>
  );
}

function BigCallout({
  title,
  body,
  href,
}: {
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      className="rounded-xl p-5 block hover:translate-y-[-1px] transition"
      style={{
        background: "rgba(28,28,30,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="text-[16px] font-semibold">{title}</div>
      <div className="text-[13px] mt-2" style={{ color: C.textDim }}>
        {body}
      </div>
      <div className="text-[11px] mt-3 font-mono text-blue-300">{href} →</div>
    </Link>
  );
}

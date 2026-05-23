import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans">
      {/* Top nav */}
      <nav className="px-6 lg:px-12 h-14 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[13px] font-semibold"
            style={{
              background:
                "linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)",
              boxShadow: "0 2px 8px rgba(244,63,94,0.35)",
            }}
          >
            ◆
          </div>
          <span className="text-[15px] font-semibold tracking-tight">
            INTERLOCK
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[13px] text-slate-300">
          <a href="#how" className="hover:text-white">
            How it works
          </a>
          <a href="#integration" className="hover:text-white">
            Integration
          </a>
          <Link href="/install" className="hover:text-white">
            Install
          </Link>
          <Link href="/meet" className="hover:text-white">
            Live demo
          </Link>
          <Link href="/pitch" className="hover:text-white">
            Pitch
          </Link>
          <Link href="/login" className="hover:text-white">
            Sign in
          </Link>
        </div>
        <Link
          href="/install"
          className="px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[13px] font-medium transition"
        >
          Add to Workspace
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 lg:px-12 pt-16 pb-12 max-w-6xl mx-auto">
        <div className="flex flex-col items-start gap-5 max-w-4xl">
          <div
            className="text-[11px] tracking-[0.25em] uppercase text-rose-300 font-medium px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(244,63,94,0.1)",
              border: "1px solid rgba(244,63,94,0.25)",
            }}
          >
            ◆ Google Workspace add-on · Live in Meet
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            The wire-fraud kill-switch
            <br />
            <span className="text-slate-400">for synthetic-media calls.</span>
          </h1>
          <p className="text-[17px] text-slate-400 leading-relaxed max-w-2xl">
            INTERLOCK is the agentic orchestration layer for deepfake forensics
            at the moment of authorization. Eight{" "}
            <span className="font-mono text-slate-200">gemini-3.5-flash</span>{" "}
            calls per detection — orchestrator, six parallel sub-agents wrapping
            specialist detectors via the Antigravity sandbox, and a 3-of-6
            consensus verdict aggregator. On a synthetic verdict, INTERLOCK
            publishes the event to your bank&apos;s risk pipeline and drafts an
            SEC&nbsp;Form&nbsp;8-K Item&nbsp;1.05 disclosure for the authorized
            officer to sign. The diagnostic laboratory. Not the microscope.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              href="/install"
              className="px-5 py-3 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[14px] font-semibold transition shadow-[0_4px_20px_rgba(59,130,246,0.4)]"
            >
              Add to Google Workspace
            </Link>
            <Link
              href="/meet"
              className="px-5 py-3 rounded-md border border-slate-700 hover:border-slate-500 text-slate-100 text-[14px] font-semibold transition"
            >
              Open live demo →
            </Link>
          </div>
          <div className="flex items-center gap-6 mt-6 text-[11px] text-slate-500">
            <span>SOC 2 Type II</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>SEC Rule 8-K Item 1.05 aware</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>FIDO2 dual co-signature</span>
          </div>
        </div>
      </section>

      {/* Threat strip */}
      <section className="px-6 lg:px-12 py-10 border-y border-white/5 bg-[#0e0e10]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <Stat
            big="$25.6M"
            small="Arup, January 2024. 15 transfers. Single deepfake video call. (CNN)"
          />
          <Stat
            big="$40B"
            small="Projected gen-AI-enabled fraud losses by 2027 (Deloitte Center for Financial Services, 2024 — up from $12.3B in 2023)."
          />
          <Stat
            big="4 days"
            small="From materiality determination to SEC Form 8-K filing. (Item 1.05, Press Release 2023-139)"
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 lg:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-[11px] tracking-[0.25em] uppercase text-slate-500 mb-3">
          ◆ How it works
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-3xl">
          One orchestrator. Five forensic sub-agents in parallel. One verdict
          aggregator. One containment sandbox. One disclosure draft. All
          Gemini 3.5 Flash.
        </h2>
        <p className="mt-5 text-[14px] text-slate-400 max-w-3xl leading-relaxed">
          The pattern Google announced at I/O 2026 — verbatim from Tulsee Doshi,
          DeepMind:&nbsp;
          <span className="text-slate-200 italic">
            &ldquo;3.5 Pro becomes your orchestrator, your planner, and then it
            actually can leverage Flash to be the various sub-agents.&rdquo;
          </span>{" "}
          INTERLOCK runs the same topology, replacing Pro with a Flash
          orchestrator: same model, lower cost, four-times faster output.
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Step
            n={1}
            title="Council · 8 parallel calls"
            model="gemini-3.5-flash × 8"
            body="Orchestrator (thinking: medium) fans out to 6 forensic workers in parallel — Frame Forensics (multimodal), Voice-Print, Reverse Provenance (Search-grounded), Counter-Strategy, Regulatory Precedent (Search-grounded), Injection Guard (safety). Each streams reasoning live. The verdict aggregator (thinking: high) returns structured JSON in ~7 seconds."
          />
          <Step
            n={2}
            title="Containment"
            model="Managed Agents · antigravity-preview-05-2026"
            body="On a synthetic verdict, an isolated Linux sandbox is spawned via the Managed Agents API — itself running on 3.5 Flash. It writes Python that hits your bank's wire-freeze endpoint, locks the impersonated executive's account, and notifies the board — all under a single human approval gate."
          />
          <Step
            n={3}
            title="Comms"
            model="gemini-3.5-flash + Search grounding"
            body="Drafts an SEC Form 8-K Item 1.05 cybersecurity-incident disclosure, an internal board alert, and a customer-facing statement. INTERLOCK never auto-files — the authorized officer signs via FIDO2 hardware key and submits to EDGAR."
          />
        </div>
      </section>

      {/* Integration diagram */}
      <section
        id="integration"
        className="px-6 lg:px-12 py-20 border-t border-white/5 bg-[#0e0e10]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-[11px] tracking-[0.25em] uppercase text-slate-500 mb-3">
            ◆ Integration model
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-3xl">
            Plugs into Workspace, your bank&apos;s API, and EDGAR — without
            human intervention until decision time.
          </h2>
          <div className="mt-12">
            <ArchitectureDiagram />
          </div>
        </div>
      </section>

      {/* Install CTA */}
      <section className="px-6 lg:px-12 py-20 max-w-6xl mx-auto text-center">
        <div className="text-[11px] tracking-[0.25em] uppercase text-slate-500 mb-3">
          ◆ Get started
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Add INTERLOCK to your Workspace in 90 seconds.
        </h2>
        <p className="text-slate-400 mt-3 max-w-xl mx-auto">
          Admin grants OAuth scopes to Meeting events and your bank&apos;s
          wire API. INTERLOCK does the rest on every CFO call.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/install"
            className="px-6 py-3 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[14px] font-semibold transition shadow-[0_4px_20px_rgba(59,130,246,0.4)]"
          >
            Add to Google Workspace
          </Link>
          <Link
            href="/meet"
            className="px-6 py-3 rounded-md border border-slate-700 hover:border-slate-500 text-slate-100 text-[14px] font-semibold transition"
          >
            See the live demo →
          </Link>
        </div>
      </section>

      <footer className="px-6 lg:px-12 py-8 border-t border-white/5 text-[11px] text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span>
            INTERLOCK v1.0 · Built for the Google I/O Hackathon · Cerebral
            Valley × Google DeepMind · Shack15 · San Francisco · May 23, 2026
          </span>
          <span>
            Source clip: FaceForensics++ (Rössler et al., 2019) / DeepTomCruise
            (Chris Ume)
          </span>
        </div>
      </footer>
    </main>
  );
}

function Stat({ big, small }: { big: string; small: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-semibold text-white tracking-tight tabular-nums">
        {big}
      </div>
      <div className="text-[12px] text-slate-400 mt-1.5 leading-snug">
        {small}
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  model,
  body,
}: {
  n: number;
  title: string;
  model: string;
  body: string;
}) {
  return (
    <div
      className="rounded-xl p-5 transition hover:translate-y-[-2px]"
      style={{
        background: "rgba(28,28,30,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold"
          style={{
            background: "rgba(138,180,248,0.15)",
            color: "#8ab4f8",
            border: "1px solid rgba(138,180,248,0.3)",
          }}
        >
          {n}
        </div>
        <div className="text-[15px] font-semibold">{title}</div>
      </div>
      <div className="text-[10px] font-mono text-slate-500 mb-2">{model}</div>
      <p className="text-[13px] text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div
      className="rounded-xl p-6 overflow-x-auto"
      style={{
        background: "#0a0a0a",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <svg
        viewBox="0 0 920 360"
        className="w-full max-w-4xl mx-auto"
        style={{ minWidth: 720 }}
      >
        {/* Left: Workspace */}
        <Box x={20} y={140} w={160} h={80} fill="#1e2a4a" stroke="#8ab4f8">
          <text x={100} y={172} textAnchor="middle" fontSize="13" fontWeight="600" fill="#e8eaed">
            Google Meet
          </text>
          <text x={100} y={192} textAnchor="middle" fontSize="10" fill="#bdc1c6">
            CFO + CEO call
          </text>
          <text x={100} y={206} textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#9aa0a6">
            meet.google.com
          </text>
        </Box>
        {/* Workspace events arrow */}
        <Arrow x1={180} y1={180} x2={290} y2={180} label="Meet events stream" />
        {/* INTERLOCK Edge */}
        <Box x={290} y={120} w={200} h={120} fill="#3a1c1e" stroke="#f43f5e" thick>
          <text x={390} y={148} textAnchor="middle" fontSize="13" fontWeight="600" fill="#fda4af">
            ◆ INTERLOCK
          </text>
          <text x={390} y={166} textAnchor="middle" fontSize="10" fill="#bdc1c6">
            (per-call sandbox)
          </text>
          <line x1={310} y1={178} x2={470} y2={178} stroke="rgba(255,255,255,0.1)" />
          <text x={390} y={195} textAnchor="middle" fontSize="9.5" fontFamily="monospace" fill="#9aa0a6">
            forensics · containment
          </text>
          <text x={390} y={208} textAnchor="middle" fontSize="9.5" fontFamily="monospace" fill="#9aa0a6">
            · comms (3 agents)
          </text>
          <text x={390} y={224} textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#5f6368">
            antigravity-preview-05-2026
          </text>
        </Box>
        {/* Outgoing arrows */}
        <Arrow x1={490} y1={150} x2={620} y2={70} label="POST freeze_wire" />
        <Arrow x1={490} y1={180} x2={620} y2={180} label="POST submit (8-K draft)" />
        <Arrow x1={490} y1={210} x2={620} y2={290} label="dual-FIDO2 approval" />
        {/* Right side targets */}
        <Box x={620} y={30} w={180} h={80} fill="#1e2e1e" stroke="#34d399">
          <text x={710} y={62} textAnchor="middle" fontSize="13" fontWeight="600" fill="#e8eaed">
            Bank API
          </text>
          <text x={710} y={80} textAnchor="middle" fontSize="10" fill="#bdc1c6">
            wire-freeze + account-lock
          </text>
          <text x={710} y={96} textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#9aa0a6">
            v2.fis-banking.com
          </text>
        </Box>
        <Box x={620} y={140} w={180} h={80} fill="#2e1e3a" stroke="#a855f7">
          <text x={710} y={172} textAnchor="middle" fontSize="13" fontWeight="600" fill="#e8eaed">
            EDGAR
          </text>
          <text x={710} y={190} textAnchor="middle" fontSize="10" fill="#bdc1c6">
            Form 8-K Item 1.05
          </text>
          <text x={710} y={206} textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#9aa0a6">
            sec.gov/edgar
          </text>
        </Box>
        <Box x={620} y={250} w={180} h={80} fill="#3a2e1e" stroke="#fbbf24">
          <text x={710} y={282} textAnchor="middle" fontSize="13" fontWeight="600" fill="#e8eaed">
            Officer signer
          </text>
          <text x={710} y={300} textAnchor="middle" fontSize="10" fill="#bdc1c6">
            CFO + General Counsel
          </text>
          <text x={710} y={316} textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#9aa0a6">
            FIDO2 hardware key
          </text>
        </Box>
      </svg>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#8ab4f8]/30 border border-[#8ab4f8]" />
          Workspace surface
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#f43f5e]/30 border border-[#f43f5e]" />
          INTERLOCK sandbox (per call)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#34d399]/30 border border-[#34d399]" />
          Bank integration
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#a855f7]/30 border border-[#a855f7]" />
          SEC / EDGAR
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#fbbf24]/30 border border-[#fbbf24]" />
          Human-in-the-loop
        </span>
      </div>
    </div>
  );
}

function Box({
  x,
  y,
  w,
  h,
  fill,
  stroke,
  thick,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  thick?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={thick ? 2 : 1}
      />
      {children}
    </g>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  label,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return (
    <g>
      <defs>
        <marker
          id={`arrow-${x1}-${y1}-${x2}-${y2}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#5f6368" />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#5f6368"
        strokeWidth="1.4"
        markerEnd={`url(#arrow-${x1}-${y1}-${x2}-${y2})`}
      />
      <text
        x={midX}
        y={midY - 6}
        textAnchor="middle"
        fontSize="9.5"
        fontFamily="monospace"
        fill="#9aa0a6"
        style={{ paintOrder: "stroke", stroke: "#0e0e10", strokeWidth: 4 }}
      >
        {label}
      </text>
    </g>
  );
}

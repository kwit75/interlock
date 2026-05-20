import Link from "next/link";

export default function MarketplaceListing() {
  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900 font-sans">
      {/* Marketplace top bar (Google Workspace Marketplace styling) */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6">
        <div className="flex items-center gap-3">
          <svg width="92" height="30" viewBox="0 0 272 92">
            <text
              x="0"
              y="40"
              fontSize="22"
              fontFamily="Roboto, Arial, sans-serif"
              fill="#5f6368"
            >
              Google
            </text>
            <text
              x="0"
              y="68"
              fontSize="14"
              fontFamily="Roboto, Arial, sans-serif"
              fill="#3c4043"
              fontWeight="500"
            >
              Workspace Marketplace
            </text>
          </svg>
        </div>
        <div className="ml-auto flex items-center gap-4 text-[13px] text-slate-600">
          <span className="hidden md:inline">Categories ▾</span>
          <span className="hidden md:inline">Search</span>
          <span className="hidden md:inline">Admin</span>
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-[12px] font-semibold">
            MC
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="px-6 lg:px-12 pt-5 max-w-6xl mx-auto text-[12px] text-slate-500">
        <Link href="/" className="hover:underline">
          Marketplace
        </Link>{" "}
        ›{" "}
        <span className="hover:underline cursor-pointer">
          Productivity &amp; Security
        </span>{" "}
        › <span className="text-slate-700">INTERLOCK</span>
      </div>

      {/* Listing hero */}
      <section className="px-6 lg:px-12 py-8 max-w-6xl mx-auto">
        <div className="flex items-start gap-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-semibold shrink-0"
            style={{
              background:
                "linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)",
              boxShadow: "0 6px 24px rgba(244,63,94,0.35)",
            }}
          >
            ◆
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[28px] font-medium leading-tight">INTERLOCK</h1>
            <div className="text-[14px] text-slate-600 mt-0.5">
              by Anthropic Labs · interlock.ai
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-slate-600">
              <span className="flex items-center gap-1">
                <Stars />
                <span className="font-medium text-slate-800">4.8</span>
                <span className="text-slate-500">(312)</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>700+ Workspace tenants</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>Works with Meet, Gmail</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>SOC 2 Type II</span>
            </div>
          </div>
          <Link
            href="/install/consent"
            className="px-6 py-2.5 rounded-md bg-[#1a73e8] hover:bg-[#1765cc] text-white text-[14px] font-medium transition"
          >
            Install
          </Link>
        </div>

        <p className="mt-6 text-[15px] text-slate-700 leading-relaxed max-w-3xl">
          Real-time deepfake-CEO detection on every Meet call where money
          moves. INTERLOCK runs three Gemini agents — forensics on the video
          stream, containment that calls your bank&apos;s API, and an SEC Form
          8-K Item 1.05 disclosure drafter — gated by a single human approval.
          The wire never clears.
        </p>
      </section>

      {/* Screenshots */}
      <section className="px-6 lg:px-12 max-w-6xl mx-auto pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Screenshot
            tone="rose"
            label="◆ INTERLOCK · SYNTHETIC"
            caption="Detection during live Meet call"
          />
          <Screenshot
            tone="amber"
            label="wire W-7821 → FROZEN"
            caption="Sandbox executes Python on bank API"
          />
          <Screenshot
            tone="purple"
            label="SEC Form 8-K · Item 1.05 DRAFT"
            caption="Officer review before EDGAR submission"
          />
        </div>
      </section>

      {/* Body — details + sidebar */}
      <section className="px-6 lg:px-12 max-w-6xl mx-auto pb-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <h2 className="text-[18px] font-medium border-b border-slate-200 pb-2">
            Overview
          </h2>
          <p className="text-[14px] text-slate-700 leading-relaxed mt-4">
            INTERLOCK is a Google Workspace add-on that runs continuously
            during every Meet call between authorized signers (CFO, CEO,
            Treasury). When a wire-authorizing conversation begins, a per-call
            sandbox screens the video stream for synthetic media using a
            DETECT-3B-class detector (Resemble DETECT-3B Omni in production;
            Reality Defender RealAPI as failover).
          </p>
          <p className="text-[14px] text-slate-700 leading-relaxed mt-3">
            On a positive verdict, a Managed Agents Linux sandbox spawned via
            <span className="font-mono text-[12.5px] bg-slate-100 px-1 rounded">
              {" "}
              antigravity-preview-05-2026{" "}
            </span>
            writes Python that hits your bank&apos;s wire-freeze and account-lock
            endpoints. A third agent drafts an SEC Form 8-K Item 1.05
            cybersecurity-incident disclosure — INTERLOCK never auto-files;
            the authorized officer signs via FIDO2 hardware key.
          </p>

          <h3 className="text-[16px] font-medium mt-8 border-b border-slate-200 pb-2">
            Permissions this add-on requests
          </h3>
          <Perm
            scope="meetings.readonly"
            label="View Google Meet meetings"
            why="Detect when a wire-authorizing conversation begins"
          />
          <Perm
            scope="meetings.events.stream"
            label="Stream participant video frames"
            why="Run synthetic-media detection per frame"
          />
          <Perm
            scope="banking.wire.execute"
            label="Bank wire-freeze API"
            why="Pause pending wires on verdict; never debits"
          />
          <Perm
            scope="edgar.draft"
            label="Draft (not file) SEC Form 8-K"
            why="Prepare disclosure for officer review; filing requires officer FIDO2"
          />
          <Perm
            scope="audit.write"
            label="Append-only audit log"
            why="SOX-404 compliance trail; immutable"
          />

          <h3 className="text-[16px] font-medium mt-8 border-b border-slate-200 pb-2">
            Reviews
          </h3>
          <Review
            who="Mary Chen · CFO, Northwind Industries"
            rating={5}
            body="We caught a $7M wire-fraud attempt in our first month. The CFO and our General Counsel both got the FIDO2 prompt within 4 seconds of the synthetic-media verdict. The wire was already frozen."
          />
          <Review
            who="Daniel Park · CISO, Pacific Atlas Bank"
            rating={5}
            body="The cached/live toggle and the materiality-determination handling around the 8-K disclosure are the difference between a startup demo and a SOC-grade product."
          />
          <Review
            who="J. Reeves · Compliance lead"
            rating={4}
            body="Wishing for a Slack notification webhook on the officer-signer prompt. Otherwise the cleanest Workspace add-on we've shipped this year."
          />
        </div>

        <aside className="md:col-span-1">
          <div className="rounded-xl p-4 bg-white border border-slate-200">
            <h4 className="text-[13px] font-semibold text-slate-800">
              At a glance
            </h4>
            <dl className="mt-3 text-[13px] space-y-2">
              <Row k="Works with" v="Meet · Gmail" />
              <Row k="Languages" v="English, German, Japanese" />
              <Row k="Listed" v="May 2026" />
              <Row k="Updated" v="2 days ago" />
              <Row k="Version" v="1.0.0" />
              <Row k="Type" v="Workspace add-on" />
              <Row k="Pricing" v="Enterprise · custom" />
            </dl>
          </div>
          <div className="rounded-xl p-4 bg-white border border-slate-200 mt-4">
            <h4 className="text-[13px] font-semibold text-slate-800">
              Built on
            </h4>
            <ul className="mt-3 text-[13px] text-slate-700 space-y-1.5 font-mono text-[12px]">
              <li>gemini-3.1-pro-preview</li>
              <li>gemini-3.5-flash</li>
              <li>antigravity-preview-05-2026</li>
              <li>Google Search grounding</li>
              <li>Gemini Files API</li>
            </ul>
          </div>
          <Link
            href="/install/consent"
            className="mt-5 block text-center px-6 py-3 rounded-md bg-[#1a73e8] hover:bg-[#1765cc] text-white text-[14px] font-medium transition"
          >
            Install
          </Link>
        </aside>
      </section>

      <footer className="border-t border-slate-200 py-6 text-[11px] text-slate-500 text-center">
        Marketplace listing surface · simulated for demo. INTERLOCK is a Google
        I/O 2026 hackathon project at Shack15 SF · May 23, 2026.
      </footer>
    </main>
  );
}

function Stars() {
  return (
    <span className="text-amber-500 text-[12px] tracking-tight">★★★★★</span>
  );
}

function Screenshot({
  tone,
  label,
  caption,
}: {
  tone: "rose" | "amber" | "purple";
  label: string;
  caption: string;
}) {
  const grad =
    tone === "rose"
      ? "linear-gradient(135deg,#3a1c1e 0%,#2a0e10 100%)"
      : tone === "amber"
        ? "linear-gradient(135deg,#3a2e1e 0%,#2a1e10 100%)"
        : "linear-gradient(135deg,#2e1e3a 0%,#1e122e 100%)";
  const labelColor =
    tone === "rose" ? "#fda4af" : tone === "amber" ? "#fcd34d" : "#c4b5fd";
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
      <div
        className="aspect-video flex items-center justify-center px-4"
        style={{ background: grad }}
      >
        <div className="text-center">
          <div
            className="text-[10px] tracking-[0.25em] uppercase font-mono mb-2"
            style={{ color: labelColor }}
          >
            {label}
          </div>
          <div className="text-[24px] font-semibold text-white tracking-tight">
            ◆ INTERLOCK
          </div>
        </div>
      </div>
      <div className="px-4 py-2.5 text-[12px] text-slate-700 border-t border-slate-100">
        {caption}
      </div>
    </div>
  );
}

function Perm({
  scope,
  label,
  why,
}: {
  scope: string;
  label: string;
  why: string;
}) {
  return (
    <div className="mt-3 py-3 border-b border-slate-200 grid grid-cols-[24px_1fr] gap-3">
      <div className="text-amber-500 text-[14px]">•</div>
      <div>
        <div className="text-[13.5px] font-medium text-slate-800">{label}</div>
        <div className="text-[12px] text-slate-500 mt-0.5">{why}</div>
        <div className="text-[10.5px] text-slate-400 font-mono mt-0.5">
          {scope}
        </div>
      </div>
    </div>
  );
}

function Review({
  who,
  rating,
  body,
}: {
  who: string;
  rating: number;
  body: string;
}) {
  return (
    <div className="mt-4 pb-4 border-b border-slate-200">
      <div className="text-[13px] font-medium text-slate-800">{who}</div>
      <div className="text-amber-500 text-[12px] mt-0.5">
        {"★".repeat(rating)}
        <span className="text-slate-300">{"★".repeat(5 - rating)}</span>
      </div>
      <p className="text-[13px] text-slate-700 mt-1.5 leading-relaxed">{body}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-slate-800 text-right">{v}</dd>
    </div>
  );
}

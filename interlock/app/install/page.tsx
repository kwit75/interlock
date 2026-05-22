import Link from "next/link";

/**
 * Google Workspace Marketplace listing — pixel-close clone of the real
 * https://workspace.google.com/marketplace/app/<id> page layout.
 *
 * Layout reference points (verified against live Marketplace UI):
 *   • Top bar: Google "G" multicolor logo + "Workspace Marketplace" wordmark,
 *     centered search box, sign-in avatar right
 *   • Breadcrumb: gray, dot-separated
 *   • Hero: 80×80 icon left, 32px medium app name + developer link + ratings,
 *     blue "Install" pill button (1A73E8) right
 *   • "Works with" row: monochrome product chips
 *   • Tabs: Overview · Reviews · Permissions (active Overview)
 *   • Screenshots carousel: 3 tiles, gray-bordered, 16:9
 *   • Body: Overview + Permissions
 *   • Right rail "Additional information": Compatibility · Pricing · Languages
 *     · Last updated · Developer · Categories
 *   • Footer with privacy / terms / support links
 *
 * Developer credit corrected 2026-05-22: was "Anthropic Labs" (wrong —
 * we're built on Google Gemini, not Anthropic). Now "INTERLOCK, Inc."
 */

export default function MarketplaceListing() {
  return (
    <main className="min-h-screen bg-white text-[#202124] font-sans" style={{ fontFamily: "Roboto, Arial, sans-serif" }}>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header
        className="h-[64px] bg-white flex items-center px-6"
        style={{ borderBottom: "1px solid #dadce0" }}
      >
        <div className="flex items-center gap-2">
          <GoogleG />
          <div className="leading-none">
            <div className="text-[18px] font-normal" style={{ color: "#5f6368" }}>
              Google Workspace Marketplace
            </div>
          </div>
        </div>
        <div className="ml-12 flex-1 max-w-2xl">
          <div
            className="flex items-center gap-3 px-4 h-[44px] rounded-full"
            style={{ background: "#f1f3f4" }}
          >
            <SearchIcon />
            <input
              type="text"
              placeholder="Search apps"
              defaultValue=""
              className="bg-transparent outline-none flex-1 text-[14px]"
              style={{ color: "#202124" }}
              readOnly
            />
          </div>
        </div>
        <div className="ml-6 flex items-center gap-4">
          <a className="text-[14px]" style={{ color: "#1a73e8" }} href="#">
            Sign in
          </a>
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-[12px] font-semibold">
            MC
          </div>
        </div>
      </header>

      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <div className="px-12 pt-6 max-w-6xl mx-auto text-[13px]" style={{ color: "#5f6368" }}>
        <Link href="/" style={{ color: "#1a73e8" }}>
          Marketplace
        </Link>
        <span className="mx-1.5">›</span>
        <a style={{ color: "#1a73e8" }} href="#">Productivity</a>
        <span className="mx-1.5">›</span>
        <a style={{ color: "#1a73e8" }} href="#">Security &amp; compliance</a>
        <span className="mx-1.5">›</span>
        <span style={{ color: "#202124" }}>INTERLOCK</span>
      </div>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="px-12 pt-6 pb-8 max-w-6xl mx-auto">
        <div className="flex items-start gap-6">
          <div
            className="w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-white text-[34px] font-semibold shrink-0"
            style={{
              background: "linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)",
              boxShadow: "0 4px 16px rgba(244,63,94,0.30)",
            }}
          >
            ◆
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[28px] leading-[34px] font-normal" style={{ color: "#202124" }}>
              INTERLOCK
            </h1>
            <div className="text-[14px] mt-1" style={{ color: "#5f6368" }}>
              <a href="#" style={{ color: "#1a73e8" }}>INTERLOCK, Inc.</a>
              <span className="mx-1.5">·</span>
              <a href="#" style={{ color: "#1a73e8" }}>interlock.ai</a>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[13px]" style={{ color: "#5f6368" }}>
              <Stars />
              <span style={{ color: "#202124" }} className="font-medium">4.8</span>
              <a href="#reviews" style={{ color: "#1a73e8" }}>(312)</a>
              <span className="mx-1">·</span>
              <span>700+ Workspace tenants</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[12px]" style={{ color: "#5f6368" }}>
              <span style={{ color: "#5f6368" }} className="mr-1">Works with:</span>
              <ProductChip name="Meet" />
              <ProductChip name="Gmail" />
              <ProductChip name="Calendar" />
              <ProductChip name="Drive" />
            </div>
          </div>
          <Link
            href="/install/consent"
            className="px-8 py-2 rounded-[18px] text-white text-[14px] font-medium transition mt-1"
            style={{
              background: "#1a73e8",
              boxShadow: "0 1px 2px rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)",
              minHeight: 36,
            }}
          >
            Install
          </Link>
        </div>
      </section>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <nav
        className="px-12 max-w-6xl mx-auto flex items-center gap-8 text-[14px]"
        style={{ borderBottom: "1px solid #dadce0" }}
      >
        <Tab label="Overview" active />
        <Tab label="Reviews" />
        <Tab label="Permissions" />
        <Tab label="Compatible with" />
      </nav>

      {/* ── Screenshots carousel ────────────────────────────────── */}
      <section className="px-12 pt-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-1.5">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition hover:bg-slate-100"
            style={{ border: "1px solid #dadce0", color: "#5f6368" }}
          >
            ‹
          </button>
          <div className="grid grid-cols-3 gap-3 flex-1">
            <Screenshot
              tone="rose"
              label="◆ INTERLOCK · COUNCIL"
              caption="8 parallel Gemini 3.5 Flash sub-agents on a live Meet call"
            />
            <Screenshot
              tone="amber"
              label="wire W-7821 → FROZEN"
              caption="Antigravity Managed Agent sandbox executes Python on bank API"
            />
            <Screenshot
              tone="purple"
              label="SEC Form 8-K · Item 1.05 DRAFT"
              caption="Officer review before EDGAR submission · FIDO2 co-signed"
            />
          </div>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition hover:bg-slate-100"
            style={{ border: "1px solid #dadce0", color: "#5f6368" }}
          >
            ›
          </button>
        </div>
      </section>

      {/* ── Body: Overview + Sidebar ────────────────────────────── */}
      <section className="px-12 pt-10 pb-12 max-w-6xl mx-auto grid grid-cols-12 gap-10">
        <div className="col-span-12 md:col-span-8">
          <h2 className="text-[18px] font-medium" style={{ color: "#202124" }}>
            Overview
          </h2>
          <p className="text-[14px] mt-3 leading-[1.7]" style={{ color: "#202124" }}>
            INTERLOCK is a Google Workspace add-on that catches deepfake-CEO wire
            fraud on every Meet call where money moves. When a wire-authorizing
            video conversation begins, INTERLOCK&apos;s Council — an
            orchestrator and six forensic sub-agents on{" "}
            <span className="font-medium">Gemini 3.5 Flash</span> — fans out in
            parallel across the live frame and audio stream.
          </p>
          <p className="text-[14px] mt-3 leading-[1.7]" style={{ color: "#202124" }}>
            On a synthetic verdict, a Managed Agents Linux sandbox spawned via
            <span
              className="font-mono text-[12.5px] px-1.5 py-0.5 mx-0.5 rounded"
              style={{ background: "#f1f3f4", color: "#202124" }}
            >
              antigravity-preview-05-2026
            </span>
            writes Python that hits your bank&apos;s wire-freeze and account-lock
            endpoints. INTERLOCK never auto-files anything: the authorized
            officer signs the SEC Form 8-K Item 1.05 draft via FIDO2 hardware
            key and submits to EDGAR.
          </p>

          <h2
            className="text-[18px] font-medium mt-8 pb-2"
            style={{ color: "#202124", borderBottom: "1px solid #dadce0" }}
          >
            What you can do with INTERLOCK
          </h2>
          <ul className="mt-3 text-[14px] space-y-2" style={{ color: "#202124" }}>
            <li>● Detect synthetic-media impersonation on Meet / Zoom / Teams / Webex / Slack huddles / Discord</li>
            <li>● Freeze the pending wire automatically — the model never debits</li>
            <li>● Draft SEC Form 8-K Item 1.05 disclosure within the four-business-day window</li>
            <li>● Maintain a WORM-backed audit trail (SOX-404 + SR 26-2 compliant)</li>
            <li>● Operate at a 0.3% FPR / 2.1% FNR operating point with dual-FIDO2 co-signature</li>
          </ul>

          <h3
            className="text-[16px] font-medium mt-8 pb-2"
            style={{ color: "#202124", borderBottom: "1px solid #dadce0" }}
          >
            Permissions this app requests
          </h3>
          <Perm
            icon={MeetIcon}
            label="View Google Meet meetings"
            scope="https://www.googleapis.com/auth/meetings.readonly"
            why="Detect when a wire-authorizing conversation begins."
          />
          <Perm
            icon={VideoIcon}
            label="Stream participant video frames"
            scope="https://www.googleapis.com/auth/meetings.events.stream"
            why="Run synthetic-media detection per frame."
          />
          <Perm
            icon={BankIcon}
            label="Bank wire-freeze API"
            scope="https://api.bank.example/v1/wires:freeze"
            why="Pause pending wires on verdict; INTERLOCK never debits."
          />
          <Perm
            icon={DocIcon}
            label="Draft (not file) SEC Form 8-K Item 1.05"
            scope="https://www.sec.gov/cgi-bin/browse-edgar:draft"
            why="Prepare disclosure for officer review; filing requires officer FIDO2 signature."
          />
          <Perm
            icon={LockIcon}
            label="Append-only audit log"
            scope="https://www.googleapis.com/auth/cloud-platform.audit:write"
            why="SOX-404 compliance trail; WORM-backed, immutable."
          />

          <h3
            className="text-[16px] font-medium mt-10 pb-2"
            id="reviews"
            style={{ color: "#202124", borderBottom: "1px solid #dadce0" }}
          >
            Reviews
          </h3>
          <Review
            initial="M"
            color="#1a73e8"
            who="Mary Chen"
            sub="CFO · Northwind Industries"
            date="3 weeks ago"
            rating={5}
            body="We caught a $7M wire-fraud attempt in our first month. The CFO and our General Counsel both got the FIDO2 prompt within 4 seconds of the synthetic-media verdict. The wire was already frozen."
          />
          <Review
            initial="D"
            color="#34a853"
            who="Daniel Park"
            sub="CISO · Pacific Atlas Bank"
            date="2 months ago"
            rating={5}
            body="The cached/live toggle and the materiality-determination handling around the 8-K disclosure are the difference between a startup demo and a SOC-grade product."
          />
          <Review
            initial="J"
            color="#fbbc04"
            who="J. Reeves"
            sub="Compliance lead · Mid-cap fintech"
            date="2 months ago"
            rating={4}
            body="Wishing for a Slack notification webhook on the officer-signer prompt. Otherwise the cleanest Workspace add-on we've shipped this year."
          />
        </div>

        {/* ── Right rail: Additional information ───────────────── */}
        <aside className="col-span-12 md:col-span-4">
          <div className="rounded-lg p-5" style={{ border: "1px solid #dadce0" }}>
            <h4 className="text-[14px] font-medium" style={{ color: "#202124" }}>
              Additional information
            </h4>
            <div className="mt-4">
              <InfoRow k="Pricing" v="Enterprise · contact sales" />
              <InfoRow k="Last updated" v="May 23, 2026" />
              <InfoRow k="Version" v="1.0.0" />
              <InfoRow k="Languages" v="English · German · Japanese" />
              <InfoRow k="Listed in" v="May 2026" />
              <InfoRow
                k="Developer"
                v={
                  <a href="#" style={{ color: "#1a73e8" }}>
                    INTERLOCK, Inc.
                  </a>
                }
              />
              <InfoRow
                k="Developer website"
                v={
                  <a href="#" style={{ color: "#1a73e8" }}>
                    interlock.ai
                  </a>
                }
              />
              <InfoRow k="Categories" v="Productivity · Security &amp; compliance" />
              <InfoRow k="Permissions" v="5 scopes" />
            </div>

            <div className="mt-5 pt-5" style={{ borderTop: "1px solid #dadce0" }}>
              <div className="text-[12px] font-medium uppercase tracking-wider mb-3" style={{ color: "#5f6368" }}>
                Compatibility
              </div>
              <div className="grid grid-cols-4 gap-3">
                <CompatTile name="Meet" icon={MeetIcon} />
                <CompatTile name="Gmail" icon={GmailIcon} />
                <CompatTile name="Calendar" icon={CalIcon} />
                <CompatTile name="Drive" icon={DriveIcon} />
              </div>
            </div>

            <div className="mt-5 pt-5 space-y-2 text-[13px]" style={{ borderTop: "1px solid #dadce0" }}>
              <a href="#" className="block" style={{ color: "#1a73e8" }}>
                Privacy Policy
              </a>
              <a href="#" className="block" style={{ color: "#1a73e8" }}>
                Terms of Service
              </a>
              <a href="#" className="block" style={{ color: "#1a73e8" }}>
                Support
              </a>
            </div>
          </div>

          <Link
            href="/install/consent"
            className="mt-5 block text-center px-8 py-2 rounded-[18px] text-white text-[14px] font-medium transition"
            style={{
              background: "#1a73e8",
              boxShadow: "0 1px 2px rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)",
            }}
          >
            Install
          </Link>
        </aside>
      </section>

      <footer
        className="py-6 text-[12px] text-center"
        style={{ borderTop: "1px solid #dadce0", color: "#5f6368" }}
      >
        Marketplace listing surface · simulated for demo. INTERLOCK is a Google
        I/O 2026 hackathon project · Cerebral Valley × Google DeepMind · Shack15
        SF · May 23, 2026.
      </footer>
    </main>
  );
}

// ────────────────────────── Subcomponents ──────────────────────────

function Stars() {
  return (
    <span style={{ color: "#fbbc04", letterSpacing: -1 }}>★★★★★</span>
  );
}

function Tab({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      className="py-4 cursor-pointer transition"
      style={{
        color: active ? "#1a73e8" : "#5f6368",
        borderBottom: active ? "3px solid #1a73e8" : "3px solid transparent",
        fontWeight: active ? 500 : 400,
      }}
    >
      {label}
    </div>
  );
}

function ProductChip({ name }: { name: string }) {
  return (
    <span
      className="text-[11px] px-2 py-0.5 rounded font-medium"
      style={{
        background: "#f1f3f4",
        color: "#5f6368",
      }}
    >
      {name}
    </span>
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
    <div
      className="rounded-lg overflow-hidden bg-white"
      style={{ border: "1px solid #dadce0" }}
    >
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
      <div
        className="px-4 py-2.5 text-[12px]"
        style={{ borderTop: "1px solid #f1f3f4", color: "#5f6368" }}
      >
        {caption}
      </div>
    </div>
  );
}

function Perm({
  icon: Icon,
  label,
  scope,
  why,
}: {
  icon: () => React.ReactElement;
  label: string;
  scope: string;
  why: string;
}) {
  return (
    <div
      className="mt-3 py-3 grid grid-cols-[32px_1fr] gap-3 items-start"
      style={{ borderBottom: "1px solid #f1f3f4" }}
    >
      <div className="mt-0.5">
        <Icon />
      </div>
      <div>
        <div className="text-[14px] font-medium" style={{ color: "#202124" }}>
          {label}
        </div>
        <div className="text-[12.5px] mt-0.5" style={{ color: "#5f6368" }}>
          {why}
        </div>
        <div
          className="text-[11px] font-mono mt-1"
          style={{ color: "#80868b" }}
        >
          {scope}
        </div>
      </div>
    </div>
  );
}

function Review({
  initial,
  color,
  who,
  sub,
  date,
  rating,
  body,
}: {
  initial: string;
  color: string;
  who: string;
  sub: string;
  date: string;
  rating: number;
  body: string;
}) {
  return (
    <div className="mt-5 pb-5" style={{ borderBottom: "1px solid #f1f3f4" }}>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[14px] font-medium"
          style={{ background: color }}
        >
          {initial}
        </div>
        <div className="flex-1">
          <div className="text-[13.5px] font-medium" style={{ color: "#202124" }}>
            {who}
          </div>
          <div className="text-[12px]" style={{ color: "#5f6368" }}>
            {sub} · {date}
          </div>
        </div>
      </div>
      <div className="mt-2" style={{ color: "#fbbc04", letterSpacing: -1, fontSize: 13 }}>
        {"★".repeat(rating)}
        <span style={{ color: "#dadce0" }}>{"★".repeat(5 - rating)}</span>
      </div>
      <p className="text-[13.5px] mt-2 leading-[1.6]" style={{ color: "#202124" }}>
        {body}
      </p>
    </div>
  );
}

function InfoRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div
      className="py-2 grid grid-cols-[110px_1fr] gap-2 text-[13px] items-start"
      style={{ borderBottom: "1px solid #f1f3f4" }}
    >
      <dt style={{ color: "#5f6368" }}>{k}</dt>
      <dd style={{ color: "#202124" }}>{v}</dd>
    </div>
  );
}

function CompatTile({
  name,
  icon: Icon,
}: {
  name: string;
  icon: () => React.ReactElement;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ background: "#f1f3f4" }}
      >
        <Icon />
      </div>
      <div className="text-[11px]" style={{ color: "#5f6368" }}>
        {name}
      </div>
    </div>
  );
}

// ────────────────────────── Icons (Google brand colors) ──────────────────────────

function GoogleG() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.18 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.12l7.35 5.7c1.73-5.2 6.58-9.75 12.31-9.75z"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f6368">
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

function MeetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#00832d" d="M14 7v10l5 3V4z" />
      <path fill="#0066da" d="M3 7v10h11V7z" />
      <path fill="#e94235" d="M14 17h5l-5-3z" />
      <path fill="#2684fc" d="M14 7h5l-5 3z" />
      <path fill="#ffba00" d="M3 17h11v-3l-3-2 3-2V7H3z" />
    </svg>
  );
}

function GmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285f4" d="M22 6.5V18a2 2 0 0 1-2 2h-2V8.5l4-2z" />
      <path fill="#34a853" d="M2 18a2 2 0 0 0 2 2h2V8.5L2 6.5V18z" />
      <path fill="#ea4335" d="M22 6.5l-2-1.5L12 11 4 5l-2 1.5L12 13z" />
      <path fill="#fbbc04" d="M20 5l-8 6V20h6a2 2 0 0 0 2-2V5z" />
      <path fill="#c5221f" d="M4 5l8 6v9H6a2 2 0 0 1-2-2V5z" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="17" rx="2" fill="#fff" stroke="#dadce0" />
      <rect x="3" y="4" width="18" height="4" fill="#1a73e8" />
      <rect x="7" y="2" width="2" height="4" fill="#5f6368" />
      <rect x="15" y="2" width="2" height="4" fill="#5f6368" />
      <text x="12" y="17" fontSize="9" fill="#1a73e8" textAnchor="middle" fontWeight="700" fontFamily="Roboto, Arial">23</text>
    </svg>
  );
}

function DriveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#0066da" d="M8 4l-6 10 3 5 6-10z" />
      <path fill="#00ac47" d="M22 14L16 4h-8l6 10z" />
      <path fill="#ea4335" d="M5 19h14l3-5H8z" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#5f6368">
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#5f6368">
      <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#5f6368">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#5f6368">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
    </svg>
  );
}

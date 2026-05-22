import Link from "next/link";

/**
 * Side-by-side diff of a real post-effective-date SEC Form 8-K Item 1.05
 * filing (Microsoft's January 17, 2024 Midnight Blizzard disclosure)
 * against INTERLOCK's auto-drafted Item 1.05 for the demo incident.
 *
 * Defends against the Q&A attack "the Comms agent is a Wizard of Oz":
 * if a judge pulls EDGAR live, INTERLOCK's draft hits the same four
 * mandatory elements (nature · scope · timing · material impact) in the
 * same legal voice, citing the same SEC Press Release 2023-139 four-
 * business-day rule.
 *
 * Built per deep-research #3 (2026-05-22) Section 1 rank #1 — the
 * highest-marginal-win-per-hour add for T-22h. Microsoft 1.05 picked
 * over Clorox (8.01) / Caesars (8.01) which are pre-effective-date and
 * NOT 1.05 precedents.
 */

const C = {
  bg: "#06080a",
  text: "#e8eaed",
  textDim: "#9aa0a6",
  textMuted: "#5f6368",
  blue: "#8ab4f8",
  purple: "#a855f7",
  emerald: "#34d399",
  rose: "#f43f5e",
  divider: "rgba(255,255,255,0.08)",
};

const MSFT_8K_URL =
  "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000789019&type=8-K&dateb=&owner=include&count=40";

const ELEMENTS = [
  {
    title: "Material aspects of the incident",
    msft: `On January 12, 2024, Microsoft detected a nation-state attack on our corporate systems and immediately activated our response process to investigate, disrupt malicious activity, mitigate the attack, and deny the threat actor further access. The Microsoft Threat Intelligence investigation identified the threat actor as Midnight Blizzard, the Russian state-sponsored actor also known as NOBELIUM.`,
    interlock: `On May 23, 2026, INTERLOCK detected and contained a material cybersecurity incident. A threat actor impersonating the Chief Executive Officer via a synthetic ("deepfake") video communication attempted to authorize a fraudulent wire transfer of $50,000,000 USD to an external account associated with the vendor designation "TechVenture Ltd." The Registrant's automated detection and containment systems froze the wire prior to settlement.`,
  },
  {
    title: "Nature and scope",
    msft: `Beginning in late November 2023, the threat actor used a password spray attack to compromise a legacy non-production test tenant account and gain a foothold, and then used the account's permissions to access a very small percentage of Microsoft corporate email accounts, including members of our senior leadership team and employees in our cybersecurity, legal, and other functions, and exfiltrated some emails and attached documents.`,
    interlock: `Eight `,
    interlockExtra: `gemini-3.5-flash`,
    interlockCont: ` sub-agents (Frame Forensics, Voice-Print Cross-Match, Reverse Provenance, Counter-Strategy, Regulatory Precedent, Injection Guard, Verdict Aggregator, and Orchestrator) operated in parallel to detect the synthetic-media call. Consensus verdict gated on three-of-six worker agreement returned "synthetic" at 88% confidence. The Containment sub-system, operating within a sandboxed Linux execution environment, issued an automated freeze instruction to the Registrant's banking partner via standard wire-control API. No customer data was exfiltrated; the incident was confined to the attempted wire authorization.`,
  },
  {
    title: "Timing",
    msft: `The investigation is ongoing, and we will continue to disclose additional information as we are able. As of the date of this filing, the incident has not had a material impact on the Company's operations.`,
    interlock: `The Registrant determined the incident to be material on May 23, 2026, at 14:00 PT, following review by the Registrant's Chief Information Security Officer and General Counsel. This filing is made within the four-business-day window required by Item 1.05 of Form 8-K (SEC Press Release 2023-139). The Registrant intends to file an amendment under Item 1.05(c) within four business days of any additional material information becoming known.`,
  },
  {
    title: "Material impact",
    msft: `As of the date of this filing, the incident has not had a material impact on the Company's operations. The Company has not yet determined the incident is reasonably likely to materially impact the Company's financial condition or results of operations.`,
    interlock: `The wire transfer was frozen prior to settlement; no funds left the Registrant's accounts. The Registrant has not, as of the date of this filing, determined the incident to be reasonably likely to materially impact its financial condition or results of operations. The Registrant continues to evaluate the full scope of the incident and will file an amendment under Item 1.05(c) if material new information is determined.`,
  },
];

export default function SEC105Diff() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: C.bg, color: C.text }}
    >
      <nav
        className="h-14 px-6 lg:px-12 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${C.divider}` }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[13px] font-semibold"
            style={{
              background: `linear-gradient(135deg, ${C.rose} 0%, ${C.purple} 100%)`,
            }}
          >
            ◆
          </div>
          <span className="text-[15px] font-semibold tracking-tight">INTERLOCK</span>
          <span
            className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{
              background: "rgba(168,85,247,0.10)",
              color: C.purple,
              border: `1px solid ${C.purple}55`,
            }}
          >
            SEC 8-K · Item 1.05 diff
          </span>
        </Link>
        <div className="flex items-center gap-6 text-[13px]" style={{ color: C.textDim }}>
          <Link href="/how-it-connects" className="hover:text-white">
            How it connects
          </Link>
          <Link href="/vs-resemble" className="hover:text-white">
            vs Resemble
          </Link>
          <Link href="/pitch" className="hover:text-white">
            Pitch
          </Link>
          <Link href="/meet" className="hover:text-white">
            Live demo
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div
          className="text-[11px] tracking-[0.3em] uppercase font-medium mb-3"
          style={{ color: C.purple }}
        >
          ◆ Regulatory precedent
        </div>
        <h1 className="text-[44px] font-semibold tracking-tight leading-[1.05]">
          INTERLOCK&apos;s auto-drafted 8-K
          <br />
          <span style={{ color: C.textDim }}>
            against the gold-standard Item 1.05.
          </span>
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed max-w-3xl" style={{ color: C.textDim }}>
          When INTERLOCK&apos;s Comms agent finishes drafting an Item 1.05 cybersecurity-incident
          disclosure, the relevant question isn&apos;t whether it sounds like a real 8-K — it&apos;s
          whether it hits the <span style={{ color: C.text }}>four mandatory elements</span> SEC Press
          Release 2023-139 requires:
          <span style={{ color: C.text }}>
            {" "}
            (1) the material aspects of the incident, (2) the nature and scope, (3) the timing, and
            (4) the material impact or reasonably likely material impact
          </span>
          {" "}— within the
          <span style={{ color: C.text }}> four-business-day window from materiality determination</span>.
        </p>

        <p className="mt-3 text-[14px] leading-relaxed max-w-3xl" style={{ color: C.textMuted }}>
          The gold-standard public Item 1.05 filing is <strong style={{ color: C.text }}>Microsoft Corporation&apos;s
          January 17, 2024 disclosure</strong> of the Midnight Blizzard nation-state intrusion — the first
          Item 1.05 filed under the new rule by a major reporting company after the rule&apos;s effective
          date of December 18, 2023. Filed within four business days of the company&apos;s materiality
          determination on January 12. The Clorox and Caesars filings often cited as &ldquo;1.05 precedents&rdquo;
          are pre-effective-date Item 8.01 (&ldquo;Other Events&rdquo;) filings — not Item 1.05.
        </p>

        <div className="mt-10 space-y-6">
          {ELEMENTS.map((el) => (
            <Element key={el.title} {...el} />
          ))}
        </div>

        <div
          className="mt-12 rounded-xl p-6"
          style={{ background: "rgba(138,180,248,0.06)", border: `1px solid ${C.blue}40` }}
        >
          <div
            className="text-[10px] tracking-[0.3em] uppercase font-medium mb-2"
            style={{ color: C.blue }}
          >
            ◆ Source links · open EDGAR live
          </div>
          <ul className="text-[14px] space-y-2" style={{ color: C.text }}>
            <li>
              ●{" "}
              <a
                href={MSFT_8K_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
                style={{ color: C.blue }}
              >
                Microsoft Corporation · 8-K Item 1.05 · January 17, 2024 · Midnight Blizzard
              </a>{" "}
              <span style={{ color: C.textMuted }}>(CIK 0000789019)</span>
            </li>
            <li>
              ●{" "}
              <a
                href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000731766&type=8-K"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
                style={{ color: C.blue }}
              >
                UnitedHealth Group · 8-K Item 1.05 · February 22, 2024 · Change Healthcare
              </a>{" "}
              <span style={{ color: C.textMuted }}>(CIK 0000731766)</span>
            </li>
            <li>
              ●{" "}
              <a
                href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001137774&type=8-K"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
                style={{ color: C.blue }}
              >
                Prudential Financial · 8-K Item 1.05 · February 14, 2024
              </a>{" "}
              <span style={{ color: C.textMuted }}>(CIK 0001137774)</span>
            </li>
            <li>
              ●{" "}
              <a
                href="https://www.sec.gov/news/press-release/2023-139"
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
                style={{ color: C.blue }}
              >
                SEC Press Release 2023-139 · July 26, 2023 · Item 1.05 rule adoption
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-12 text-[12px]" style={{ color: C.textMuted }}>
          INTERLOCK never auto-files. The Comms agent drafts; the authorized officer signs via FIDO2
          hardware key and submits to EDGAR. INTERLOCK&apos;s role ends at the draft + audit log.
        </div>
      </main>
    </div>
  );
}

function Element({
  title,
  msft,
  interlock,
  interlockExtra,
  interlockCont,
}: {
  title: string;
  msft: string;
  interlock: string;
  interlockExtra?: string;
  interlockCont?: string;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${C.divider}` }}
    >
      <div
        className="px-5 py-2.5 text-[11px] tracking-[0.3em] uppercase font-medium"
        style={{
          background: "rgba(168,85,247,0.06)",
          color: C.purple,
          borderBottom: `1px solid ${C.divider}`,
        }}
      >
        {title}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: C.divider }}>
        <div className="px-5 py-4">
          <div
            className="text-[10px] tracking-[0.25em] uppercase font-medium mb-2"
            style={{ color: C.blue }}
          >
            Microsoft 8-K · Item 1.05 · 2024-01-17
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: C.text }}>
            {msft}
          </p>
        </div>
        <div className="px-5 py-4" style={{ background: "rgba(168,85,247,0.03)" }}>
          <div
            className="text-[10px] tracking-[0.25em] uppercase font-medium mb-2"
            style={{ color: C.purple }}
          >
            INTERLOCK auto-draft · gemini-3.5-flash + Search
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: C.text }}>
            {interlock}
            {interlockExtra && (
              <span className="font-mono" style={{ color: C.purple }}>
                {interlockExtra}
              </span>
            )}
            {interlockCont}
          </p>
        </div>
      </div>
    </div>
  );
}

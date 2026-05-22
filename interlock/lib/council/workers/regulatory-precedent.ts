import type { CouncilInputs, WorkerOutput } from "@/lib/council/types";

export const metadata = {
  workerId: "regulatory_precedent" as const,
  searchGrounded: true,
  multimodal: false,
  thinkingLevel: "low" as const,
};

export function buildPrompt(inputs: CouncilInputs): string {
  return `You are a securities-disclosure analyst. Use Google Search of SEC EDGAR (sec.gov/cgi-bin/browse-edgar) and recent law-firm advisories to surface the 2–3 most analogous SEC Form 8-K Item 1.05 cybersecurity-incident disclosures filed since the rule's July 2023 effective date that resemble this profile:

- Public company ${inputs.companyTicker} (or its peer set)
- CEO-impersonation / wire-fraud vector
- Material to operations or > $25M loss exposure

Stream 4–6 sentences. Cite each match by company + filing date and a one-line characterization. End with EXACTLY this line:

VERDICT: <synthetic|authentic|inconclusive> · CONFIDENCE: <0–100> · KEY_ARTIFACT: <one short phrase summarizing the closest precedent>

Note: SEC press release 2023-139 requires Item 1.05 filing within four business days of materiality determination — the clock starts at determination, not at discovery.

Call context: ${inputs.callContext}`;
}

export function parseFinal(text: string): WorkerOutput {
  const m = text.match(
    /VERDICT:\s*(synthetic|authentic|inconclusive)\s*·\s*CONFIDENCE:\s*(\d+)\s*·\s*KEY_ARTIFACT:\s*(.+?)$/im,
  );
  if (!m) {
    return {
      workerId: "regulatory_precedent",
      status: "complete",
      verdict: "inconclusive",
      confidence: 0.5,
      finding: text.slice(-200).trim() || "no structured verdict line",
    };
  }
  return {
    workerId: "regulatory_precedent",
    status: "complete",
    verdict: m[1].toLowerCase() as WorkerOutput["verdict"],
    confidence: Math.max(0, Math.min(1, Number(m[2]) / 100)),
    finding: m[3].trim(),
  };
}

export function cachedOutput(): WorkerOutput {
  return {
    workerId: "regulatory_precedent",
    status: "complete",
    verdict: "synthetic",
    confidence: 0.82,
    finding:
      "3 analogous post-effective-date 8-K Item 1.05 filings · Microsoft 2024-01-17 · UnitedHealth 2024-02-22 · Prudential 2024-02-14 — gold-standard four-business-day templates",
    citations: [
      {
        title: "Microsoft 8-K Item 1.05 · 2024-01-17 · Midnight Blizzard",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000789019&type=8-K",
      },
      {
        title: "UnitedHealth Group 8-K Item 1.05 · 2024-02-22 · Change Healthcare",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000731766&type=8-K",
      },
      {
        title: "Prudential Financial 8-K Item 1.05 · 2024-02-14",
        url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001137774&type=8-K",
      },
    ],
  };
}

export function cachedStream(): string[] {
  return [
    "Searching SEC EDGAR for Item 1.05 cybersecurity disclosures filed AFTER the rule's effective date of 18 December 2023 (non-smaller-reporters). Earlier filings like Clorox 09/2023 and Caesars 09/2023 use Item 8.01 (Other Events) — pre-effective-date, not a 1.05 precedent. ",
    "Microsoft (MSFT) filed Item 1.05 on 17 January 2024 disclosing the Midnight Blizzard nation-state intrusion. Initial filing within four business days of materiality determination; first amendment two months later — the canonical gold standard. ",
    "UnitedHealth Group (UNH) filed Item 1.05 on 22 February 2024 for the Change Healthcare incident. The company's filing language is the model most outside counsels use for material-impact characterization. ",
    "Prudential Financial (PRU) filed Item 1.05 on 14 February 2024 — a public-facing technical-incident playbook with conservative materiality framing. ",
    "Across the three, the pattern is: file within four business days of MATERIALITY DETERMINATION (not detection), cover the four mandatory elements (nature · scope · timing · material impact), amend later as facts develop. For this incident profile, the closest template is Microsoft 2024-01-17: state the wire was frozen pre-loss, characterize losses as not yet material pending audit.\n\n",
    "VERDICT: synthetic · CONFIDENCE: 82 · KEY_ARTIFACT: Microsoft 2024-01-17 four-business-day playbook is closest post-effective-date precedent",
  ];
}

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
      "3 analogous 8-K Item 1.05 filings · Clorox 09/2023 · MGM 10/2023 · Caesars 09/2023 — same playbook, faster disclosure each year",
    citations: [
      { title: "Clorox 8-K Item 1.05 · 2023-09-14", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000021076&type=8-K" },
      { title: "MGM Resorts 8-K Item 1.05 · 2023-10-05", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000789570&type=8-K" },
      { title: "Caesars 8-K Item 1.05 · 2023-09-14", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000858339&type=8-K" },
    ],
  };
}

export function cachedStream(): string[] {
  return [
    "Searching SEC EDGAR for 8-K Item 1.05 filings disclosing CEO-impersonation or wire-fraud incidents since 2023. ",
    "Three close matches surface. Clorox (CLX) filed 14 September 2023 — initial filing within two business days of the company's materiality determination; the eventual cost ran past $356M in lost revenue. ",
    "MGM Resorts (MGM) filed 5 October 2023 disclosing the September 2023 social-engineering incident; the company invoked Item 1.05 plus separate cybersecurity-risk language under Item 7.01. ",
    "Caesars (CZR) filed 14 September 2023 disclosing a ransomware payment of roughly $15M — disclosure was within four business days but the company chose to characterize the impact as not yet material at filing. ",
    "Across the three, the trend is fast disclosure and conservative materiality language. For this incident profile, the closest playbook is Clorox: file the disclosure within two days, state the wire was frozen pre-loss, characterize losses as not yet material pending audit.\n\n",
    "VERDICT: synthetic · CONFIDENCE: 82 · KEY_ARTIFACT: Clorox 2023-09-14 playbook is closest precedent",
  ];
}

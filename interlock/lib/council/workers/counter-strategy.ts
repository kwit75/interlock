import type { CouncilInputs, WorkerOutput } from "@/lib/council/types";

export const metadata = {
  workerId: "counter_strategy" as const,
  searchGrounded: false,
  multimodal: false,
  thinkingLevel: "low" as const,
};

export function buildPrompt(inputs: CouncilInputs): string {
  return `You are a counter-fraud strategist trained on the FBI IC3 Business Email Compromise (BEC) playbook and ~30 known CEO-impersonation incidents. Assume this is a real social-engineering attack in progress.

Predict the attacker's next 3 most-likely moves if the primary wire is blocked. Be concrete (concrete dollar amounts, channels, target identities). Each prediction should reference a known BEC pattern by short name (e.g. "vendor-switch", "controller-redirect", "treasury-cascade").

Stream 4–5 connected analyst-voice sentences. End with EXACTLY this line:

VERDICT: <synthetic|authentic|inconclusive> · CONFIDENCE: <0–100> · KEY_ARTIFACT: <one short phrase summarizing predicted attacker pivot>

Call context: ${inputs.callContext}
Target identity: ${inputs.ceoName} of ${inputs.companyTicker}, amount in play $${inputs.amountUsd.toLocaleString()}.`;
}

export function parseFinal(text: string): WorkerOutput {
  const m = text.match(
    /VERDICT:\s*(synthetic|authentic|inconclusive)\s*·\s*CONFIDENCE:\s*(\d+)\s*·\s*KEY_ARTIFACT:\s*(.+?)$/im,
  );
  if (!m) {
    return {
      workerId: "counter_strategy",
      status: "complete",
      verdict: "inconclusive",
      confidence: 0.5,
      finding: text.slice(-200).trim() || "no structured verdict line",
    };
  }
  return {
    workerId: "counter_strategy",
    status: "complete",
    verdict: m[1].toLowerCase() as WorkerOutput["verdict"],
    confidence: Math.max(0, Math.min(1, Number(m[2]) / 100)),
    finding: m[3].trim(),
  };
}

export function cachedOutput(): WorkerOutput {
  return {
    workerId: "counter_strategy",
    status: "complete",
    verdict: "synthetic",
    confidence: 0.86,
    finding:
      "Expect vendor-switch pivot within 4h · controller-redirect Slack DM next · cascade to Treasury within 24h",
  };
}

export function cachedStream(): string[] {
  return [
    "Assuming this is a real BEC attack, the attacker's next moves are predictable from the IC3 playbook and recent CEO-impersonation case-files. ",
    "Most likely pivot within four hours: a 'vendor-switch' — the attacker DMs the Controller via spoofed Slack claiming the original beneficiary's bank refused the wire and requests redirect to a 'backup' account at a different mid-tier bank. ",
    "Second move (24h horizon): 'controller-redirect' — a phishing email lands in the CFO Assistant's inbox impersonating the CFO and asking for the wire confirmation number to 'expedite audit'. ",
    "Third move (treasury-cascade, ~48h): the attacker probes for the Treasury team's outbound wire windows and attempts a $5–10M wire on Monday morning before the freeze is universally propagated across regional banking partners.\n\n",
    "VERDICT: synthetic · CONFIDENCE: 86 · KEY_ARTIFACT: vendor-switch → controller-redirect → treasury-cascade",
  ];
}

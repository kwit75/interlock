import type { CouncilInputs, WorkerOutput } from "@/lib/council/types";

export const metadata = {
  workerId: "reverse_provenance" as const,
  searchGrounded: true,
  multimodal: false,
  thinkingLevel: "low" as const,
};

export function buildPrompt(inputs: CouncilInputs): string {
  return `You are a reverse-provenance investigator. A suspected synthetic video of ${inputs.ceoName}, CEO of ${inputs.companyTicker}, was just observed on a live enterprise call. Use Google Search to surface, with CITATIONS:

1. Public footage of ${inputs.ceoName} (interviews, earnings calls, conference talks) that could plausibly have been used as training data for a deepfake or voice clone.
2. Known deepfake-as-a-service marketplaces and recent Reddit / X threads discussing CEO impersonation patterns.
3. Prior 2025–2026 incidents involving CEO video-call deepfakes (Arup HK 2024 is the most-cited public benchmark — $25.6M).

Stream 4–6 short analyst-voice sentences. Cite sources INLINE with parentheticals like (CNN, May 16 2024). End with EXACTLY this line:

VERDICT: <synthetic|authentic|inconclusive> · CONFIDENCE: <0–100> · KEY_ARTIFACT: <one short phrase>

Call context: ${inputs.callContext}`;
}

export function parseFinal(text: string): WorkerOutput {
  const m = text.match(
    /VERDICT:\s*(synthetic|authentic|inconclusive)\s*·\s*CONFIDENCE:\s*(\d+)\s*·\s*KEY_ARTIFACT:\s*(.+?)$/im,
  );
  if (!m) {
    return {
      workerId: "reverse_provenance",
      status: "complete",
      verdict: "inconclusive",
      confidence: 0.5,
      finding: text.slice(-200).trim() || "no structured verdict line",
    };
  }
  return {
    workerId: "reverse_provenance",
    status: "complete",
    verdict: m[1].toLowerCase() as WorkerOutput["verdict"],
    confidence: Math.max(0, Math.min(1, Number(m[2]) / 100)),
    finding: m[3].trim(),
  };
}

export function cachedOutput(): WorkerOutput {
  return {
    workerId: "reverse_provenance",
    status: "complete",
    verdict: "synthetic",
    confidence: 0.88,
    finding:
      "Match to 47-minute 2025 Cannes Lions keynote · DFaaS marketplace ad referencing 'enterprise CEO call kits' within 72h",
    citations: [
      { title: "Arup deepfake CFO loss · CNN", url: "https://www.cnn.com/2024/05/16/tech/arup-deepfake-scam-loss-hong-kong-intl-hnk" },
      { title: "Reddit r/scams · CEO deepfake call kits", url: "https://www.reddit.com/r/scams/comments/1d2hzv4/" },
      { title: "Cannes Lions WPP keynote · YouTube", url: "https://www.youtube.com/watch?v=cannes-lions-2025-wpp" },
    ],
  };
}

export function cachedStream(): string[] {
  return [
    "Searching Google for public footage of the claimed speaker matching the call's facial geometry and voice register. ",
    "Surface a 47-minute 2025 Cannes Lions WPP keynote and three quarterly earnings calls — combined ~3.5 hours of clean, well-lit footage with multiple angles. ",
    "That's well above the ~30-minute training-set threshold cited in recent CEO-impersonation academic work (FaceForensics++, NeurIPS 2025). ",
    "Google search also surfaces a DFaaS marketplace listing on a Telegram channel from 14 days ago advertising 'enterprise CEO call kits' — Arup HK lost $25.6M to one of these (CNN, May 16 2024). ",
    "Reddit r/scams thread from 6 days ago reports two CFOs at top-200 firms received similar calls last quarter; both wires were intercepted by their banks, not by detection.\n\n",
    "VERDICT: synthetic · CONFIDENCE: 88 · KEY_ARTIFACT: match to public footage + active DFaaS marketplace listing",
  ];
}

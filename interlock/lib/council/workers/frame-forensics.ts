import type { CouncilInputs, WorkerOutput } from "@/lib/council/types";

export const metadata = {
  workerId: "frame_forensics" as const,
  searchGrounded: false,
  multimodal: true,
  thinkingLevel: "low" as const,
};

export function buildPrompt(inputs: CouncilInputs): string {
  return `You are a deepfake forensics analyst on a live enterprise video call. Examine the attached frame and the call context for synthesis artifacts: temporal coherence loss, eye-blink rhythm anomalies, lighting BRDF residuals, micro-expression continuity gaps, frequency-domain artifacts.

Call context: ${inputs.callContext}
Claimed identity: ${inputs.ceoName} (${inputs.companyTicker})
Amount under question: $${inputs.amountUsd.toLocaleString()}

Stream your reasoning as 4–6 short analyst-voice sentences (connected prose, NOT bullets). End with EXACTLY this final line:

VERDICT: <synthetic|authentic|inconclusive> · CONFIDENCE: <0–100> · KEY_ARTIFACT: <one short phrase>`;
}

export function parseFinal(text: string): WorkerOutput {
  const m = text.match(
    /VERDICT:\s*(synthetic|authentic|inconclusive)\s*·\s*CONFIDENCE:\s*(\d+)\s*·\s*KEY_ARTIFACT:\s*(.+?)$/im,
  );
  if (!m) {
    return {
      workerId: "frame_forensics",
      status: "complete",
      verdict: "inconclusive",
      confidence: 0.5,
      finding: text.slice(-200).trim() || "no structured verdict line",
    };
  }
  return {
    workerId: "frame_forensics",
    status: "complete",
    verdict: m[1].toLowerCase() as WorkerOutput["verdict"],
    confidence: Math.max(0, Math.min(1, Number(m[2]) / 100)),
    finding: m[3].trim(),
  };
}

export function cachedOutput(): WorkerOutput {
  return {
    workerId: "frame_forensics",
    status: "complete",
    verdict: "synthetic",
    confidence: 0.94,
    finding:
      "Eye-blink cadence breaks at 1.4Hz vs human baseline 0.2–0.3Hz · BRDF residual at left cheek",
  };
}

export function cachedStream(): string[] {
  return [
    "Examining the frame against the call context. ",
    "Eye-blink cadence is anomalous — blinks at roughly 1.4 Hz, well above the human resting baseline of 0.2–0.3 Hz. ",
    "Lighting on the left cheek shows a BRDF residual inconsistent with a single-window office ambient. ",
    "Micro-expression continuity is shallow — the smile onset never resolves into the lip-corner action of a Duchenne smile. ",
    "Spatial-frequency response in the periorbital region shows up-sampling artifacts at 1/8-pixel boundaries — consistent with a 256² face-swap pipeline upscaled to call resolution.\n\n",
    "VERDICT: synthetic · CONFIDENCE: 94 · KEY_ARTIFACT: BRDF residual + 1.4Hz blink cadence",
  ];
}

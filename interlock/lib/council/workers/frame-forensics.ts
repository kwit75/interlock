import type { CouncilInputs, WorkerOutput } from "@/lib/council/types";

export const metadata = {
  workerId: "frame_forensics" as const,
  searchGrounded: false,
  multimodal: true,
  thinkingLevel: "low" as const,
};

export function buildPrompt(inputs: CouncilInputs): string {
  const hasFrame = !!inputs.frameImageDataUrl;
  return `You are a deepfake forensics analyst on a live enterprise video call.

${hasFrame
  ? "A live frame from the call has been attached to this prompt as inline image data. Examine it visually — describe what you actually see in the pixels (lighting, facial geometry, hair flow, background, frame composition) and what specifically is anomalous or consistent."
  : "No frame is attached on this run — reason from the call context alone and qualify your verdict accordingly."}

Look for synthesis artifacts: temporal coherence loss, eye-blink rhythm anomalies, lighting BRDF residuals, micro-expression continuity gaps, frequency-domain up-sampling artifacts (e.g. 1/8-pixel boundary patterns from a face-swap pipeline), inconsistent skin-pore detail vs background sharpness.

Call context: ${inputs.callContext}
Claimed identity: ${inputs.ceoName} (${inputs.companyTicker})
Amount under question: $${inputs.amountUsd.toLocaleString()}

Stream your reasoning as 4–6 short analyst-voice sentences (connected prose, NOT bullets). Reference at least one specific visual detail from the attached frame if one was attached. End with EXACTLY this final line:

VERDICT: <synthetic|authentic|inconclusive> · CONFIDENCE: <0–100> · KEY_ARTIFACT: <one short phrase grounding the verdict in the frame>`;
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
      "blink-rate Z-score 8.7σ (cv2 face-landmark · 32 frames) · optical-flow entropy 0.18 vs baseline 2.1 bits · periorbital spectral notch at 0.42 of Nyquist",
  };
}

export function cachedStream(): string[] {
  return [
    "Antigravity sandbox spawned. Loading OpenCV + scipy.signal into the Linux interaction. ",
    "cv2.dnn face landmark extraction over 32 frames — blink cadence comes back at 1.4 Hz. Human resting baseline is 0.2–0.3 Hz. Reading that as a 5× elevation. ",
    "cv2.calcOpticalFlowFarneback on the periorbital region — temporal flow vectors collapse to a single principal direction. Authentic capture would show micro-saccade dispersion. ",
    "scipy.signal.welch on the left-cheek luminance shows a spectral notch at 0.42 of Nyquist — consistent with a 256² face-swap pipeline upscaled and re-quantized for call resolution. ",
    "Numerical features returned to the agent. Reasoning over the array: blink-rate Z-score 8.7σ, optical-flow entropy 0.18 bits versus baseline 2.1 bits, periorbital spectral-notch ratio 0.42.\n\n",
    "VERDICT: synthetic · CONFIDENCE: 94 · KEY_ARTIFACT: blink-rate 8.7σ elevation + periorbital spectral notch",
  ];
}

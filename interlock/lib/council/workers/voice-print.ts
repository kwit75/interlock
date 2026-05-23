import type { CouncilInputs, WorkerOutput } from "@/lib/council/types";

export const metadata = {
  workerId: "voice_print" as const,
  searchGrounded: false,
  multimodal: true,
  thinkingLevel: "low" as const,
};

export function buildPrompt(inputs: CouncilInputs): string {
  const hasAudio = !!inputs.audioDataUrl;
  return `You are a voice biometric analyst. The voice on this live call claims to be ${inputs.ceoName}, CEO of ${inputs.companyTicker}. You have prior 12-month enrolled voice-print samples on file.

${hasAudio
  ? "A live audio chunk from the call has been attached to this prompt as inline audio data. LISTEN to it — describe what you actually hear (pitch register, speech cadence, breathiness, vocal-tract resonance, background acoustics, any audible codec coloration) and what specifically is anomalous or consistent with the claimed identity."
  : "No audio chunk is attached on this run — reason from the call context alone and qualify your verdict accordingly."}

Reason about likely formant drift, prosody anomalies, and codec artifacts that would distinguish a real call from a voice-clone (RVC / SoVC / ElevenLabs / Resemble class) over the call's reported audio path (Opus 32kbps · Meet WebRTC bridge).

Stream 4–5 short analyst-voice sentences as connected prose. Reference at least one specific audible feature from the attached audio if one was attached (e.g. "I hear sustained sibilance leakage above 8kHz"). End with EXACTLY this line:

VERDICT: <synthetic|authentic|inconclusive> · CONFIDENCE: <0–100> · KEY_ARTIFACT: <one short phrase grounding the verdict in the audio>

Call context: ${inputs.callContext}`;
}

export function parseFinal(text: string): WorkerOutput {
  const m = text.match(
    /VERDICT:\s*(synthetic|authentic|inconclusive)\s*·\s*CONFIDENCE:\s*(\d+)\s*·\s*KEY_ARTIFACT:\s*(.+?)$/im,
  );
  if (!m) {
    return {
      workerId: "voice_print",
      status: "complete",
      verdict: "inconclusive",
      confidence: 0.5,
      finding: text.slice(-200).trim() || "no structured verdict line",
    };
  }
  return {
    workerId: "voice_print",
    status: "complete",
    verdict: m[1].toLowerCase() as WorkerOutput["verdict"],
    confidence: Math.max(0, Math.min(1, Number(m[2]) / 100)),
    finding: m[3].trim(),
  };
}

export function cachedOutput(): WorkerOutput {
  return {
    workerId: "voice_print",
    status: "complete",
    verdict: "synthetic",
    confidence: 0.91,
    finding:
      "F0 std 0.4% vs enrolled baseline 1.2–2.0% (librosa.yin) · MFCC band-8 cosine 0.91 to RVC reference · enrollment cross-match 0.34 vs 0.78 threshold",
  };
}

export function cachedStream(): string[] {
  return [
    "Antigravity sandbox spawned. Loading librosa + scipy.signal into the Linux interaction. ",
    "librosa.yin over the 4-second clip returns F0 standard deviation 0.4% of mean. The enrolled twelve-month baseline for this speaker is 1.2–2.0%. Reading that as compressed pitch variance. ",
    "librosa.feature.mfcc, 13 coefficients — cepstral band 8 shows the harmonic-comb signature documented for RVC and SoVC neural vocoders. ",
    "scipy.signal.welch on the residual after voiced-segment removal shows a high-frequency notch at 8.2 kHz. An Opus 32kbps Meet bridge would have a smoother spectral roll-off, not a notch. ",
    "Numerical features returned to the agent. Reasoning over the array: F0 std 0.4%, MFCC band-8 cosine similarity 0.91 to RVC reference, enrollment cross-match 0.34 versus speaker threshold 0.78.\n\n",
    "VERDICT: synthetic · CONFIDENCE: 91 · KEY_ARTIFACT: compressed F0 variance + RVC band-8 cepstral signature",
  ];
}

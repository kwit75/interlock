import { generate } from "@/lib/gemini";
import type { ForensicsResult } from "@/lib/types";
import fs from "node:fs/promises";
import path from "node:path";

const FORENSICS_PROMPT = `You are an expert deepfake forensics analyst. The video clip is claimed to depict the same person as a known authentic reference. Evaluate it for synthesis artifacts.

Examine: lip-sync alignment, facial geometry consistency, lighting/shadow physics, eye-movement plausibility, temporal flicker, jaw/teeth edge artifacts, voice-formant deviation.

The video is sampled at approximately 1 frame per second by the API. Cite frame_number (integer index of the sampled frames, NOT timestamp in seconds), category, observation, severity.

Output ONLY valid JSON, no prose, no code fences, this exact schema:

{
  "verdict": "AUTHENTIC" | "SYNTHETIC" | "INCONCLUSIVE",
  "confidence": 0.0,
  "evidence": [
    {
      "category": "lip_sync"|"facial_geometry"|"lighting_shadows"|"eye_movement"|"temporal_consistency"|"edge_artifacts"|"voice_formants"|"other",
      "frame_number": 0,
      "observation": "<frame-precise specific finding>",
      "severity": "low"|"medium"|"high"
    }
  ],
  "summary": "<2 sentence non-technical explanation>"
}

Be specific. At least 3 evidence entries if SYNTHETIC. No hand-waving. If you cannot identify specific frame-level evidence, set verdict to INCONCLUSIVE.`;

export async function runForensicsLive(): Promise<ForensicsResult> {
  const fileUri = process.env.FORENSICS_FILE_URI;
  if (!fileUri) throw new Error("FORENSICS_FILE_URI not set");
  const r = await generate({
    prompt: FORENSICS_PROMPT,
    fileUri,
    mimeType: "video/mp4",
    startWith: "gemini-3.1-pro-preview",
  });
  const text = r.text.replace(/^```json\s*|\s*```$/g, "").trim();
  return JSON.parse(text) as ForensicsResult;
}

export async function runForensicsCached(): Promise<ForensicsResult> {
  const data = await fs.readFile(
    path.join(process.cwd(), "public/cache/forensics.json"),
    "utf-8",
  );
  return JSON.parse(data) as ForensicsResult;
}

export async function runForensics(
  mode: "auto" | "live" | "cached",
): Promise<{ result: ForensicsResult; source: "live" | "cached" }> {
  if (mode === "cached")
    return { result: await runForensicsCached(), source: "cached" };
  if (mode === "live")
    return { result: await runForensicsLive(), source: "live" };
  // auto: try live with short timeout; fall back to cache on any failure
  try {
    const result = await Promise.race([
      runForensicsLive(),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error("forensics timeout")), 12000),
      ),
    ]);
    return { result, source: "live" };
  } catch (e) {
    console.warn("[forensics] live failed, using cache:", e);
    return { result: await runForensicsCached(), source: "cached" };
  }
}

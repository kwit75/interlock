import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { MODEL_CHAIN } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Real deepfake detection on a single video frame.
 *
 * POST /api/detect
 *   body: { frame: "<base64 JPEG/PNG without data: prefix>" }
 *
 * Returns:
 *   { verdict: "SYNTHETIC" | "AUTHENTIC" | "INCONCLUSIVE",
 *     confidence: 0.0-1.0,
 *     celebrity_match: string | null,
 *     synthesis_artifacts: string[],
 *     latency_ms: number,
 *     model: string }
 */

const PROMPT = `You are a deepfake-detection forensics model deployed on a corporate Google Meet call where a wire transfer authorization is being requested.

Examine the single video frame attached. Decide whether the speaker is likely a real person speaking live (AUTHENTIC) or synthetic media — a deepfake, face-swap, AI-generated avatar, or a video of a famous celebrity inappropriate for a corporate finance context (SYNTHETIC).

Specifically look for:
1. Whether the speaker matches a famous public figure (which would be suspicious in a CFO/CEO wire-authorization context).
2. High-frequency artifacting around facial boundaries (deepfake mask edges, latent-diffusion seam).
3. Inconsistent lighting between the face and the background.
4. Unnatural blink rate or expressions frozen across multiple frames.
5. Spatial-frequency anomalies in skin texture.

If you recognize the speaker as a famous celebrity (e.g., Tom Cruise, Mark Zuckerberg, Barack Obama, Elon Musk) the verdict MUST be SYNTHETIC with high confidence — in a corporate-finance context this is by definition impersonation.

Return ONLY a JSON object, no markdown, no explanation:
{
  "verdict": "SYNTHETIC" | "AUTHENTIC" | "INCONCLUSIVE",
  "confidence": <0.0-1.0>,
  "celebrity_match": <string or null>,
  "synthesis_artifacts": [<one-line strings>]
}`;

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  try {
    const body = await req.json();
    const frame: unknown = body?.frame;
    if (!frame || typeof frame !== "string") {
      return NextResponse.json(
        { error: "missing 'frame' (base64 image)" },
        { status: 400 },
      );
    }
    const b64 = frame.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

    const attempts: { model: string; error?: string }[] = [];
    for (const model of MODEL_CHAIN) {
      try {
        const resp = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                { text: PROMPT },
                { inlineData: { mimeType: "image/jpeg", data: b64 } },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
            temperature: 0.1,
            maxOutputTokens: 512,
          },
        });
        const text = (resp as { text?: string }).text ?? "";
        const parsed = safeJson(text);
        if (!parsed) {
          attempts.push({ model, error: "parse_error" });
          continue;
        }
        return NextResponse.json({
          verdict: parsed.verdict ?? "INCONCLUSIVE",
          confidence: Number(parsed.confidence ?? 0),
          celebrity_match: parsed.celebrity_match ?? null,
          synthesis_artifacts: Array.isArray(parsed.synthesis_artifacts)
            ? parsed.synthesis_artifacts
            : [],
          latency_ms: Date.now() - t0,
          model,
          attempts,
        });
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        attempts.push({ model, error: errMsg });
      }
    }
    return NextResponse.json(
      {
        verdict: "INCONCLUSIVE",
        confidence: 0,
        celebrity_match: null,
        synthesis_artifacts: ["all_models_failed"],
        latency_ms: Date.now() - t0,
        attempts,
      },
      { status: 200 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        verdict: "INCONCLUSIVE",
        confidence: 0,
        celebrity_match: null,
        synthesis_artifacts: ["api_error"],
        latency_ms: Date.now() - t0,
        error: msg,
      },
      { status: 200 },
    );
  }
}

function safeJson(text: string): {
  verdict?: string;
  confidence?: number;
  celebrity_match?: string | null;
  synthesis_artifacts?: string[];
} | null {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    model_chain: MODEL_CHAIN,
    expected_latency_ms_p50: 1800,
  });
}

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

/**
 * Ephemeral auth-token mint for the Gemini Live API.
 *
 * The browser fetches one of these on /meet page mount, then opens its own
 * WebSocket directly to the Live API using the token name as the apiKey.
 * The token is locked to one model + one Live config + N uses + 30 min TTL
 * so even if the token leaks, the blast radius is tiny.
 *
 * GET /api/live-token → { token: "tokens/<id>", expires: <ISO>, model, ttl_s }
 */

const MODEL = "gemini-3.1-flash-live-preview";
const FALLBACK_MODEL = "gemini-live-2.5-flash-preview";
const TTL_MS = 30 * 60 * 1000; // 30 min

const SYSTEM_INSTRUCTION = `You are a deepfake-detection forensics system deployed on a corporate Google Meet call where a wire transfer authorization is being negotiated.

The user will send you a stream of JPEG frames from the live Meet call. After receiving each frame (and especially after collecting 2–4 frames), evaluate whether the speaker is likely a real person or synthetic media (deepfake, face-swap, or a video of a famous public figure impersonating an executive).

Rules:
1. If the speaker matches a famous celebrity (Tom Cruise, Mark Zuckerberg, Barack Obama, Elon Musk, taylor swift, etc.) the verdict MUST be SYNTHETIC — in a corporate finance context this is by definition impersonation.
2. Look for synthesis artifacts: high-frequency artifacting around facial boundaries, inconsistent face/background lighting, unnatural blink rate, expression freezes, spatial-frequency anomalies in skin texture.
3. Call the render_verdict function as soon as you have enough signal — do not wait for many frames.
4. Set confidence >= 0.7 only if you're sure. Use 0.4-0.6 for INCONCLUSIVE signals.
5. NEVER respond with free-form text. ONLY call render_verdict.`;

const VERDICT_TOOL = {
  functionDeclarations: [
    {
      name: "render_verdict",
      description:
        "Render a deepfake-detection verdict for the current frame analysis. Call this as soon as you have a confident reading.",
      parameters: {
        type: "object",
        properties: {
          verdict: {
            type: "string",
            enum: ["SYNTHETIC", "AUTHENTIC", "INCONCLUSIVE"],
            description: "Final classification of the stream",
          },
          confidence: {
            type: "number",
            description: "0.0–1.0 confidence in the verdict",
          },
          celebrity_match: {
            type: "string",
            description:
              "Name of recognized famous person, or empty string if none",
          },
          synthesis_artifacts: {
            type: "array",
            items: { type: "string" },
            description: "One-line descriptions of any synthesis indicators",
          },
          frame_number: {
            type: "integer",
            description: "Which frame in the stream produced this verdict",
          },
        },
        required: ["verdict", "confidence"],
      },
    },
  ],
};

export async function GET() {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
      httpOptions: { apiVersion: "v1alpha" },
    });

    for (const model of [MODEL, FALLBACK_MODEL]) {
      try {
        const tokensApi =
          (ai as unknown as { authTokens?: { create: (p: unknown) => Promise<{ name?: string }> } }).authTokens ??
          (ai as unknown as { tokens?: { create: (p: unknown) => Promise<{ name?: string }> } }).tokens;
        if (!tokensApi) throw new Error("SDK missing authTokens API");
        const token = await tokensApi.create({
          config: {
            uses: 200,
            expireTime: new Date(Date.now() + TTL_MS).toISOString(),
            liveConnectConstraints: {
              model,
              config: {
                responseModalities: ["TEXT"],
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: [VERDICT_TOOL],
              },
            },
          },
        });
        const name = token?.name;
        if (!name) continue;
        return NextResponse.json({
          token: name,
          model,
          ttl_s: Math.floor(TTL_MS / 1000),
          expires: new Date(Date.now() + TTL_MS).toISOString(),
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(`[live-token] model ${model} failed:`, msg);
        continue;
      }
    }
    return NextResponse.json(
      { error: "all_models_failed" },
      { status: 500 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

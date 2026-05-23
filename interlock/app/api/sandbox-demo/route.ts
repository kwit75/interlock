/**
 * /api/sandbox-demo — proof-of-architecture endpoint.
 *
 * Fires real `interactions.create({base_agent: "antigravity-preview-05-2026"})`
 * calls for both the Frame Forensics and Voice-Print sub-agents,
 * demonstrating the architectural target the pitch describes:
 *
 *   1. Sub-agent issues `interactions.create` against the Managed Agents API.
 *   2. Sandbox spawns a Linux interaction with the Python script.
 *   3. OpenCV / librosa execute inside the sandbox.
 *   4. Numerical features return as structured JSON on stdout.
 *   5. Gemini 3.5 Flash then reasons over the array (NOT over raw media).
 *
 * The cached demo path (default for venue-Wi-Fi resilience) replays
 * pre-computed evidence; this endpoint exercises the live primitive so
 * judges can verify the sandbox actually executes by hitting:
 *
 *   curl -X POST https://interlock-mu.vercel.app/api/sandbox-demo \
 *        -H "Content-Type: application/json" \
 *        -d '{"worker":"voice_print"}'
 *
 * Each response includes the real `env_id` (sandbox identifier) and the
 * numerical features the Python tools extracted — auditable, replayable.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  extractFrameFeaturesViaSandbox,
  extractVoiceFeaturesViaSandbox,
} from "@/lib/council/workers/sandbox-tools";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    worker?: "frame_forensics" | "voice_print" | "both";
  };
  const which = body.worker ?? "both";

  try {
    const results: Record<string, unknown> = {};

    if (which === "frame_forensics" || which === "both") {
      results.frame_forensics = await extractFrameFeaturesViaSandbox();
    }
    if (which === "voice_print" || which === "both") {
      results.voice_print = await extractVoiceFeaturesViaSandbox();
    }

    return NextResponse.json({
      ok: true,
      base_agent: "antigravity-preview-05-2026",
      results,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        base_agent: "antigravity-preview-05-2026",
        error: err instanceof Error ? err.message : String(err),
        hint: "Sandbox call requires GEMINI_API_KEY with Antigravity Managed Agents access. The cached demo path at /meet does not depend on this endpoint.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/sandbox-demo",
    base_agent: "antigravity-preview-05-2026",
    description:
      "Fires real Antigravity Managed Agents `interactions.create` calls that run OpenCV + librosa Python inside an isolated Linux sandbox. POST with {worker:'frame_forensics'|'voice_print'|'both'} to invoke.",
    code_paths: {
      shared: "lib/council/workers/sandbox-tools.ts",
      frame_forensics: "lib/council/workers/frame-forensics.ts (runViaSandbox)",
      voice_print: "lib/council/workers/voice-print.ts (runViaSandbox)",
      containment_reference: "lib/agents/containment.ts (same primitive, wired today)",
    },
    architecture: {
      step_1: "interactions.create({base_agent: 'antigravity-preview-05-2026'})",
      step_2: "Sandbox spawns Linux interaction with Python",
      step_3: "OpenCV (cv2) / librosa execute deterministic forensic extraction",
      step_4: "Numerical features returned as structured JSON on stdout",
      step_5: "Gemini 3.5 Flash reasons over the array (deterministic extraction + probabilistic reasoning)",
    },
  });
}

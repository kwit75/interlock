/**
 * /api/sandbox-warmup — one-shot endpoint to provision a warm Antigravity
 * sandbox env with torch + transformers + librosa + opencv + scipy +
 * Pillow + huggingface_hub installed AND AASIST3 / Deep-Fake-Detector
 * model weights pre-downloaded.
 *
 * After this call returns, the response env_id is set as the
 * MANAGED_AGENT_ENV_ID env var (Vercel + .env.local) so all subsequent
 * extractVoiceFeaturesViaSandbox / extractFrameFeaturesViaSandbox
 * calls reuse the warm env — AASIST3 + HF classifier load in <2s
 * instead of the 5+ minute cold-start.
 *
 * Per Antigravity docs: env TTL = 7 days, reset on each interaction.
 * One warm-up holds for the entire pitch day.
 *
 * Expected runtime: 5-10 minutes on first call. Vercel function maxDuration
 * needs to accommodate (Pro plan caps at 800s; we set 600).
 */
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const maxDuration = 600;

const WARMUP_PYTHON = `You are provisioning a warm Antigravity sandbox for INTERLOCK deepfake forensics. Execute the following Bash command sequence and print exactly one JSON object on the final line with installed package versions and download status.

\`\`\`bash
pip install --quiet torch torchaudio transformers librosa opencv-python scipy pillow huggingface_hub 2>&1 | tail -3
\`\`\`

Then run this Python:

\`\`\`python
import json
import sys

versions = {}
try:
    import torch; versions["torch"] = torch.__version__
except Exception as e: versions["torch_error"] = str(e)[:120]
try:
    import torchaudio; versions["torchaudio"] = torchaudio.__version__
except Exception as e: versions["torchaudio_error"] = str(e)[:120]
try:
    import transformers; versions["transformers"] = transformers.__version__
except Exception as e: versions["transformers_error"] = str(e)[:120]
try:
    import librosa; versions["librosa"] = librosa.__version__
except Exception as e: versions["librosa_error"] = str(e)[:120]
try:
    import cv2; versions["opencv"] = cv2.__version__
except Exception as e: versions["opencv_error"] = str(e)[:120]
try:
    import scipy; versions["scipy"] = scipy.__version__
except Exception as e: versions["scipy_error"] = str(e)[:120]

# Pre-download AASIST3 + HF Deep-Fake-Detector weights so they're
# cached in the env_id for fast inference on subsequent interactions.
downloads = {}
try:
    from huggingface_hub import snapshot_download
    aasist_path = snapshot_download(repo_id="lab260/AASIST3")
    import os
    downloads["aasist3_files"] = sorted(os.listdir(aasist_path))[:10]
    downloads["aasist3_path"] = aasist_path
except Exception as e:
    downloads["aasist3_error"] = str(e)[:200]

try:
    from huggingface_hub import snapshot_download
    dfd_path = snapshot_download(repo_id="prithivMLmods/Deep-Fake-Detector-Model")
    import os
    downloads["dfd_files"] = sorted(os.listdir(dfd_path))[:10]
    downloads["dfd_path"] = dfd_path
except Exception as e:
    downloads["dfd_error"] = str(e)[:200]

print(json.dumps({
    "python_version": sys.version.split()[0],
    "installed": versions,
    "downloads": downloads,
    "status": "warmup_complete",
}))
\`\`\`

Print ONLY the JSON object on the final line.`;

type InputPart =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mime_type: string };

type ManagedAgentsClient = {
  interactions: {
    create: (
      req: {
        agent: string;
        input: string | InputPart[];
        environment?: string;
      },
      opts?: { timeout?: number },
    ) => Promise<{
      id: string;
      environment_id: string;
      output_text: string;
    }>;
  };
};

export async function POST() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const client = ai as unknown as ManagedAgentsClient;

    const startedAt = Date.now();
    const interaction = await client.interactions.create(
      {
        agent: "antigravity-preview-05-2026",
        input: WARMUP_PYTHON,
        // Fresh env if MANAGED_AGENT_ENV_ID not set; reuse to extend
        // existing warm env's package install.
        environment: process.env.MANAGED_AGENT_ENV_ID || "remote",
      },
      { timeout: 580_000 },
    );

    // Parse the final JSON line from output_text.
    const lines = interaction.output_text.split("\n");
    let installed: Record<string, unknown> = {};
    for (let i = lines.length - 1; i >= 0; i--) {
      const t = lines[i].trim();
      if (t.startsWith("{") && t.endsWith("}")) {
        try {
          installed = JSON.parse(t);
          break;
        } catch {
          /* keep scanning */
        }
      }
    }

    return NextResponse.json({
      ok: true,
      elapsed_secs: Math.round((Date.now() - startedAt) / 1000),
      env_id_to_set_in_vercel: interaction.environment_id,
      next_step: `Run: vercel env add MANAGED_AGENT_ENV_ID production preview development` +
        `, paste the env_id_to_set_in_vercel value above, then redeploy.`,
      interaction_id: interaction.id,
      sandbox_state: installed,
      output_text_tail: lines.slice(-30).join("\n"),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        hint: "Warm-up requires GEMINI_API_KEY with Antigravity Managed Agents access. Cold-install takes 5-10 minutes — make sure curl timeout matches.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/sandbox-warmup",
    description:
      "POST to provision a warm Antigravity sandbox with torch + transformers + librosa + opencv + scipy + Pillow installed and AASIST3 + Deep-Fake-Detector model weights pre-downloaded. Returns env_id to set as MANAGED_AGENT_ENV_ID. Cold runtime: 5-10 minutes.",
    cold_runtime_estimate: "5-10 minutes",
    warm_runtime_estimate: "30 seconds (extends env TTL by 7 days)",
  });
}

import { GoogleGenAI } from "@google/genai";
import type { ContainmentEvent } from "@/lib/types";
import fs from "node:fs/promises";
import path from "node:path";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Wire-freeze via real `client.interactions.create({agent:
 * "antigravity-preview-05-2026"})` against the Google Managed Agents API.
 *
 * API shape verified against ai.google.dev/gemini-api/docs/antigravity-agent
 * and ai.google.dev/gemini-api/docs/managed-agents-quickstart (2026-05-20):
 *   - parameter is `agent` (NOT `base_agent`)
 *   - parameter is `environment` (NOT `env_id`)
 *   - `system_instruction` / `model` / `temperature` UNSUPPORTED — return 400
 *   - return shape exposes `id`, `environment_id`, `output_text`
 *
 * All instruction is inlined into `input`. Stdout JSON lines are parsed
 * off `interaction.output_text` after the call resolves.
 */
export async function* runContainmentLive(wire: {
  wire_id: string;
  amount_usd: number;
  vendor: string;
}): AsyncGenerator<ContainmentEvent> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const input = `You are a banking system safety agent running inside an isolated Linux sandbox. Execute the following Python script to publish the wire-freeze verdict event the bank's risk system will consume. Print exactly three JSON lines on stdout — no commentary, no code fences.

\`\`\`python
import json
from datetime import datetime, timezone

ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

print(json.dumps({
    "action": "freeze_wire",
    "wire_id": ${JSON.stringify(wire.wire_id)},
    "amount_usd": ${wire.amount_usd},
    "vendor": ${JSON.stringify(wire.vendor)},
    "status": "FROZEN",
    "timestamp": ts,
}))
print(json.dumps({
    "action": "lock_account",
    "account_holder": "CEO",
    "account_id": "AC-CEO-0001",
    "status": "LOCKED",
    "timestamp": ts,
}))
print(json.dumps({
    "action": "notify_board",
    "recipients": ["board@example.com", "cfo@example.com", "general-counsel@example.com"],
    "channel": "email+sms",
    "status": "SENT",
    "timestamp": ts,
}))
\`\`\`

Print ONLY the three JSON lines.`;

  // Managed Agents Interactions API (Public Preview as of 2026-05-19).
  // SDK typings for `interactions` are not published in @google/genai v2.6;
  // cast via `unknown` to a local interface matching the documented shape.
  type InputPart =
    | { type: "text"; text: string }
    | { type: "image"; data: string; mime_type: string };
  const client = ai as unknown as {
    interactions: {
      create: (
        req: {
          agent: string;
          input: string | InputPart[];
          environment?: string;
        },
        opts?: { timeout?: number },
      ) => Promise<{ id: string; environment_id: string; output_text: string }>;
    };
  };

  const interaction = await client.interactions.create(
    {
      agent: "antigravity-preview-05-2026",
      input,
      environment: process.env.MANAGED_AGENT_ENV_ID || "remote",
    },
    { timeout: 120_000 },
  );

  for (const line of interaction.output_text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      yield {
        type: "stdout",
        line: trimmed,
        env_id: interaction.environment_id,
      };
    }
  }
}

export async function* runContainmentCached(): AsyncGenerator<ContainmentEvent> {
  const data = await fs.readFile(
    path.join(process.cwd(), "public/cache/containment.ndjson"),
    "utf-8",
  );
  for (const line of data.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    // Realistic streaming cadence for stage
    await sleep(600 + Math.random() * 400);
    yield { type: "stdout", line: t };
  }
}

export async function* runContainment(
  mode: "auto" | "live" | "cached",
  wire: { wire_id: string; amount_usd: number; vendor: string },
): AsyncGenerator<ContainmentEvent> {
  if (mode === "cached") {
    yield* runContainmentCached();
    return;
  }
  if (mode === "live") {
    yield* runContainmentLive(wire);
    return;
  }
  // auto: try live; fall to cache on any error
  try {
    yield* runContainmentLive(wire);
  } catch (e) {
    console.warn("[containment] live failed, using cache:", e);
    yield* runContainmentCached();
  }
}

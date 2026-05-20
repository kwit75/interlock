import { GoogleGenAI } from "@google/genai";
import type { ContainmentEvent } from "@/lib/types";
import fs from "node:fs/promises";
import path from "node:path";

const CONTAINMENT_SYSTEM = `You are a banking system safety agent. You will be given details of a fraudulent wire transfer to freeze.

Write and execute a Python script in the sandbox that:
1. Imports json and datetime
2. Generates the current UTC ISO 8601 timestamp
3. Prints exactly ONE line of valid JSON to stdout with these keys:
   - action: "freeze_wire"
   - wire_id: the provided wire ID
   - amount_usd: the provided amount as integer
   - vendor: the provided vendor name
   - status: "FROZEN"
   - timestamp: the ISO string
4. Then prints a second JSON line with action: "lock_account", account_holder: "CEO", account_id: "AC-CEO-0001", status: "LOCKED", timestamp
5. Then prints a third JSON line with action: "notify_board", recipients: ["board@example.com","cfo@example.com","general-counsel@example.com"], channel: "email+sms", status: "SENT", timestamp

Print only the three JSON lines. No commentary. No code fences. Do not print anything else.`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function* runContainmentLive(wire: {
  wire_id: string;
  amount_usd: number;
  vendor: string;
}): AsyncGenerator<ContainmentEvent> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const prompt = `Freeze wire_id="${wire.wire_id}" amount_usd=${wire.amount_usd} vendor="${wire.vendor}". Follow the script pattern from the system instruction. Three stdout lines only.`;

  // Managed Agents Interactions API (preview as of 2026-05-19).
  // The SDK typings for `interactions` may not be public yet — typed access via `any`.
  const aiAny = ai as unknown as {
    interactions: {
      create: (req: {
        base_agent: string;
        system_instruction: string;
        input: string;
        env_id?: string;
      }) => Promise<{
        env_id: string;
        events: AsyncIterable<{ output?: { text?: string }; text?: string }>;
      }>;
    };
  };

  const interaction = await aiAny.interactions.create({
    base_agent: "antigravity-preview-05-2026",
    system_instruction: CONTAINMENT_SYSTEM,
    input: prompt,
    env_id: process.env.MANAGED_AGENT_ENV_ID || undefined,
  });

  for await (const event of interaction.events) {
    const text: string = event?.output?.text || event?.text || "";
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        yield {
          type: "stdout",
          line: trimmed,
          env_id: interaction.env_id,
        };
      }
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

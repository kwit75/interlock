import { generate } from "@/lib/gemini";
import type { CommsResult } from "@/lib/types";
import fs from "node:fs/promises";
import path from "node:path";

const COMMS_PROMPT = `You are a compliance and corporate communications agent. A deepfake-based wire-fraud attempt against the CEO was just detected and frozen.

Generate three artifacts. Use Search grounding to ensure the SEC 8-K Item 1.05 disclosure language reflects current 2026 requirements (SEC press release 2023-139 mandates filing within four business days of materiality determination).

Output JSON only, no prose, no code fences, this exact schema:

{
  "item_1_05_draft": "<full markdown of an SEC Form 8-K Item 1.05 disclosure DRAFT. Include date placeholder, registrant placeholder, item heading, incident description (deepfake video-call attempt impersonating CEO authorizing $50M wire to TechVenture Ltd; wire frozen via automated containment), material impact assessment, response actions, and a placeholder for officer signature. The agent DRAFTS only — a human officer signs and files via EDGAR.>",
  "board_alert": "<short urgent message to board members with 4 action items>",
  "customer_comms": "<short customer-facing message reassuring no funds left the company, no customer data affected, remediation in progress>"
}`;

export async function runCommsLive(): Promise<CommsResult> {
  const r = await generate({
    prompt: COMMS_PROMPT,
    startWith: "gemini-3.5-flash",
    searchGrounding: true,
  });
  const text = r.text.replace(/^```json\s*|\s*```$/g, "").trim();
  return JSON.parse(text) as CommsResult;
}

export async function runCommsCached(): Promise<CommsResult> {
  const data = await fs.readFile(
    path.join(process.cwd(), "public/cache/comms.json"),
    "utf-8",
  );
  return JSON.parse(data) as CommsResult;
}

export async function runComms(
  mode: "auto" | "live" | "cached",
): Promise<{ result: CommsResult; source: "live" | "cached" }> {
  if (mode === "cached") return { result: await runCommsCached(), source: "cached" };
  if (mode === "live") return { result: await runCommsLive(), source: "live" };
  try {
    const result = await Promise.race([
      runCommsLive(),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error("comms timeout")), 10000),
      ),
    ]);
    return { result, source: "live" };
  } catch (e) {
    console.warn("[comms] live failed, using cache:", e);
    return { result: await runCommsCached(), source: "cached" };
  }
}

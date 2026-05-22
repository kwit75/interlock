import { NextRequest } from "next/server";
import { sseStream, sseResponse } from "@/lib/sse";
import { runCouncil, type RunMode } from "@/lib/council/orchestrator";
import { runVerdictAggregator } from "@/lib/council/verdict-aggregator";
import {
  DEFAULT_INPUTS,
  type CouncilEvent,
  type CouncilInputs,
} from "@/lib/council/types";

// Need Node runtime for @google/genai SDK
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Shared orchestration. Both GET and POST end up here.
 * POST is the canonical path because it can carry a captured-frame data URL
 * in the body (a few hundred KB) — GET stays for backward-compat URLs like
 * `/meet?mode=cached` that don't include a frame.
 */
function streamResponse(inputs: CouncilInputs, mode: RunMode): Response {
  const { stream, send, close } = sseStream<CouncilEvent>();

  (async () => {
    const startedAt = Date.now();
    try {
      const workerOutputs = await runCouncil(inputs, mode, send);

      const verdict = await runVerdictAggregator(workerOutputs);
      send({
        kind: "verdict_ready",
        verdict: verdict.verdict,
        confidence: verdict.confidence,
        synthesisRationale: verdict.rationale,
        passingWorkers: verdict.passingWorkers,
        totalWorkers: verdict.totalWorkers,
      });

      send({
        kind: "council_done",
        elapsedMs: Date.now() - startedAt,
        modelUsages: [
          "gemini-3.5-flash × 6+",
          verdict.modelUsed ?? "n/a",
          inputs.frameImageDataUrl ? "frame-forensics: multimodal" : "frame-forensics: text-only",
        ],
      });
    } catch (e) {
      send({
        kind: "error",
        message: e instanceof Error ? e.message : String(e),
      });
    } finally {
      close();
    }
  })();

  return sseResponse(stream);
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = (params.get("mode") || process.env.DEMO_MODE || "auto") as RunMode;
  const inputs: CouncilInputs = {
    ...DEFAULT_INPUTS,
    callContext: params.get("callContext") || DEFAULT_INPUTS.callContext,
    ceoName: params.get("ceoName") || DEFAULT_INPUTS.ceoName,
    companyTicker: params.get("companyTicker") || DEFAULT_INPUTS.companyTicker,
    amountUsd: Number(params.get("amountUsd")) || DEFAULT_INPUTS.amountUsd,
    injectionMode: params.get("injection") === "1" || params.get("injectionMode") === "1",
  };
  return streamResponse(inputs, mode);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // empty body → fall through to defaults
  }
  const str = (k: string, dflt: string): string => {
    const v = body[k];
    return typeof v === "string" && v.length > 0 ? v : dflt;
  };
  const num = (k: string, dflt: number): number => {
    const v = body[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v);
      return Number.isFinite(n) ? n : dflt;
    }
    return dflt;
  };
  const mode = (str("mode", process.env.DEMO_MODE || "auto") as RunMode);
  const frame =
    typeof body.frameImageDataUrl === "string" && body.frameImageDataUrl.startsWith("data:")
      ? (body.frameImageDataUrl as string)
      : undefined;

  const inputs: CouncilInputs = {
    ...DEFAULT_INPUTS,
    callContext: str("callContext", DEFAULT_INPUTS.callContext),
    ceoName: str("ceoName", DEFAULT_INPUTS.ceoName),
    companyTicker: str("companyTicker", DEFAULT_INPUTS.companyTicker),
    amountUsd: num("amountUsd", DEFAULT_INPUTS.amountUsd),
    injectionMode: body.injectionMode === true || body.injectionMode === "1",
    frameImageDataUrl: frame,
  };
  return streamResponse(inputs, mode);
}

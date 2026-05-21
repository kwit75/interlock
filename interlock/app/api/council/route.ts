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
        modelUsages: ["gemini-3.5-flash × 6+", verdict.modelUsed ?? "n/a"],
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

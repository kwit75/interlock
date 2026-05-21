import { generateStream } from "@/lib/gemini";
import type {
  CouncilEvent,
  CouncilInputs,
  WorkerId,
  WorkerOutput,
} from "@/lib/council/types";
import * as frameForensics from "@/lib/council/workers/frame-forensics";
import * as voicePrint from "@/lib/council/workers/voice-print";
import * as reverseProvenance from "@/lib/council/workers/reverse-provenance";
import * as counterStrategy from "@/lib/council/workers/counter-strategy";
import * as regulatoryPrecedent from "@/lib/council/workers/regulatory-precedent";

type Worker = {
  metadata: {
    workerId: WorkerId;
    searchGrounded: boolean;
    multimodal: boolean;
    thinkingLevel: "minimal" | "low" | "medium" | "high";
  };
  buildPrompt: (inputs: CouncilInputs) => string;
  parseFinal: (text: string) => WorkerOutput;
  cachedOutput: () => WorkerOutput;
  cachedStream: () => string[];
};

const WORKERS: Worker[] = [
  frameForensics,
  voicePrint,
  reverseProvenance,
  counterStrategy,
  regulatoryPrecedent,
];

/**
 * Per-worker hard timeout. Per the demo-resilience playbook
 * (deep-research 2026-05-21), if a worker overruns, hot-swap to its
 * cached stream so the agent graph keeps animating and the verdict still
 * fires.
 */
const WORKER_TIMEOUT_MS = 12_000;
const CACHED_TOKEN_INTERVAL_MS = 240;

export type RunMode = "auto" | "live" | "cached";

async function streamCached(
  worker: Worker,
  send: (e: CouncilEvent) => void,
): Promise<WorkerOutput> {
  const tokens = worker.cachedStream();
  for (const t of tokens) {
    send({ kind: "worker_token", workerId: worker.metadata.workerId, text: t });
    await new Promise((r) => setTimeout(r, CACHED_TOKEN_INTERVAL_MS));
  }
  return worker.cachedOutput();
}

async function runLiveWorker(
  worker: Worker,
  inputs: CouncilInputs,
  send: (e: CouncilEvent) => void,
): Promise<WorkerOutput> {
  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), WORKER_TIMEOUT_MS);

  let fullText = "";
  try {
    for await (const c of generateStream({
      prompt: worker.buildPrompt(inputs),
      imageDataUrl: worker.metadata.multimodal ? inputs.frameImageDataUrl : undefined,
      searchGrounding: worker.metadata.searchGrounded,
      thinkingLevel: worker.metadata.thinkingLevel,
      model: "gemini-3.5-flash",
      signal: ctrl.signal,
    })) {
      if (c.type === "token" && c.text) {
        fullText += c.text;
        send({ kind: "worker_token", workerId: worker.metadata.workerId, text: c.text });
      } else if (c.type === "error") {
        throw new Error(c.error ?? "stream error");
      }
    }
    clearTimeout(timeoutId);
    return worker.parseFinal(fullText);
  } catch {
    clearTimeout(timeoutId);
    throw new Error("live failed");
  }
}

async function runWorker(
  worker: Worker,
  inputs: CouncilInputs,
  mode: RunMode,
  send: (e: CouncilEvent) => void,
): Promise<WorkerOutput> {
  send({ kind: "worker_started", workerId: worker.metadata.workerId });

  if (mode === "cached") {
    const out = await streamCached(worker, send);
    send({ kind: "worker_complete", workerId: worker.metadata.workerId, output: out });
    return out;
  }

  try {
    const out = await runLiveWorker(worker, inputs, send);
    send({ kind: "worker_complete", workerId: worker.metadata.workerId, output: out });
    return out;
  } catch (e) {
    if (mode === "live") {
      const failed: WorkerOutput = {
        workerId: worker.metadata.workerId,
        status: "failed",
        error: e instanceof Error ? e.message : String(e),
      };
      send({ kind: "worker_complete", workerId: worker.metadata.workerId, output: failed });
      return failed;
    }
    // auto: hot-swap to cached
    const out = await streamCached(worker, send);
    send({ kind: "worker_complete", workerId: worker.metadata.workerId, output: out });
    return out;
  }
}

export async function runCouncil(
  inputs: CouncilInputs,
  mode: RunMode,
  send: (e: CouncilEvent) => void,
): Promise<WorkerOutput[]> {
  // Fan out all 5 workers in parallel. Promise.allSettled so a single
  // crash doesn't stop the others — gate the verdict on 3-of-5 below.
  const settled = await Promise.allSettled(
    WORKERS.map((w) => runWorker(w, inputs, mode, send)),
  );
  return settled.map((s, i) =>
    s.status === "fulfilled"
      ? s.value
      : {
          workerId: WORKERS[i].metadata.workerId,
          status: "failed" as const,
          error: String(s.reason),
        },
  );
}

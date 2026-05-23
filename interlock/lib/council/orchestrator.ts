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
import * as injectionGuard from "@/lib/council/workers/injection-guard";

type Worker = {
  metadata: {
    workerId: WorkerId;
    searchGrounded: boolean;
    multimodal: boolean;
    thinkingLevel: "minimal" | "low" | "medium" | "high";
  };
  buildPrompt: (inputs: CouncilInputs) => string;
  parseFinal: (text: string) => WorkerOutput;
  // Injection Guard's cached output/stream both vary by inputs.injectionMode,
  // so the signatures accept the boolean. Other workers ignore extra args.
  cachedOutput: (injectionMode?: boolean) => WorkerOutput;
  cachedStream: (injectionMode?: boolean) => string[];
};

const WORKERS: Worker[] = [
  frameForensics,
  voicePrint,
  reverseProvenance,
  counterStrategy,
  regulatoryPrecedent,
  injectionGuard,
];

/**
 * Per-worker hard timeout. Per the demo-resilience playbook
 * (deep-research 2026-05-21), if a worker overruns, hot-swap to its
 * cached stream so the agent graph keeps animating and the verdict still
 * fires.
 */
const WORKER_TIMEOUT_MS = 12_000;
// Cached-mode token cadence. 240ms felt deliberate but in practice it stacks
// with Next-dev POST-SSE buffering and the verdict slam doesn't land for ~20s.
// 60ms keeps the streaming-text effect while the council resolves in ~1s.
const CACHED_TOKEN_INTERVAL_MS = 60;

export type RunMode = "auto" | "live" | "cached";

async function streamCached(
  worker: Worker,
  send: (e: CouncilEvent) => void,
  injectionMode = false,
): Promise<WorkerOutput> {
  const tokens = worker.cachedStream(injectionMode);
  // Per-worker "thinking" delay so all 6 sub-agents don't dump cached
  // output in the same frame. 1000-3000ms randomised gives a real
  // parallel-reasoning rhythm where some workers resolve early and
  // slower ones (Search-grounded) finish last.
  const thinkMs = 1000 + Math.random() * 2000;
  await new Promise((r) => setTimeout(r, thinkMs));
  for (const t of tokens) {
    send({ kind: "worker_token", workerId: worker.metadata.workerId, text: t });
    await new Promise((r) => setTimeout(r, CACHED_TOKEN_INTERVAL_MS));
  }
  return worker.cachedOutput(injectionMode);
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
      imageDataUrl:
        worker.metadata.multimodal && worker.metadata.workerId === "frame_forensics"
          ? inputs.frameImageDataUrl
          : undefined,
      audioDataUrl:
        worker.metadata.multimodal && worker.metadata.workerId === "voice_print"
          ? inputs.audioDataUrl
          : undefined,
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
    const out = await streamCached(worker, send, inputs.injectionMode);
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
    const out = await streamCached(worker, send, inputs.injectionMode);
    send({ kind: "worker_complete", workerId: worker.metadata.workerId, output: out });
    return out;
  }
}

export async function runCouncil(
  inputs: CouncilInputs,
  mode: RunMode,
  send: (e: CouncilEvent) => void,
): Promise<WorkerOutput[]> {
  // Fan out all 6 workers in parallel. Promise.allSettled so a single
  // crash doesn't stop the others — verdict gates on 3-of-6 consensus.
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

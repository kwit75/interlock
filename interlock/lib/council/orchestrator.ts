import { GoogleGenAI } from "@google/genai";
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
import {
  extractFrameFeaturesViaSandbox,
  extractVoiceFeaturesViaSandbox,
} from "@/lib/council/workers/sandbox-tools";

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
/**
 * Sandbox-routed workers (Frame Forensics, Voice-Print) need a wider
 * envelope because the Antigravity Linux interaction spawn + Python
 * cold-start typically lands at 10-15s before the librosa / OpenCV
 * output flushes back to us.
 */
const SANDBOX_WORKER_TIMEOUT_MS = 45_000;
// Cached-mode token cadence. 240ms felt deliberate but in practice it stacks
// with Next-dev POST-SSE buffering and the verdict slam doesn't land for ~20s.
// 60ms keeps the streaming-text effect while the council resolves in ~1s.
const CACHED_TOKEN_INTERVAL_MS = 60;

export type RunMode = "auto" | "live" | "cached" | "live-sandbox";

/**
 * Workers routed through the Antigravity sandbox forensic-extraction
 * primitive instead of direct Gemini multimodal calls. When mode is
 * "live-sandbox" the orchestrator dispatches these via runSandboxWorker;
 * everything else falls through to runLiveWorker for normal Gemini.
 */
const SANDBOX_WORKERS = new Set<WorkerId>(["frame_forensics", "voice_print"]);

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

/**
 * Sandbox-routed live worker. Fires a real `interactions.create({agent:
 * "antigravity-preview-05-2026"})` call to extract numerical forensic
 * features via OpenCV / librosa Python in an isolated Linux sandbox,
 * then streams Gemini 3.5 Flash reasoning over the returned JSON.
 *
 * Streams narration tokens at each phase so the Council Deck shows
 * progress during the 10-15s sandbox spawn instead of going blank.
 */
async function runSandboxWorker(
  worker: Worker,
  inputs: CouncilInputs,
  send: (e: CouncilEvent) => void,
): Promise<WorkerOutput> {
  const workerId = worker.metadata.workerId;
  const isVoice = workerId === "voice_print";
  const lib = isVoice ? "librosa" : "OpenCV";
  const wrapped = (text: string) => send({ kind: "worker_token", workerId, text });

  wrapped(`Spawning Antigravity sandbox · interactions.create({agent: "antigravity-preview-05-2026"}). `);
  wrapped(`Loading ${lib} + numpy${isVoice ? "" : " + scipy.signal"} into the Linux interaction. `);

  const ctrl = new AbortController();
  const timeoutId = setTimeout(() => ctrl.abort(), SANDBOX_WORKER_TIMEOUT_MS);

  let sandbox;
  try {
    sandbox = isVoice
      ? await extractVoiceFeaturesViaSandbox()
      : await extractFrameFeaturesViaSandbox();
  } finally {
    clearTimeout(timeoutId);
  }

  const f = sandbox.features as Record<string, number | string | unknown>;
  wrapped(`Sandbox env_id ${sandbox.env_id.slice(0, 18)}… spawned. `);
  if (isVoice) {
    wrapped(`librosa ${f.librosa_version} executed YIN + MFCC. `);
    wrapped(`F0 mean ${(f.f0_mean_hz as number).toFixed(1)} Hz, std ${((f.f0_std_pct as number) * 100).toFixed(2)}%; MFCC band-8 mean ${(f.mfcc_band8_mean as number).toFixed(2)}, RVC reference cosine ${(f.rvc_reference_cosine as number).toFixed(3)}. `);
  } else {
    wrapped(`OpenCV ${f.opencv_version} + scipy ${f.scipy_version} executed. `);
    wrapped(`Haar cascade face count ${f.face_count}; DCT high-freq outlier ${(f.high_freq_outlier_pct as number).toFixed(3)}%; Welch spectral entropy ${(f.spectral_entropy_bits as number).toFixed(2)} bits; optical-flow variance ${(f.optical_flow_variance as number).toFixed(1)}. `);
  }
  wrapped(`Gemini 3.5 Flash reasoning over the numerical array…\n\n`);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const baselineHint = isVoice
    ? "Enrolled baseline for this speaker: F0 std 1.2–2.0%, MFCC band-8 cosine to RVC reference < 0.30, spectral centroid 1800–2200 Hz."
    : "Authentic-capture baselines: high_freq_outlier_pct < 3.0%, spectral_entropy_bits 6.5–7.5, optical_flow_variance > 50, face_count = 1.";
  const reasoningPrompt = `You are a forensic analyst. The Antigravity sandbox just executed ${lib} on the call media and returned the following numerical features:

${JSON.stringify(sandbox.features, null, 2)}

The claimed identity is ${inputs.ceoName} (${inputs.companyTicker}). ${baselineHint}

Reason over the numerical array (NOT over raw pixels/audio — ${lib} already extracted the features deterministically). Stream 4-5 short analyst-voice sentences referencing specific numerical fields. End with EXACTLY this line:

VERDICT: <synthetic|authentic|inconclusive> · CONFIDENCE: <0–100> · KEY_ARTIFACT: <short phrase grounding the verdict in the numerical features>`;

  const stream = await ai.models.generateContentStream({
    model: "gemini-3.5-flash",
    contents: [{ role: "user", parts: [{ text: reasoningPrompt }] }],
  });

  let fullText = "";
  for await (const chunk of stream) {
    const t = chunk.text || "";
    if (t) {
      fullText += t;
      wrapped(t);
    }
  }

  return worker.parseFinal(fullText);
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

  // live-sandbox routes Frame Forensics + Voice-Print through the real
  // Antigravity sandbox; the other four workers stay on direct Gemini.
  const useSandbox = mode === "live-sandbox" && SANDBOX_WORKERS.has(worker.metadata.workerId);

  try {
    const out = useSandbox
      ? await runSandboxWorker(worker, inputs, send)
      : await runLiveWorker(worker, inputs, send);
    send({ kind: "worker_complete", workerId: worker.metadata.workerId, output: out });
    return out;
  } catch (e) {
    if (mode === "live" || mode === "live-sandbox") {
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

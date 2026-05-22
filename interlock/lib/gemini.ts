import { GoogleGenAI, ThinkingLevel as SDKThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Verified 2026-05-21 via deep-research primary sources (ai.google.dev,
// blog.google, Logan Kilpatrick x.com/OfficialLoganK 2056792266514329914):
//   * `gemini-3.5-flash`   — GA May 19 2026 at I/O. The hackathon's
//                            problem-statement model. Sub-agent deployment,
//                            long-horizon, thought preservation by default.
//   * `gemini-3.1-pro-preview`   — pro multimodal preview
//   * `gemini-3.1-flash-lite-preview` — sub-second verdicts
//   * `gemini-2.5-flash`   — last-resort fallback
//
// NEVER use `gemini-flash-latest` (silent downgrade risk per
// github.com/google-gemini/gemini-cli/issues/24412), and NEVER use
// `gemini-3-flash-preview` (22% clock drift documented).
export const MODEL_CHAIN = [
  "gemini-3.5-flash",
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash",
] as const;

export type ModelId = (typeof MODEL_CHAIN)[number];

/**
 * Thinking level — explicit per-call so we don't fall into the silent
 * default change Google shipped at the 3.5 launch (default went from
 * `high` → `medium`, see ai.google.dev/gemini-api/docs/whats-new-gemini-3.5).
 * For our parallel sub-agents: workers use `low`, orchestrator `medium`,
 * verdict aggregator `high`.
 */
export type ThinkingLevel = "minimal" | "low" | "medium" | "high";

export type GenerateOpts = {
  prompt: string;
  fileUri?: string;
  mimeType?: string;
  startWith?: ModelId;
  searchGrounding?: boolean;
  /** Inline image data for sub-agents (frame analysis). */
  imageDataUrl?: string;
  /** Inline audio data (data URL) for voice-print analysis. */
  audioDataUrl?: string;
  thinkingLevel?: ThinkingLevel;
  retries?: number;
  /** AbortController signal — workers hard-cap at 12s. */
  signal?: AbortSignal;
};

export type GenerateResult = {
  text: string;
  modelUsed: string;
  attempts: { model: string; error?: string }[];
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const RETRYABLE =
  /429|RESOURCE_EXHAUSTED|quota|rate|503|UNAVAILABLE|timeout|ECONNRESET|fetch failed/i;

function buildParts(opts: GenerateOpts) {
  const parts: Array<
    | { text: string }
    | { fileData: { fileUri: string; mimeType: string } }
    | { inlineData: { data: string; mimeType: string } }
  > = [];
  if (opts.fileUri) {
    parts.push({
      fileData: {
        fileUri: opts.fileUri,
        mimeType: opts.mimeType || "video/mp4",
      },
    });
  }
  if (opts.imageDataUrl) {
    const match = opts.imageDataUrl.match(/^data:(.+?);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: { mimeType: match[1], data: match[2] },
      });
    }
  }
  if (opts.audioDataUrl) {
    const match = opts.audioDataUrl.match(/^data:(.+?);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: { mimeType: match[1], data: match[2] },
      });
    }
  }
  parts.push({ text: opts.prompt });
  return parts;
}

const THINKING_LEVEL_MAP: Record<ThinkingLevel, SDKThinkingLevel> = {
  minimal: SDKThinkingLevel.LOW, // SDK has no "minimal"; map to LOW
  low: SDKThinkingLevel.LOW,
  medium: SDKThinkingLevel.MEDIUM,
  high: SDKThinkingLevel.HIGH,
};

function buildConfig(opts: GenerateOpts) {
  type Cfg = {
    tools?: Array<{ googleSearch: Record<string, never> }>;
    thinkingConfig?: { thinkingLevel: SDKThinkingLevel };
  };
  const cfg: Cfg = {};
  if (opts.searchGrounding) cfg.tools = [{ googleSearch: {} }];
  if (opts.thinkingLevel)
    cfg.thinkingConfig = { thinkingLevel: THINKING_LEVEL_MAP[opts.thinkingLevel] };
  return Object.keys(cfg).length ? cfg : undefined;
}

export async function generate(opts: GenerateOpts): Promise<GenerateResult> {
  const attempts: GenerateResult["attempts"] = [];
  const startIdx = opts.startWith ? MODEL_CHAIN.indexOf(opts.startWith) : 0;
  const chain = MODEL_CHAIN.slice(Math.max(0, startIdx));
  const retries = opts.retries ?? 2;

  for (const model of chain) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const resp = await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts: buildParts(opts) }],
          config: buildConfig(opts),
        });
        const text = (resp as { text?: string }).text ?? "";
        if (!text) throw new Error("Empty response");
        return { text, modelUsed: model, attempts };
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        attempts.push({ model, error: errMsg });
        if (RETRYABLE.test(errMsg)) {
          const base = 400 * Math.pow(2, attempt);
          const jitter = Math.random() * 200;
          await sleep(base + jitter);
        } else {
          break;
        }
      }
    }
  }
  throw new Error(
    "All models in fallback chain failed: " + JSON.stringify(attempts),
  );
}

export type StreamChunk = {
  type: "token" | "complete" | "error";
  text?: string;
  modelUsed?: string;
  error?: string;
};

/**
 * Streaming variant — yields token chunks as they arrive from the model.
 * No fallback chain: streaming uses the explicitly requested model only,
 * because we want to log exactly which model produced each demo stream
 * (per the silent-downgrade mitigation from
 * github.com/google-gemini/gemini-cli/issues/24412).
 */
export async function* generateStream(
  opts: GenerateOpts & { model?: ModelId },
): AsyncGenerator<StreamChunk, void, unknown> {
  const model = opts.model ?? opts.startWith ?? "gemini-3.5-flash";
  try {
    const iter = await ai.models.generateContentStream({
      model,
      contents: [{ role: "user", parts: buildParts(opts) }],
      config: buildConfig(opts),
    });
    let full = "";
    for await (const chunk of iter) {
      if (opts.signal?.aborted) {
        yield { type: "error", error: "aborted" };
        return;
      }
      const text = (chunk as { text?: string }).text ?? "";
      if (text) {
        full += text;
        yield { type: "token", text };
      }
    }
    yield { type: "complete", text: full, modelUsed: model };
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    yield { type: "error", error: errMsg };
  }
}

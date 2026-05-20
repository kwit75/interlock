import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Corrected per RT5 verified 2026-05-20:
//   * `gemini-3.1-flash` plain DOES NOT exist as a text/multimodal model
//     (only -lite-preview, -live-preview, -image-preview, -tts-preview)
//   * `gemini-3-flash-preview` has documented 22% clock drift — NEVER use
//     in any chain that touches video timing
//   * `gemini-3.5-flash` shipped May 19 2026 at I/O, now the default for
//     Managed Agents and Antigravity 2.0
export const MODEL_CHAIN = [
  "gemini-3.5-flash",
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash",
] as const;

export type ModelId = (typeof MODEL_CHAIN)[number];

export type GenerateOpts = {
  prompt: string;
  /** Optional file URI from Files API (videos for Forensics). */
  fileUri?: string;
  mimeType?: string;
  /** Force a specific starting model. */
  startWith?: ModelId;
  /** Enable Google Search grounding. */
  searchGrounding?: boolean;
  /** Max retries per model before falling back. */
  retries?: number;
};

export type GenerateResult = {
  text: string;
  modelUsed: string;
  attempts: { model: string; error?: string }[];
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const RETRYABLE =
  /429|RESOURCE_EXHAUSTED|quota|rate|503|UNAVAILABLE|timeout|ECONNRESET|fetch failed/i;

export async function generate(opts: GenerateOpts): Promise<GenerateResult> {
  const attempts: GenerateResult["attempts"] = [];
  const startIdx = opts.startWith ? MODEL_CHAIN.indexOf(opts.startWith) : 0;
  const chain = MODEL_CHAIN.slice(Math.max(0, startIdx));
  const retries = opts.retries ?? 2;

  for (const model of chain) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const parts: Array<
          | { text: string }
          | { fileData: { fileUri: string; mimeType: string } }
        > = [];
        if (opts.fileUri) {
          parts.push({
            fileData: {
              fileUri: opts.fileUri,
              mimeType: opts.mimeType || "video/mp4",
            },
          });
        }
        parts.push({ text: opts.prompt });

        const tools = opts.searchGrounding ? [{ googleSearch: {} }] : undefined;
        const resp = await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts }],
          config: tools ? { tools } : undefined,
        });
        const text = (resp as { text?: string }).text ?? "";
        if (!text) throw new Error("Empty response");
        return { text, modelUsed: model, attempts };
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        attempts.push({ model, error: errMsg });

        // Exponential backoff with jitter, but only when error is retryable
        if (RETRYABLE.test(errMsg)) {
          const base = 400 * Math.pow(2, attempt);
          const jitter = Math.random() * 200;
          await sleep(base + jitter);
        } else {
          // Non-retryable on this model → break out and try next model
          break;
        }
      }
    }
  }
  throw new Error(
    "All models in fallback chain failed: " + JSON.stringify(attempts),
  );
}

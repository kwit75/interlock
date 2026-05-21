"use client";
/**
 * Browser-side Gemini Live API client.
 *
 * 1. Fetches an ephemeral token from /api/live-token (server mints it with
 *    the prompt + tool spec already baked in).
 * 2. Connects to Gemini Live API directly over WebSocket via @google/genai.
 * 3. Streams JPEG frames via sendRealtimeInput.
 * 4. Receives function-call responses (render_verdict tool) and emits typed
 *    verdict events to the consumer.
 */

import { GoogleGenAI, type Session, Modality } from "@google/genai";

export type LiveVerdict = {
  verdict: "SYNTHETIC" | "AUTHENTIC" | "INCONCLUSIVE";
  confidence: number;
  celebrity_match: string | null;
  synthesis_artifacts: string[];
  frame_number?: number;
  received_at: number;
};

export type LiveDetectorEvents = {
  onOpen?: () => void;
  onVerdict?: (v: LiveVerdict) => void;
  onError?: (err: Error) => void;
  onClose?: () => void;
};

export class LiveDetector {
  private session: Session | null = null;
  private ai: GoogleGenAI | null = null;
  private tokenName: string | null = null;
  private model: string | null = null;
  private framesSent = 0;
  private opened = false;
  private destroyed = false;

  constructor(private readonly events: LiveDetectorEvents = {}) {}

  async connect(): Promise<void> {
    if (this.opened || this.destroyed) return;

    // 1. Get an ephemeral token
    const tokRes = await fetch("/api/live-token", { cache: "no-store" });
    if (!tokRes.ok) throw new Error(`live-token http ${tokRes.status}`);
    const tokJson = await tokRes.json();
    if (!tokJson.token) throw new Error(`live-token: ${JSON.stringify(tokJson)}`);
    this.tokenName = tokJson.token;
    this.model = tokJson.model;

    // 2. Open Live API session with the ephemeral token as the apiKey
    this.ai = new GoogleGenAI({
      apiKey: this.tokenName!,
      httpOptions: { apiVersion: "v1alpha" },
    });

    this.session = await this.ai.live.connect({
      model: this.model!,
      config: {
        responseModalities: [Modality.TEXT],
      },
      callbacks: {
        onopen: () => {
          this.opened = true;
          this.events.onOpen?.();
        },
        onmessage: (msg) => this.handleServerMessage(msg),
        onerror: (e) => {
          const err = e instanceof Error ? e : new Error(String(e));
          this.events.onError?.(err);
        },
        onclose: () => {
          this.opened = false;
          this.events.onClose?.();
        },
      },
    });
  }

  private handleServerMessage(msg: unknown): void {
    // Walk the LiveServerMessage tree looking for tool calls
    const m = msg as {
      toolCall?: {
        functionCalls?: Array<{
          name: string;
          args?: Record<string, unknown>;
        }>;
      };
      serverContent?: {
        modelTurn?: {
          parts?: Array<{ functionCall?: { name: string; args?: Record<string, unknown> } }>;
        };
      };
    };

    const toolCalls: Array<{ name: string; args?: Record<string, unknown> }> = [];
    if (m.toolCall?.functionCalls) toolCalls.push(...m.toolCall.functionCalls);
    const parts = m.serverContent?.modelTurn?.parts ?? [];
    for (const p of parts) {
      if (p.functionCall) toolCalls.push(p.functionCall);
    }

    for (const c of toolCalls) {
      if (c.name === "render_verdict") {
        const args = c.args ?? {};
        const v: LiveVerdict = {
          verdict:
            (args.verdict as LiveVerdict["verdict"]) ?? "INCONCLUSIVE",
          confidence: Number(args.confidence ?? 0),
          celebrity_match: (args.celebrity_match as string) || null,
          synthesis_artifacts: Array.isArray(args.synthesis_artifacts)
            ? (args.synthesis_artifacts as string[])
            : [],
          frame_number:
            typeof args.frame_number === "number"
              ? args.frame_number
              : undefined,
          received_at: Date.now(),
        };
        this.events.onVerdict?.(v);
      }
    }
  }

  /**
   * Send a single JPEG frame. The base64 string MUST be raw — no data: prefix.
   */
  sendFrame(b64Jpeg: string): void {
    if (!this.session || !this.opened) return;
    const clean = b64Jpeg.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
    this.framesSent += 1;
    try {
      this.session.sendRealtimeInput({
        media: {
          mimeType: "image/jpeg",
          data: clean,
        },
      });
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      this.events.onError?.(err);
    }
  }

  /** Force the model to render a verdict on whatever it has buffered. */
  requestVerdict(): void {
    if (!this.session || !this.opened) return;
    try {
      this.session.sendClientContent({
        turns: [
          {
            role: "user",
            parts: [
              {
                text: "Based on frames received so far, call render_verdict now.",
              },
            ],
          },
        ],
        turnComplete: true,
      });
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      this.events.onError?.(err);
    }
  }

  get isOpen(): boolean {
    return this.opened;
  }

  get sentFrameCount(): number {
    return this.framesSent;
  }

  close(): void {
    this.destroyed = true;
    this.opened = false;
    try {
      this.session?.close();
    } catch {
      /* ignore */
    }
    this.session = null;
    this.ai = null;
  }
}

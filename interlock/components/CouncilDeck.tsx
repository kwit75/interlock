"use client";
import { useEffect, useRef, useState } from "react";
import { WORKER_IDS, WORKER_META, type CouncilEvent, type WorkerId, type WorkerStatus, type WorkerVerdict } from "@/lib/council/types";

/**
 * The Council deck — full-screen overlay that mounts during the detection
 * phase. Subscribes to /api/council SSE, renders:
 *   1. Radial agent graph (orchestrator center, 5 worker nodes around)
 *   2. 5 streaming worker panels (token-by-token reasoning)
 *   3. Verdict tile (populated when verdict_ready fires)
 *
 * Calls onVerdict(verdict, confidence) when the verdict_ready event arrives,
 * so the parent (/meet/page.tsx) can advance the phase machine.
 */

type WorkerState = {
  status: WorkerStatus;
  tokens: string;
  startedAt: number | null;
  charCount: number;
  verdict?: WorkerVerdict;
  confidence?: number;
  finding?: string;
};

const INIT_STATE: WorkerState = {
  status: "pending",
  tokens: "",
  startedAt: null,
  charCount: 0,
};

const STATUS_COLOR: Record<WorkerStatus, string> = {
  pending: "#52525b",
  streaming: "#a855f7",
  complete: "#10b981",
  failed: "#ef4444",
  timeout: "#f59e0b",
};

const STATUS_LABEL: Record<WorkerStatus, string> = {
  pending: "QUEUED",
  streaming: "STREAMING",
  complete: "RESOLVED",
  failed: "FAILED",
  timeout: "TIMEOUT",
};

export default function CouncilDeck({
  active,
  onVerdict,
  mode = "auto",
  ceoName,
  ticker,
  injectionMode = false,
}: {
  active: boolean;
  onVerdict: (verdict: WorkerVerdict, confidence: number) => void;
  mode?: "auto" | "live" | "cached";
  ceoName?: string;
  ticker?: string;
  injectionMode?: boolean;
}) {
  const [workers, setWorkers] = useState<Record<WorkerId, WorkerState>>(() => {
    const r = {} as Record<WorkerId, WorkerState>;
    for (const id of WORKER_IDS) r[id] = { ...INIT_STATE };
    return r;
  });
  const [verdict, setVerdict] = useState<{
    verdict: WorkerVerdict;
    confidence: number;
    rationale: string;
  } | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [secondsCounter, setSecondsCounter] = useState(0);
  // Captured video frame proof — visible in the header so judges see we
  // actually grabbed a pixel-level snapshot at detection time and shipped
  // it to gemini-3.5-flash multimodal.
  const [frameInfo, setFrameInfo] = useState<{
    width: number;
    height: number;
    sizeKb: number;
  } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const verdictHitRef = useRef(false);

  useEffect(() => {
    if (!active) {
      abortRef.current?.abort();
      abortRef.current = null;
      verdictHitRef.current = false;
      setWorkers(() => {
        const r = {} as Record<WorkerId, WorkerState>;
        for (const id of WORKER_IDS) r[id] = { ...INIT_STATE };
        return r;
      });
      setVerdict(null);
      setElapsedMs(null);
      setSecondsCounter(0);
      setFrameInfo(null);
      return;
    }

    const t0 = Date.now();
    const tickerId = setInterval(() => {
      setSecondsCounter(Math.floor((Date.now() - t0) / 100) / 10);
    }, 100);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      // 1. Capture a frame from the live Meet-UI <video> element to a canvas
      // and encode as JPEG (~80–150 KB). Bails gracefully if the video isn't
      // ready — the Council still runs, Frame Forensics just falls back to
      // text-only reasoning.
      let frameImageDataUrl: string | undefined;
      try {
        const v = document.querySelector("video") as HTMLVideoElement | null;
        if (v && v.readyState >= 2 && v.videoWidth > 0) {
          const maxW = 1024;
          const scale = Math.min(1, maxW / v.videoWidth);
          const w = Math.round(v.videoWidth * scale);
          const h = Math.round(v.videoHeight * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(v, 0, 0, w, h);
            frameImageDataUrl = canvas.toDataURL("image/jpeg", 0.7);
            // base64 chars / 1.37 ≈ raw bytes
            const sizeKb = Math.round((frameImageDataUrl.length - "data:image/jpeg;base64,".length) / 1.37 / 1024);
            setFrameInfo({ width: w, height: h, sizeKb });
          }
        }
      } catch (e) {
        console.warn("[council] frame capture failed", e);
      }

      // 2. POST to /api/council with the captured frame in the body. Switched
      // from EventSource (GET-only) to fetch+ReadableStream so we can carry
      // the base64 frame; the response is still SSE format.
      let res: Response;
      try {
        res = await fetch("/api/council", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            ceoName,
            companyTicker: ticker,
            injectionMode,
            frameImageDataUrl,
          }),
          signal: ctrl.signal,
        });
      } catch (err) {
        if (!ctrl.signal.aborted) console.error("[council] POST failed", err);
        return;
      }
      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const handle = (e: CouncilEvent) => {
        if (e.kind === "worker_started") {
          setWorkers((prev) => ({
            ...prev,
            [e.workerId]: {
              ...prev[e.workerId],
              status: "streaming",
              tokens: "",
              startedAt: Date.now(),
              charCount: 0,
            },
          }));
        } else if (e.kind === "worker_token") {
          setWorkers((prev) => ({
            ...prev,
            [e.workerId]: {
              ...prev[e.workerId],
              tokens: prev[e.workerId].tokens + e.text,
              charCount: prev[e.workerId].charCount + e.text.length,
            },
          }));
        } else if (e.kind === "worker_complete") {
          setWorkers((prev) => ({
            ...prev,
            [e.workerId]: {
              ...prev[e.workerId],
              status: e.output.status,
              verdict: e.output.verdict,
              confidence: e.output.confidence,
              finding: e.output.finding,
            },
          }));
        } else if (e.kind === "verdict_ready") {
          setVerdict({
            verdict: e.verdict,
            confidence: e.confidence,
            rationale: e.synthesisRationale,
          });
          if (!verdictHitRef.current) {
            verdictHitRef.current = true;
            onVerdict(e.verdict, e.confidence);
          }
        } else if (e.kind === "council_done") {
          setElapsedMs(e.elapsedMs);
        } else if (e.kind === "error") {
          console.error("[council] error", e.message);
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          // SSE chunks are separated by blank lines (\n\n). Each chunk is
          // one or more "data: <json>" lines (we only emit single-line ones).
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            const payload = line.slice("data:".length).trim();
            if (!payload) continue;
            try {
              handle(JSON.parse(payload) as CouncilEvent);
            } catch (err) {
              console.warn("[council] parse error", err, payload.slice(0, 80));
            }
          }
        }
      } catch (err) {
        if (!ctrl.signal.aborted) console.error("[council] stream error", err);
      }
    })();

    return () => {
      clearInterval(tickerId);
      ctrl.abort();
      abortRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  const anyStreaming = WORKER_IDS.some((id) => workers[id].status === "streaming");
  // 8 total gemini-3.5-flash calls per detection: 1 orchestrator + 6 workers + 1 verdict aggregator.
  // Orchestrator fires when any worker has started; verdict counts when verdict_ready event arrived.
  const TOTAL_FLASH_CALLS = 1 + WORKER_IDS.length + 1; // = 8
  const workersComplete = WORKER_IDS.filter((id) => workers[id].status === "complete").length;
  const orchestratorFired = WORKER_IDS.some((id) => workers[id].startedAt !== null);
  const flashCallsDone =
    (orchestratorFired ? 1 : 0) + workersComplete + (verdict ? 1 : 0);

  return (
    <div
      className="fixed inset-0 z-30 flex flex-col select-none"
      style={{
        background:
          "radial-gradient(ellipse at center, #0c0e12 0%, #050608 75%)",
        color: "#e8eaed",
        fontFamily: "var(--font-roboto), system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div className="px-10 pt-6 pb-4 flex items-end justify-between border-b border-white/5">
        <div>
          <div
            className="text-[10px] tracking-[0.5em] uppercase mb-1"
            style={{ color: "#a855f7" }}
          >
            ◆ INTERLOCK COUNCIL · GEMINI 3.5 FLASH SUB-AGENT FAN-OUT
          </div>
          <div className="text-[26px] font-semibold tracking-tight leading-tight">
            Eight parallel <span style={{ color: "#a855f7" }}>3.5 Flash</span> reasoning streams →{" "}
            one verdict.
          </div>
          {ceoName && (
            <div className="text-[12px] mt-1.5 flex items-center gap-2">
              <span className="text-white/45">Defending:</span>
              <span className="font-semibold text-white">{ceoName}</span>
              {ticker && (
                <span
                  className="font-mono px-1.5 py-0.5 rounded text-[10px]"
                  style={{
                    background: "rgba(168,85,247,0.15)",
                    color: "#c4b5fd",
                    border: "1px solid rgba(168,85,247,0.35)",
                  }}
                >
                  ${ticker}
                </span>
              )}
              <span className="text-white/40 text-[10px]">
                · Reverse Provenance + Regulatory Precedent hunt live on Google Search
              </span>
            </div>
          )}
        </div>
        <div className="text-right font-mono text-[11px] text-white/60 leading-tight">
          <div className="mb-1">
            <span style={{ color: "#a855f7" }}>gemini-3.5-flash calls:</span>{" "}
            <span className="text-white text-base tabular-nums">{flashCallsDone}</span>
            <span className="text-white/40">/{TOTAL_FLASH_CALLS}</span>
          </div>
          {frameInfo && (
            <div
              className="font-mono text-[10px] tracking-[0.2em] mb-1"
              style={{ color: "#6ee7b7" }}
              title={`Captured frame shipped to frame_forensics worker (Gemini 3.5 Flash multimodal)`}
            >
              📷 frame {frameInfo.width}×{frameInfo.height} · {frameInfo.sizeKb} KB → 3.5 Flash multimodal
            </div>
          )}
          {injectionMode && (
            <div
              className="font-mono text-[10px] tracking-[0.2em] mb-1"
              style={{ color: "#fca5a5" }}
            >
              🛡 INJECTION-PROBE MODE
            </div>
          )}
          <div>
            t = <span className="text-white text-base tabular-nums">{secondsCounter.toFixed(1)}s</span>
          </div>
          {elapsedMs !== null && (
            <div className="text-emerald-300">
              done {(elapsedMs / 1000).toFixed(1)}s
            </div>
          )}
        </div>
      </div>

      {/* Agent graph */}
      <div className="relative h-44 mt-4 mx-auto" style={{ width: 720 }}>
        <CouncilGraph workers={workers} verdict={verdict?.verdict ?? null} />
      </div>

      {/* 5 worker panels */}
      <div className="flex-1 px-8 pb-4 grid grid-cols-6 gap-3 min-h-0">
        {WORKER_IDS.map((id) => (
          <WorkerPanel key={id} id={id} state={workers[id]} />
        ))}
      </div>

      {/* Verdict tile */}
      <div className="px-8 pb-6">
        <VerdictTile
          verdict={verdict?.verdict ?? null}
          confidence={verdict?.confidence ?? null}
          rationale={verdict?.rationale ?? null}
          streaming={anyStreaming && !verdict}
        />
      </div>
    </div>
  );
}

function WorkerPanel({ id, state }: { id: WorkerId; state: WorkerState }) {
  const meta = WORKER_META[id];
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.tokens]);

  const c = STATUS_COLOR[state.status];

  // Approximate token rate from char count (≈4 chars/token in English prose).
  // Displayed in the pill row so judges can see the model actually streaming.
  const tokRate = (() => {
    if (!state.startedAt || state.charCount === 0) return null;
    const elapsedSec = (Date.now() - state.startedAt) / 1000;
    if (elapsedSec < 0.2) return null;
    const tokens = state.charCount / 4;
    return Math.round(tokens / elapsedSec);
  })();

  return (
    <div
      className="flex flex-col min-h-0 rounded-lg overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${state.status === "streaming" ? "rgba(168,85,247,0.45)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <div
        className="px-3 py-2 border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-medium">{meta.label}</div>
          <div
            className="text-[9px] tracking-[0.2em] font-mono px-1.5 py-0.5 rounded"
            style={{
              background: `${c}22`,
              color: c,
              border: `1px solid ${c}55`,
            }}
          >
            {STATUS_LABEL[state.status]}
          </div>
        </div>
        <div className="text-[10px] text-white/45 mt-0.5">{meta.tagline}</div>
        <div className="flex gap-1 mt-1 flex-wrap">
          <Pill>gemini-3.5-flash</Pill>
          <Pill>thinking: low</Pill>
          {meta.searchGrounded && <Pill>+Search</Pill>}
          {meta.multimodal && <Pill>multimodal</Pill>}
          {tokRate !== null && (
            <span
              className="text-[8.5px] px-1.5 py-0.5 rounded font-mono tracking-tight tabular-nums"
              style={{
                background: "rgba(16,185,129,0.10)",
                color: "#6ee7b7",
                border: "1px solid rgba(16,185,129,0.30)",
              }}
            >
              {tokRate} tok/s
            </span>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 text-[11px] leading-snug font-mono"
        style={{
          color: state.status === "streaming" ? "#e8eaed" : "#bdc1c6",
          minHeight: 0,
        }}
      >
        {state.tokens || (
          <span className="text-white/30 italic">awaiting orchestrator…</span>
        )}
        {state.status === "streaming" && (
          <span
            className="inline-block w-1.5 h-3 ml-0.5 align-middle animate-pulse"
            style={{ background: "#a855f7" }}
          />
        )}
      </div>

      {state.verdict && (
        <div
          className="px-3 py-2 border-t flex items-center justify-between text-[10px]"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            background:
              state.verdict === "synthetic"
                ? "rgba(239,68,68,0.06)"
                : "rgba(16,185,129,0.06)",
          }}
        >
          <span
            className="font-semibold uppercase tracking-wider"
            style={{
              color: state.verdict === "synthetic" ? "#fca5a5" : "#6ee7b7",
            }}
          >
            {state.verdict}
          </span>
          <span className="text-white/70 tabular-nums">
            {((state.confidence ?? 0) * 100).toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[8.5px] px-1.5 py-0.5 rounded font-mono tracking-tight"
      style={{
        background: "rgba(168,85,247,0.10)",
        color: "#c4b5fd",
        border: "1px solid rgba(168,85,247,0.25)",
      }}
    >
      {children}
    </span>
  );
}

function VerdictTile({
  verdict,
  confidence,
  rationale,
  streaming,
}: {
  verdict: WorkerVerdict | null;
  confidence: number | null;
  rationale: string | null;
  streaming: boolean;
}) {
  const isSynthetic = verdict === "synthetic";
  const c = !verdict
    ? "#52525b"
    : isSynthetic
      ? "#ef4444"
      : verdict === "authentic"
        ? "#10b981"
        : "#f59e0b";

  return (
    <div
      className="rounded-lg px-6 py-4 flex items-center gap-6"
      style={{
        background: `linear-gradient(90deg, ${c}10 0%, transparent 60%)`,
        border: `1px solid ${c}55`,
      }}
    >
      <div className="flex flex-col items-center gap-1" style={{ minWidth: 180 }}>
        <div
          className="text-[10px] tracking-[0.35em] uppercase font-mono"
          style={{ color: c }}
        >
          Verdict Aggregator
        </div>
        <div className="text-[10px] text-white/50 font-mono">
          gemini-3.5-flash · thinking: high
        </div>
        <div className="text-[42px] font-bold tracking-tight leading-none mt-1" style={{ color: c }}>
          {verdict ? verdict.toUpperCase() : streaming ? "…" : "—"}
        </div>
        {confidence !== null && (
          <div className="text-[12px] text-white/70 tabular-nums">
            {(confidence * 100).toFixed(0)}% confidence
          </div>
        )}
      </div>
      <div className="flex-1 text-[13px] text-white/80 leading-relaxed">
        {rationale ??
          (streaming
            ? "Aggregating 6 parallel forensic streams into a single consensus verdict…"
            : "Verdict pending. Orchestrator will fan out to 6 Gemini 3.5 Flash workers, each thinking in parallel.")}
      </div>
    </div>
  );
}

function CouncilGraph({
  workers,
  verdict,
}: {
  workers: Record<WorkerId, WorkerState>;
  verdict: WorkerVerdict | null;
}) {
  const W = 720;
  const H = 176;
  const cx = W / 2;
  const cy = H / 2;
  const orchR = 26;
  const workerR = 18;
  const radius = 64;

  const nodes = WORKER_IDS.map((id, i) => {
    const angle = -Math.PI + (i / (WORKER_IDS.length - 1)) * Math.PI;
    return {
      id,
      x: cx + Math.cos(angle) * radius * 2.2,
      y: cy + Math.sin(angle) * radius * 0.9,
      state: workers[id],
    };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <radialGradient id="orchGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
      </defs>

      {/* Edges */}
      {nodes.map((n) => (
        <line
          key={`e-${n.id}`}
          x1={cx}
          y1={cy}
          x2={n.x}
          y2={n.y}
          stroke={
            n.state.status === "streaming"
              ? "#a855f7"
              : n.state.status === "complete"
                ? "#10b981"
                : n.state.status === "failed"
                  ? "#ef4444"
                  : "#3f3f46"
          }
          strokeWidth={n.state.status === "streaming" ? 2 : 1.2}
          opacity={n.state.status === "pending" ? 0.4 : 0.95}
          strokeDasharray={n.state.status === "streaming" ? "4 4" : undefined}
        >
          {n.state.status === "streaming" && (
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-16"
              dur="0.6s"
              repeatCount="indefinite"
            />
          )}
        </line>
      ))}

      {/* Worker nodes */}
      {nodes.map((n) => {
        const c = STATUS_COLOR[n.state.status];
        return (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={workerR} fill={`${c}33`} stroke={c} strokeWidth={1.5} />
            <text
              x={n.x}
              y={n.y + 4}
              fontSize={10}
              fontFamily="ui-monospace, monospace"
              fill="#e8eaed"
              textAnchor="middle"
            >
              {labelShort(n.id)}
            </text>
            <text
              x={n.x}
              y={n.y + workerR + 14}
              fontSize={9}
              fill={c}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
            >
              {STATUS_LABEL[n.state.status]}
            </text>
          </g>
        );
      })}

      {/* Orchestrator center */}
      <circle cx={cx} cy={cy} r={orchR} fill="url(#orchGrad)" />
      <text
        x={cx}
        y={cy - 2}
        fontSize={9}
        fill="#fff"
        fontFamily="ui-monospace, monospace"
        textAnchor="middle"
        fontWeight={600}
      >
        ORCHESTRATOR
      </text>
      <text
        x={cx}
        y={cy + 10}
        fontSize={8}
        fill="#e9d5ff"
        fontFamily="ui-monospace, monospace"
        textAnchor="middle"
      >
        3.5 Flash · med
      </text>

      {/* Verdict node below */}
      <line
        x1={cx}
        y1={cy + orchR}
        x2={cx}
        y2={H - 16}
        stroke={verdict ? STATUS_COLOR.complete : "#3f3f46"}
        strokeWidth={verdict ? 2 : 1}
        opacity={verdict ? 1 : 0.4}
      />
    </svg>
  );
}

function labelShort(id: WorkerId): string {
  return {
    frame_forensics: "FRAME",
    voice_print: "VOICE",
    reverse_provenance: "PROVNC",
    counter_strategy: "CNTR",
    regulatory_precedent: "REG",
    injection_guard: "GUARD",
  }[id];
}

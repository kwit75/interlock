"use client";
import { useEffect, useRef, useState } from "react";
import IncomingCallCard from "@/components/IncomingCallCard";
import AgentPanel from "@/components/AgentPanel";
import WireStatusBank from "@/components/WireStatusBank";
import AttributionSlide from "@/components/AttributionSlide";
import type {
  SSEEvent,
  ForensicsEvidence,
  BankWire,
  CommsResult,
} from "@/lib/types";

type Phase =
  | "idle"
  | "detection"
  | "awaiting_approval"
  | "executing"
  | "done";

export default function IncidentPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [evidence, setEvidence] = useState<ForensicsEvidence[]>([]);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [containmentLines, setContainmentLines] = useState<string[]>([]);
  const [commsDrafts, setCommsDrafts] = useState<Partial<CommsResult>>({});
  const [wire, setWire] = useState<BankWire | null>(null);
  const [countdown, setCountdown] = useState<number>(272); // 4:32 to market close

  const esRef = useRef<EventSource | null>(null);

  // Countdown ticks once we're past idle (UI element only)
  useEffect(() => {
    if (phase === "idle" || phase === "done") return;
    const id = setInterval(
      () => setCountdown((c) => Math.max(0, c - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [phase]);

  // Cleanup any open SSE on unmount
  useEffect(() => {
    return () => {
      esRef.current?.close();
    };
  }, []);

  function startDemo() {
    setPhase("detection");
    setEvidence([]);
    setVerdict(null);
    setConfidence(null);
    setContainmentLines([]);
    setCommsDrafts({});
    setWire(null);
    setCountdown(272);

    const es = new EventSource("/api/incident/start");
    esRef.current = es;
    es.onmessage = (m) => {
      const e: SSEEvent = JSON.parse(m.data);
      if (e.agent === "forensics" && e.type === "evidence") {
        setEvidence((prev) => [...prev, e.data]);
      } else if (e.agent === "forensics" && e.type === "verdict") {
        setVerdict(e.data.verdict);
        setConfidence(e.data.confidence);
      } else if (e.agent === "orchestrator" && e.type === "strategy_ready") {
        setPhase("awaiting_approval");
      } else if (e.agent === "orchestrator" && e.type === "done") {
        es.close();
      }
    };
    es.onerror = () => {
      es.close();
    };
  }

  function approveStrategy() {
    setPhase("executing");
    const es = new EventSource("/api/incident/approve");
    esRef.current = es;
    es.onmessage = (m) => {
      const e: SSEEvent = JSON.parse(m.data);
      if (e.agent === "containment" && e.type === "stdout") {
        setContainmentLines((prev) => [...prev, e.data.line]);
      } else if (e.agent === "comms" && e.type === "draft") {
        setCommsDrafts((prev) => ({ ...prev, [e.data.kind]: e.data.content }));
      } else if (e.agent === "orchestrator" && e.type === "wire_frozen") {
        setWire(e.data);
      } else if (e.agent === "orchestrator" && e.type === "done") {
        setPhase("done");
        es.close();
      }
    };
  }

  const m = Math.floor(countdown / 60);
  const s = countdown % 60;
  const callPlaying = phase === "detection";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col">
      <header className="flex items-center justify-between mb-4 font-mono text-[11px] tracking-wide">
        <div className="text-slate-500 uppercase">
          INTERLOCK · INCIDENT #2026-05-23-01
        </div>
        <div className="text-slate-400 tabular-nums">
          <span className="text-slate-500">MKT_CLOSE_UTC:</span>{" "}
          <span className="text-slate-200">20:00:00</span>{" "}
          <span className="text-amber-300">
            [T-{m.toString().padStart(2, "0")}m:
            {s.toString().padStart(2, "0")}s]
          </span>
        </div>
      </header>

      {phase === "idle" && (
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-[10px] text-slate-500 tracking-widest uppercase mb-3">
            INTERLOCK Command Center · v1.0
          </div>
          <h1 className="text-3xl font-semibold mb-6 text-slate-100">
            Start Live Incident
          </h1>
          <button
            onClick={startDemo}
            className="px-10 py-4 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 rounded-md text-lg font-medium transition"
          >
            Start Demo
          </button>
          <p className="text-xs text-slate-500 mt-6 max-w-md text-center">
            Simulated incident scenario: deepfake video call from "CEO"
            requesting $50M wire transfer, 5 minutes before market close.
          </p>
        </div>
      )}

      {phase !== "idle" && (
        <div className="grid grid-cols-12 gap-4 flex-1">
          <div className="col-span-4 space-y-4">
            <IncomingCallCard playing={callPlaying} />
            <WireStatusBank wire={wire} />
            {verdict === "SYNTHETIC" && (
              <div className="border-2 border-rose-500 bg-rose-950/30 rounded-lg p-4">
                <div className="text-rose-300 text-sm font-bold tracking-wide">
                  ⚠ DEEPFAKE DETECTED —{" "}
                  {confidence !== null ? (confidence * 100).toFixed(0) : "—"}%
                  confidence
                </div>
                {phase === "awaiting_approval" && (
                  <>
                    <div className="mt-3 text-xs text-slate-300">
                      Recommended strategy:
                    </div>
                    <ol className="text-xs list-decimal list-inside text-slate-200 mt-1 space-y-0.5">
                      <li>Freeze wire W-7821</li>
                      <li>Lock CEO accounts</li>
                      <li>Draft Item 1.05 disclosure (for officer review)</li>
                    </ol>
                    <button
                      onClick={approveStrategy}
                      className="mt-3 w-full py-2.5 bg-rose-600 hover:bg-rose-500 rounded font-medium text-sm"
                    >
                      Approve Strategy
                    </button>
                    <div className="text-[10px] text-slate-500 mt-2 leading-snug">
                      One-click batch approval. Per-action step-through
                      available in settings — designed for Spark-era async
                      agents (Antigravity 2.0 narrative).
                    </div>
                  </>
                )}
                {phase === "done" && (
                  <div className="mt-3 text-xs text-emerald-300">
                    ✓ Strategy executed. Wire frozen. Disclosure drafted for
                    officer signature.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="col-span-8 grid grid-cols-1 gap-4">
            <AgentPanel
              title="FORENSICS"
              subtitle="Gemini 3.1 Pro multimodal"
              status={
                evidence.length === 0
                  ? "idle"
                  : verdict
                    ? "done"
                    : "running"
              }
            >
              {evidence.map((ev, i) => (
                <div key={i}>
                  <span className="text-slate-500">
                    [frame {ev.frame_number.toString().padStart(3, "0")}]
                  </span>{" "}
                  <span className="text-amber-300">{ev.category}</span>{" "}
                  <span className="text-slate-500">({ev.severity})</span>{" "}
                  {ev.observation}
                </div>
              ))}
              {verdict && (
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-500">VERDICT:</span>{" "}
                  <span
                    className={
                      verdict === "SYNTHETIC"
                        ? "text-rose-400 font-bold"
                        : "text-emerald-400"
                    }
                  >
                    {verdict}
                  </span>{" "}
                  {confidence !== null && (
                    <span className="text-slate-400">
                      — {(confidence * 100).toFixed(0)}% confidence
                    </span>
                  )}
                </div>
              )}
            </AgentPanel>

            <AgentPanel
              title="CONTAINMENT"
              subtitle="Managed Agents · Code Execution"
              status={
                phase === "executing" && containmentLines.length === 0
                  ? "running"
                  : containmentLines.length
                    ? phase === "done"
                      ? "done"
                      : "running"
                    : "idle"
              }
            >
              {containmentLines.length === 0 && phase === "executing" && (
                <div className="text-slate-500">
                  Spawning isolated Linux sandbox via Gemini API…
                </div>
              )}
              {containmentLines.map((l, i) => (
                <div key={i} className="text-emerald-300">
                  $ {l}
                </div>
              ))}
            </AgentPanel>

            <AgentPanel
              title="COMMS"
              subtitle="Gemini 3.5 Flash + Search grounding"
              status={
                Object.keys(commsDrafts).length === 3
                  ? "done"
                  : Object.keys(commsDrafts).length
                    ? "running"
                    : phase === "executing"
                      ? "running"
                      : "idle"
              }
            >
              {commsDrafts.item_1_05_draft && (
                <details className="border border-slate-800 rounded p-2 mb-2 bg-slate-950/50">
                  <summary className="cursor-pointer text-slate-200">
                    📄 SEC Form 8-K · Item 1.05 disclosure (DRAFT — for
                    officer review & filing)
                  </summary>
                  <pre className="whitespace-pre-wrap mt-2 text-[10px] text-slate-400 leading-relaxed">
                    {commsDrafts.item_1_05_draft}
                  </pre>
                </details>
              )}
              {commsDrafts.board_alert && (
                <details className="border border-slate-800 rounded p-2 mb-2 bg-slate-950/50">
                  <summary className="cursor-pointer text-slate-200">
                    📄 Board alert
                  </summary>
                  <pre className="whitespace-pre-wrap mt-2 text-[10px] text-slate-400 leading-relaxed">
                    {commsDrafts.board_alert}
                  </pre>
                </details>
              )}
              {commsDrafts.customer_comms && (
                <details className="border border-slate-800 rounded p-2 bg-slate-950/50">
                  <summary className="cursor-pointer text-slate-200">
                    📄 Customer communications
                  </summary>
                  <pre className="whitespace-pre-wrap mt-2 text-[10px] text-slate-400 leading-relaxed">
                    {commsDrafts.customer_comms}
                  </pre>
                </details>
              )}
            </AgentPanel>
          </div>
        </div>
      )}
      <AttributionSlide />
    </main>
  );
}

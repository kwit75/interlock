"use client";
import { useEffect, useRef, useState } from "react";
import IncomingCallCard from "@/components/IncomingCallCard";
import MeetShell from "@/components/MeetShell";
import AgentTrace from "@/components/AgentTrace";
import OverrideEscapeHatch from "@/components/OverrideEscapeHatch";
import DetectorTelemetry, {
  DetectorMode,
} from "@/components/DetectorTelemetry";
import DraftRow from "@/components/DraftRow";
import WireStatusBank from "@/components/WireStatusBank";
import DeepfakeSlamOverlay from "@/components/DeepfakeSlamOverlay";
import EndCardResolved from "@/components/EndCardResolved";
import SignatureCeremony from "@/components/SignatureCeremony";
import ForensicsHeader from "@/components/ForensicsHeader";
import type {
  SSEEvent,
  ForensicsEvidence,
  BankWire,
  CommsResult,
  AgentThought,
} from "@/lib/types";
import {
  playPhoneRing,
  playDeepfakeAlarm,
  playFreezeSlam,
  playResolvedChime,
  startAmbientPulse,
  stopAmbientPulse,
} from "@/lib/audio";

type Phase =
  | "idle"
  | "detection"
  | "awaiting_approval"
  | "executing"
  | "awaiting_signature"
  | "done";

export default function MeetIncidentPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [evidence, setEvidence] = useState<ForensicsEvidence[]>([]);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [containmentLines, setContainmentLines] = useState<string[]>([]);
  const [commsDrafts, setCommsDrafts] = useState<Partial<CommsResult>>({});
  const [wire, setWire] = useState<BankWire | null>(null);
  const [countdown, setCountdown] = useState<number>(272);
  const [countdownFrozen, setCountdownFrozen] = useState<boolean>(false);
  const [showSlam, setShowSlam] = useState<boolean>(false);
  const [agentThoughts, setAgentThoughts] = useState<AgentThought[]>([]);
  const [traceActive, setTraceActive] = useState<boolean>(false);
  const [demoStartedAt, setDemoStartedAt] = useState<number | null>(null);
  const [resolvedElapsed, setResolvedElapsed] = useState<number>(0);
  const [detectorMode, setDetectorMode] = useState<DetectorMode>("cached");
  const [showTelemetry, setShowTelemetry] = useState(false);

  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (phase === "idle" || phase === "done" || countdownFrozen) return;
    const id = setInterval(
      () => setCountdown((c) => Math.max(0, c - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [phase, countdownFrozen]);

  useEffect(() => {
    return () => {
      esRef.current?.close();
      stopAmbientPulse();
    };
  }, []);

  useEffect(() => {
    if (verdict === "SYNTHETIC") {
      playDeepfakeAlarm();
      setShowSlam(true);
    }
  }, [verdict]);

  function startDemo() {
    setPhase("detection");
    setEvidence([]);
    setVerdict(null);
    setConfidence(null);
    setContainmentLines([]);
    setCommsDrafts({});
    setWire(null);
    setCountdown(272);
    setCountdownFrozen(false);
    setShowSlam(false);
    setAgentThoughts([]);
    setTraceActive(false);
    setDemoStartedAt(Date.now());

    playPhoneRing();
    setTimeout(() => startAmbientPulse(), 800);

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
    es.onerror = () => es.close();
  }

  async function approveStrategy() {
    setPhase("executing");
    setTraceActive(true);
    try {
      const r = await fetch("/cache/agent-trace.json");
      const thoughts: AgentThought[] = await r.json();
      for (const t of thoughts) {
        setAgentThoughts((prev) => [...prev, t]);
        if (t.pause_ms) {
          await new Promise((res) => setTimeout(res, t.pause_ms));
        }
      }
      setTraceActive(false);
    } catch {
      setTraceActive(false);
    }
    const es = new EventSource("/api/incident/approve");
    esRef.current = es;
    es.onmessage = (m) => {
      const e: SSEEvent = JSON.parse(m.data);
      if (e.agent === "containment" && e.type === "stdout") {
        setContainmentLines((prev) => [...prev, e.data.line]);
        if (
          e.data.line.includes('"action":"freeze_wire"') &&
          e.data.line.includes('"status":"FROZEN"')
        ) {
          setCountdownFrozen(true);
        }
      } else if (e.agent === "comms" && e.type === "draft") {
        setCommsDrafts((prev) => ({ ...prev, [e.data.kind]: e.data.content }));
      } else if (e.agent === "orchestrator" && e.type === "wire_frozen") {
        setWire(e.data);
        playFreezeSlam();
      } else if (e.agent === "orchestrator" && e.type === "done") {
        setPhase("awaiting_signature");
        setTimeout(() => {
          setPhase("done");
          stopAmbientPulse();
          playResolvedChime();
          setResolvedElapsed(
            demoStartedAt ? Math.round((Date.now() - demoStartedAt) / 1000) : 60,
          );
        }, 3200);
        es.close();
      }
    };
  }

  const m = Math.floor(countdown / 60);
  const s = countdown % 60;
  const callPlaying = phase === "detection";

  // === Sidebar: INTERLOCK plugin pane ===
  const sidebar =
    phase === "idle" ? (
      <SidebarIdle onStart={startDemo} />
    ) : (
      <div className="space-y-3">
        {/* Countdown / status row */}
        <div className="flex items-center justify-between text-[11px]">
          <div className="text-slate-400">
            Wire <span className="font-mono text-slate-200">W-7821</span>
          </div>
          <div
            className={`tabular-nums font-mono text-[11px] px-2 py-0.5 rounded ${
              countdownFrozen
                ? "bg-emerald-950/50 text-emerald-300 border border-emerald-500/30"
                : "bg-amber-950/30 text-amber-200 border border-amber-500/30"
            }`}
          >
            {countdownFrozen
              ? "FROZEN"
              : `T-${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`}
          </div>
        </div>

        {/* Verdict + Approve — the hero surface */}
        {verdict === "SYNTHETIC" && (
          <div className="rounded-lg border-2 border-rose-500/70 bg-rose-950/30 p-3 shadow-[0_0_30px_rgba(244,63,94,0.25)]">
            <div className="flex items-baseline justify-between">
              <div className="text-rose-300 text-sm font-semibold">
                Deepfake detected
              </div>
              <div className="text-[11px] text-rose-400 font-mono tabular-nums">
                {confidence !== null ? (confidence * 100).toFixed(0) : "—"}%
                conf.
              </div>
            </div>
            {phase === "awaiting_approval" && (
              <>
                <div className="mt-2 text-[13px] text-slate-200 leading-snug">
                  Recommend:{" "}
                  <span className="text-white font-medium">
                    freeze wire W-7821
                  </span>{" "}
                  &amp; draft 8-K disclosure.
                </div>
                <button
                  onClick={approveStrategy}
                  className="mt-2.5 w-full py-2.5 bg-rose-600 hover:bg-rose-500 rounded-md font-semibold text-sm shadow-[0_0_24px_rgba(244,63,94,0.55)] transition"
                >
                  Approve &amp; Execute
                </button>
              </>
            )}
            {(phase === "executing" ||
              phase === "awaiting_signature" ||
              phase === "done") && (
              <div className="mt-2 text-[11px] text-emerald-300">
                ✓ Wire frozen. Disclosure drafted for officer signature.
              </div>
            )}
          </div>
        )}

        {/* FORENSICS */}
        <SidebarSection
          title="Forensics"
          subtitle="gemini-3.1-pro-preview · multimodal"
          status={evidence.length === 0 ? "idle" : verdict ? "done" : "running"}
        >
          <ForensicsHeader verdict={verdict} confidence={confidence} />
          {evidence.length > 0 && (
            <div className="text-[10px] text-slate-500 mt-2 mb-1 uppercase tracking-widest">
              Detector commentary
            </div>
          )}
          <div className="text-[10px] font-mono leading-relaxed space-y-0.5">
            {evidence.slice(-6).map((ev, i) => (
              <div key={i}>
                <span className="text-slate-500">
                  [f{ev.frame_number.toString().padStart(3, "0")}]
                </span>{" "}
                <span className="text-amber-300">{ev.category}</span>{" "}
                <span className="text-slate-400">{ev.observation}</span>
              </div>
            ))}
          </div>
        </SidebarSection>

        {/* CONTAINMENT */}
        <SidebarSection
          title="Containment"
          subtitle="managed-agents · antigravity-preview-05-2026"
          status={
            phase === "executing" && containmentLines.length === 0
              ? "running"
              : containmentLines.length
                ? phase === "done" || phase === "awaiting_signature"
                  ? "done"
                  : "running"
                : "idle"
          }
        >
          <AgentTrace thoughts={agentThoughts} active={traceActive} />
          {containmentLines.length === 0 &&
            phase === "executing" &&
            agentThoughts.length === 0 && (
              <div className="text-slate-500 text-[11px] mt-1">
                Spawning isolated Linux sandbox…
              </div>
            )}
          {containmentLines.length > 0 && (
            <div className="text-[10px] text-slate-500 mt-2 mb-1 uppercase tracking-widest">
              Sandbox stdout
            </div>
          )}
          <div className="font-mono text-[10px] leading-relaxed text-emerald-300 space-y-0.5">
            {containmentLines.map((l, i) => (
              <div key={i}>$ {l}</div>
            ))}
          </div>
          <OverrideEscapeHatch
            visible={
              containmentLines.some((l) => l.includes("lock_account")) &&
              (phase === "executing" ||
                phase === "awaiting_signature" ||
                phase === "done")
            }
          />
        </SidebarSection>

        {/* COMMS */}
        <SidebarSection
          title="Comms"
          subtitle="gemini-3.5-flash · search grounding"
          status={
            Object.keys(commsDrafts).length === 3
              ? phase === "done" || phase === "awaiting_signature"
                ? "done"
                : "running"
              : Object.keys(commsDrafts).length
                ? "running"
                : phase === "executing"
                  ? "running"
                  : "idle"
          }
        >
          {Object.keys(commsDrafts).length === 0 ? (
            <div className="text-slate-500 text-[11px]">
              Awaiting containment confirmation…
            </div>
          ) : (
            <div className="space-y-1.5">
              {commsDrafts.item_1_05_draft && (
                <DraftRow
                  label="SEC Form 8-K · Item 1.05"
                  body={commsDrafts.item_1_05_draft}
                  primary
                />
              )}
              {commsDrafts.board_alert && (
                <DraftRow label="Board alert" body={commsDrafts.board_alert} />
              )}
              {commsDrafts.customer_comms && (
                <DraftRow
                  label="Customer communications"
                  body={commsDrafts.customer_comms}
                />
              )}
            </div>
          )}
        </SidebarSection>

        {/* DETECTOR — collapsed by default, expand-on-click */}
        <div>
          <button
            onClick={() => setShowTelemetry((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded border border-slate-800 bg-slate-950/40 hover:border-slate-700 transition text-[11px]"
          >
            <span className="flex items-center gap-2">
              <span className="text-slate-500">◆</span>
              <span className="text-slate-300">detector telemetry</span>
              <span className="text-slate-500 font-mono">
                · 1.1% EER · cached
              </span>
            </span>
            <span className="text-slate-500">{showTelemetry ? "−" : "+"}</span>
          </button>
          {showTelemetry && (
            <div className="mt-1.5">
              <DetectorTelemetry
                mode={detectorMode}
                onModeChange={setDetectorMode}
                active={true}
              />
            </div>
          )}
        </div>
      </div>
    );

  // === Center call area ===
  const call = (
    <>
      <IncomingCallCard playing={callPlaying} activeEvidence={evidence} />
    </>
  );

  // === Below-the-call strip (wire status) ===
  const belowCall = (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12">
        <WireStatusBank wire={wire} />
      </div>
    </div>
  );

  return (
    <>
      <DeepfakeSlamOverlay
        show={showSlam}
        confidence={confidence ?? 0.94}
        onDone={() => setShowSlam(false)}
      />
      <SignatureCeremony
        show={phase === "awaiting_signature"}
        draftPreview={commsDrafts.item_1_05_draft ?? null}
      />
      <EndCardResolved show={phase === "done"} elapsedSec={resolvedElapsed} />
      <MeetShell call={call} rightPanel={sidebar}>
        {belowCall}
      </MeetShell>
    </>
  );
}

function SidebarIdle({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
        <div className="text-[11px] text-slate-400 leading-relaxed">
          INTERLOCK monitors live video calls for synthetic-media indicators on
          every frame. When a deepfake is detected on a wire-authorizing
          conversation, the wire is frozen automatically and a Form 8-K Item
          1.05 disclosure is drafted for the authorized officer.
        </div>
      </div>
      <button
        onClick={onStart}
        className="w-full py-3 bg-blue-500 hover:bg-blue-400 rounded-md font-medium text-sm transition shadow-[0_0_20px_rgba(59,130,246,0.4)]"
      >
        Start incident simulation
      </button>
      <div className="text-[10px] text-slate-500 leading-relaxed">
        Simulated scenario: deepfake video call from &quot;CEO&quot; requesting
        $50M wire transfer, 4:32 before market close.
      </div>
    </div>
  );
}

function SidebarSection({
  title,
  subtitle,
  status,
  children,
}: {
  title: string;
  subtitle: string;
  status: "idle" | "running" | "done";
  children: React.ReactNode;
}) {
  const dot =
    status === "done"
      ? "bg-emerald-400"
      : status === "running"
        ? "bg-amber-400 animate-pulse"
        : "bg-slate-700";
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/40">
      <header className="px-3 py-2 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          <span className="text-[12px] text-slate-100 font-medium">
            {title}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{subtitle}</span>
      </header>
      <div className="px-3 py-2">{children}</div>
    </section>
  );
}

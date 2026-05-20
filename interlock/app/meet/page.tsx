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
import DeepfakeSlamOverlay from "@/components/DeepfakeSlamOverlay";
import EndCardResolved from "@/components/EndCardResolved";
import SignatureCeremony from "@/components/SignatureCeremony";
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
  const wireFrozen = wire?.status === "FROZEN" || countdownFrozen;

  // === SIDEBAR ===
  const sidebar =
    phase === "idle" ? (
      <SidebarIdle onStart={startDemo} />
    ) : (
      <>
        {/* Verdict — hero surface, shown only when SYNTHETIC */}
        {verdict === "SYNTHETIC" && (
          <div className="rounded-lg border-2 border-rose-500/70 bg-rose-950/30 p-2.5 shadow-[0_0_24px_rgba(244,63,94,0.25)]">
            <div className="flex items-baseline justify-between">
              <div className="text-rose-200 text-[13px] font-semibold leading-tight">
                Deepfake detected
              </div>
              <div className="text-[11px] text-rose-400 font-mono tabular-nums">
                {confidence !== null ? (confidence * 100).toFixed(0) : "—"}%
              </div>
            </div>
            {phase === "awaiting_approval" && (
              <>
                <div className="mt-1.5 text-[12px] text-slate-200 leading-snug">
                  Recommend:{" "}
                  <span className="text-white font-medium">
                    freeze wire W-7821
                  </span>
                  .
                </div>
                <button
                  onClick={approveStrategy}
                  className="mt-2 w-full py-2 bg-rose-600 hover:bg-rose-500 rounded-md font-semibold text-[13px] shadow-[0_0_20px_rgba(244,63,94,0.55)] transition"
                >
                  Approve &amp; Execute
                </button>
              </>
            )}
            {(phase === "executing" ||
              phase === "awaiting_signature" ||
              phase === "done") && (
              <div className="mt-1.5 text-[11px] text-emerald-300">
                ✓ Wire frozen · 8-K drafted
              </div>
            )}
          </div>
        )}

        {/* FORENSICS */}
        <SidebarSection
          title="Forensics"
          subtitle="gemini-3.1-pro · multimodal"
          status={evidence.length === 0 ? "idle" : verdict ? "done" : "running"}
          collapsedOk={phase === "executing" || phase === "done" || phase === "awaiting_signature"}
        >
          <div className="font-mono text-[10px] leading-snug space-y-0.5 max-h-[110px] overflow-y-auto">
            {evidence.slice(-4).map((ev, i) => (
              <div key={i}>
                <span className="text-slate-500">
                  f{ev.frame_number.toString().padStart(3, "0")}
                </span>{" "}
                <span className="text-amber-300">{ev.category}</span>{" "}
                <span className="text-slate-400">{ev.observation}</span>
              </div>
            ))}
          </div>
          {verdict && (
            <div className="mt-1.5 text-[10px] text-slate-500">
              EER 0.087 · audio EER 0.021 · verdict{" "}
              <span className="text-rose-300 font-medium">{verdict}</span> ·
              conf{" "}
              <span className="text-rose-300 font-mono">
                {confidence?.toFixed(2)}
              </span>
            </div>
          )}
        </SidebarSection>

        {/* CONTAINMENT */}
        {(phase === "executing" ||
          phase === "awaiting_signature" ||
          phase === "done") && (
          <SidebarSection
            title="Containment"
            subtitle="managed-agents · antigravity"
            status={
              containmentLines.length
                ? phase === "done" || phase === "awaiting_signature"
                  ? "done"
                  : "running"
                : "running"
            }
            collapsedOk={phase === "done" || phase === "awaiting_signature"}
          >
            <div className="max-h-[100px] overflow-y-auto">
              <AgentTrace thoughts={agentThoughts} active={traceActive} />
            </div>
            {containmentLines.length > 0 && (
              <div className="font-mono text-[10px] leading-snug text-emerald-300 mt-1.5 max-h-[60px] overflow-y-auto">
                {containmentLines.map((l, i) => (
                  <div key={i} className="truncate">$ {l}</div>
                ))}
              </div>
            )}
            <OverrideEscapeHatch
              visible={
                containmentLines.some((l) => l.includes("lock_account")) &&
                (phase === "executing" ||
                  phase === "awaiting_signature" ||
                  phase === "done")
              }
            />
          </SidebarSection>
        )}

        {/* COMMS */}
        {(phase === "executing" ||
          phase === "awaiting_signature" ||
          phase === "done") && (
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
                  : "running"
            }
          >
            {Object.keys(commsDrafts).length === 0 ? (
              <div className="text-slate-500 text-[11px]">
                Awaiting containment…
              </div>
            ) : (
              <div className="space-y-1">
                {commsDrafts.item_1_05_draft && (
                  <DraftRow
                    label="SEC Form 8-K · Item 1.05"
                    body={commsDrafts.item_1_05_draft}
                    primary
                  />
                )}
                {commsDrafts.board_alert && (
                  <DraftRow
                    label="Board alert"
                    body={commsDrafts.board_alert}
                  />
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
        )}

        {/* TELEMETRY badge */}
        <div className="pt-1">
          <button
            onClick={() => setShowTelemetry((v) => !v)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded border border-slate-800 bg-slate-950/40 hover:border-slate-700 transition text-[11px]"
          >
            <span className="flex items-center gap-2">
              <span className="text-slate-500">◆</span>
              <span className="text-slate-300">detector</span>
              <span className="text-slate-500 font-mono">
                1.1% EER · cached
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
      </>
    );

  // === CENTER STAGE ===
  const call = <IncomingCallCard playing={callPlaying} activeEvidence={evidence} />;

  // === FLOATING WIRE STATUS PILL (above bottom control bar) ===
  const wireChip =
    phase !== "idle" ? (
      <div className="flex justify-center">
        <div
          className={`pointer-events-auto rounded-full backdrop-blur-md border shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex items-center gap-3 px-3 py-1.5 transition-all duration-300 ${
            wireFrozen
              ? "bg-emerald-950/85 border-emerald-500/60"
              : "bg-amber-950/80 border-amber-500/50"
          }`}
        >
          <div className="text-[11px] text-slate-400 font-mono">
            wire W-7821
          </div>
          <div className="text-[13px] font-semibold text-white tabular-nums">
            $50,000,000
          </div>
          <div className="w-px h-4 bg-white/15" />
          <div
            className={`text-[11px] font-mono uppercase tracking-widest ${
              wireFrozen ? "text-emerald-300" : "text-amber-300"
            }`}
          >
            {wireFrozen
              ? "● Frozen"
              : `T-${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`}
          </div>
        </div>
      </div>
    ) : null;

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
      <MeetShell
        call={call}
        rightPanel={sidebar}
        callStartedAt={demoStartedAt}
      >
        {wireChip}
      </MeetShell>
    </>
  );
}

function SidebarIdle({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-2.5">
      <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2.5">
        <div className="text-[11px] text-slate-400 leading-relaxed">
          INTERLOCK monitors live video calls for synthetic-media indicators on
          every frame. On a detected deepfake of a wire-authorizing call, the
          wire is frozen automatically and an SEC Form 8-K Item 1.05 disclosure
          is drafted for the authorized officer.
        </div>
      </div>
      <button
        onClick={onStart}
        className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 rounded-md font-medium text-[13px] transition shadow-[0_0_20px_rgba(59,130,246,0.4)]"
      >
        Start incident simulation
      </button>
      <div className="text-[10px] text-slate-500 leading-relaxed">
        Simulated: deepfake video call from &quot;CEO&quot; requesting $50M
        wire transfer, 4:32 before market close.
      </div>
    </div>
  );
}

function SidebarSection({
  title,
  subtitle,
  status,
  children,
  collapsedOk,
}: {
  title: string;
  subtitle: string;
  status: "idle" | "running" | "done";
  children: React.ReactNode;
  collapsedOk?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(collapsedOk);
  useEffect(() => {
    setCollapsed(!!collapsedOk);
  }, [collapsedOk]);
  const dot =
    status === "done"
      ? "bg-emerald-400"
      : status === "running"
        ? "bg-amber-400 animate-pulse"
        : "bg-slate-700";
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/40">
      <header
        onClick={() => setCollapsed((v) => !v)}
        className="px-2.5 py-1.5 flex items-center justify-between border-b border-slate-900 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          <span className="text-[12px] text-slate-100 font-medium">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500 font-mono">
            {subtitle}
          </span>
          <span className="text-slate-500 text-[10px]">
            {collapsed ? "+" : "−"}
          </span>
        </div>
      </header>
      {!collapsed && <div className="px-2.5 py-2">{children}</div>}
    </section>
  );
}

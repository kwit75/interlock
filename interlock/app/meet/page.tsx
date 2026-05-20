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

const C = {
  text: "#e8eaed",
  textSubtle: "#bdc1c6",
  textDim: "#9aa0a6",
  textMuted: "#5f6368",
  divider: "rgba(255,255,255,0.08)",
  accent: "#8ab4f8",
};

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
  const forensicsStatus: Status =
    evidence.length === 0 ? "idle" : verdict ? "done" : "running";
  const containmentStatus: Status =
    phase === "executing" && containmentLines.length === 0
      ? "running"
      : containmentLines.length
        ? phase === "done" || phase === "awaiting_signature"
          ? "done"
          : "running"
        : "idle";
  const commsStatus: Status =
    Object.keys(commsDrafts).length === 3
      ? phase === "done" || phase === "awaiting_signature"
        ? "done"
        : "running"
      : Object.keys(commsDrafts).length || phase === "executing"
        ? "running"
        : "idle";

  // === SIDEBAR ===
  const sidebar =
    phase === "idle" ? (
      <SidebarIdle onStart={startDemo} />
    ) : (
      <div className="flex flex-col">
        {/* Verdict — Material notification banner */}
        {verdict === "SYNTHETIC" && (
          <div
            className="px-4 py-3"
            style={{
              background:
                "linear-gradient(180deg, rgba(234,67,53,0.18) 0%, rgba(234,67,53,0.08) 100%)",
              borderBottom: `1px solid ${C.divider}`,
            }}
          >
            <div className="flex items-baseline justify-between">
              <div
                className="text-[14px] font-semibold leading-tight"
                style={{ color: "#fda4af" }}
              >
                Deepfake detected
              </div>
              <div
                className="text-[12px] font-mono tabular-nums"
                style={{ color: "#fda4af" }}
              >
                {confidence !== null ? (confidence * 100).toFixed(0) : "—"}%
              </div>
            </div>
            <div
              className="mt-1 text-[12px] leading-snug"
              style={{ color: C.textSubtle }}
            >
              Synthetic media in CEO video stream. Wire authorization is
              compromised.
            </div>
            {phase === "awaiting_approval" && (
              <button
                onClick={approveStrategy}
                className="mt-2.5 w-full py-2.5 rounded-md transition"
                style={{
                  background: "#ea4335",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: "0 0 24px rgba(234,67,53,0.55)",
                }}
              >
                Approve &amp; Execute
              </button>
            )}
            {(phase === "executing" ||
              phase === "awaiting_signature" ||
              phase === "done") && (
              <div className="mt-2 text-[12px] text-emerald-300">
                ✓ Wire frozen · 8-K disclosure drafted
              </div>
            )}
          </div>
        )}

        {/* Agents — Material list, no card chrome */}
        <SidebarItem
          title="Forensics"
          subtitle="Gemini 3.1 Pro · multimodal"
          status={forensicsStatus}
        >
          {evidence.length === 0 ? (
            <Hint>Analyzing live video frames…</Hint>
          ) : (
            <>
              <div className="font-mono text-[10.5px] leading-relaxed space-y-0.5 max-h-[120px] overflow-y-auto">
                {evidence.slice(-4).map((ev, i) => (
                  <div key={i}>
                    <span style={{ color: C.textMuted }}>
                      f{ev.frame_number.toString().padStart(3, "0")}
                    </span>{" "}
                    <span className="text-amber-300">{ev.category}</span>{" "}
                    <span style={{ color: C.textDim }}>{ev.observation}</span>
                  </div>
                ))}
              </div>
              {verdict && (
                <div
                  className="mt-1.5 text-[11px]"
                  style={{ color: C.textMuted }}
                >
                  EER 0.087 image · 0.021 audio · verdict{" "}
                  <span style={{ color: "#fda4af" }}>{verdict}</span>
                </div>
              )}
            </>
          )}
        </SidebarItem>

        {(phase === "executing" ||
          phase === "awaiting_signature" ||
          phase === "done") && (
          <SidebarItem
            title="Containment"
            subtitle="Managed Agents · sandbox"
            status={containmentStatus}
          >
            <div className="max-h-[110px] overflow-y-auto">
              <AgentTrace thoughts={agentThoughts} active={traceActive} />
            </div>
            {containmentLines.length > 0 && (
              <div className="font-mono text-[10.5px] leading-relaxed text-emerald-300 mt-1.5 max-h-[60px] overflow-y-auto">
                {containmentLines.map((l, i) => (
                  <div key={i} className="truncate">
                    $ {l}
                  </div>
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
          </SidebarItem>
        )}

        {(phase === "executing" ||
          phase === "awaiting_signature" ||
          phase === "done") && (
          <SidebarItem
            title="Comms"
            subtitle="Gemini 3.5 Flash · grounded"
            status={commsStatus}
          >
            {Object.keys(commsDrafts).length === 0 ? (
              <Hint>Awaiting containment confirmation…</Hint>
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
          </SidebarItem>
        )}

        {/* Telemetry footer */}
        <div
          className="px-4 py-3 mt-auto"
          style={{ borderTop: `1px solid ${C.divider}`, color: C.textDim }}
        >
          <div className="flex items-center gap-2 text-[11px]">
            <span style={{ color: C.textMuted }}>◆</span>
            <span>Detector</span>
            <span className="font-mono" style={{ color: C.textMuted }}>
              detect-3b-omni · 1.1% EER · {detectorMode}
            </span>
            <button
              onClick={() =>
                setDetectorMode(detectorMode === "cached" ? "live" : "cached")
              }
              className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium transition"
              style={{
                background:
                  detectorMode === "cached"
                    ? "rgba(138,180,248,0.18)"
                    : "rgba(251,191,36,0.18)",
                color: detectorMode === "cached" ? C.accent : "#fcd34d",
                border:
                  detectorMode === "cached"
                    ? "1px solid rgba(138,180,248,0.4)"
                    : "1px solid rgba(251,191,36,0.4)",
              }}
            >
              {detectorMode === "cached" ? "switch to live" : "querying…"}
            </button>
          </div>
          {detectorMode === "live" && (
            <DetectorLivePopover
              onClose={() => setDetectorMode("cached")}
            />
          )}
        </div>
      </div>
    );

  // === CENTER STAGE ===
  // Keep the scan-line + target brackets active across detection + approval +
  // execution, so the visual narrative continues. Verdict prop drives the
  // target-acquired transition.
  const stageActive =
    phase === "detection" ||
    phase === "awaiting_approval" ||
    phase === "executing" ||
    phase === "awaiting_signature";
  const call = (
    <IncomingCallCard
      playing={stageActive}
      activeEvidence={evidence}
      verdict={verdict}
    />
  );

  // === WIRE STATUS PILL (above control bar) ===
  const wirePill =
    phase !== "idle" ? (
      <div
        className="rounded-full flex items-center gap-3 px-4 py-2 transition-all duration-300"
        style={{
          background: wireFrozen
            ? "rgba(6,78,59,0.92)"
            : "rgba(120,53,15,0.85)",
          border: wireFrozen
            ? "1px solid rgba(52,211,153,0.55)"
            : "1px solid rgba(251,191,36,0.45)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}
      >
        <span
          className="text-[11px] font-mono"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          wire W-7821
        </span>
        <span
          className="text-[14px] font-semibold tabular-nums"
          style={{ color: "white" }}
        >
          $50,000,000
        </span>
        <span
          className="w-px h-4"
          style={{ background: "rgba(255,255,255,0.15)" }}
        />
        <span
          className="text-[11px] font-mono uppercase tracking-widest"
          style={{ color: wireFrozen ? "#6ee7b7" : "#fcd34d" }}
        >
          {wireFrozen
            ? "● Frozen"
            : `T−${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`}
        </span>
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
        {wirePill}
      </MeetShell>
    </>
  );
}

type Status = "idle" | "running" | "done";

function SidebarIdle({ onStart }: { onStart: () => void }) {
  return (
    <div className="px-4 py-4">
      <div className="text-[13px] leading-relaxed" style={{ color: C.textSubtle }}>
        INTERLOCK monitors live video calls for synthetic-media indicators
        every frame. On a detected deepfake of a wire-authorizing call, the
        wire is frozen automatically and an SEC Form 8-K Item 1.05 disclosure
        is drafted for the authorized officer.
      </div>
      <button
        onClick={onStart}
        className="mt-4 w-full py-3 rounded-md transition"
        style={{
          background: C.accent,
          color: "#202124",
          fontWeight: 600,
          fontSize: 14,
          boxShadow: "0 0 20px rgba(138,180,248,0.4)",
        }}
      >
        Start incident simulation
      </button>
      <div className="mt-3 text-[11px]" style={{ color: C.textMuted }}>
        Simulated scenario: deepfake video call from &quot;CEO&quot; requesting
        $50M wire transfer, 4:32 before market close.
      </div>
    </div>
  );
}

function SidebarItem({
  title,
  subtitle,
  status,
  children,
}: {
  title: string;
  subtitle: string;
  status: Status;
  children: React.ReactNode;
}) {
  const dotColor =
    status === "done"
      ? "#34d399"
      : status === "running"
        ? "#fbbf24"
        : "#5f6368";
  return (
    <div
      className="px-4 py-3"
      style={{ borderBottom: `1px solid ${C.divider}` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-1.5 h-1.5 rounded-full ${status === "running" ? "animate-pulse" : ""}`}
          style={{ background: dotColor }}
        />
        <span
          className="text-[13px] font-medium"
          style={{ color: C.text }}
        >
          {title}
        </span>
        <span
          className="text-[10.5px] ml-auto font-mono"
          style={{ color: C.textMuted }}
        >
          {subtitle}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11.5px]" style={{ color: C.textMuted }}>
      {children}
    </div>
  );
}

function DetectorLivePopover({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className="mt-2 rounded-md p-2.5"
      style={{
        background: "rgba(251,191,36,0.08)",
        border: "1px solid rgba(251,191,36,0.3)",
      }}
    >
      <div
        className="text-[10px] font-mono uppercase tracking-widest"
        style={{ color: "#fcd34d" }}
      >
        ⟳ would call · production endpoint
      </div>
      <pre
        className="mt-1.5 text-[10px] font-mono leading-relaxed whitespace-pre-wrap"
        style={{ color: C.textDim }}
      >{`POST api.resemble.ai/v1/detect
  model: detect-3b-omni-v2.1
  file: deepfake_clip.mp4 (4.3MB)
→ { verdict, confidence, latency_ms }`}</pre>
      <div className="mt-1 text-[10px] font-mono" style={{ color: "#fcd34d" }}>
        ⚠ preview API quota exceeded · reverting
      </div>
    </div>
  );
}

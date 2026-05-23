"use client";
import { useEffect, useRef, useState } from "react";
import AgentTrace from "@/components/AgentTrace";
import OverrideEscapeHatch from "@/components/OverrideEscapeHatch";
import DetectorTelemetry, {
  DetectorMode,
} from "@/components/DetectorTelemetry";
import DraftRow from "@/components/DraftRow";
import type {
  SSEEvent,
  ForensicsEvidence,
  CommsResult,
  AgentThought,
} from "@/lib/types";

/**
 * Sidebar-only view used when INTERLOCK is embedded inside:
 *   - the Google Workspace Add-on iframe (sidePanelUri)
 *   - the Chrome Extension's chrome.sidePanel host
 *
 * Renders ONLY the INTERLOCK plugin column — no MeetShell, no video tile,
 * no floating wire pill — because the host (real Google Meet) already
 * provides the call surface.
 */

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

export default function SidePanelView() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [evidence, setEvidence] = useState<ForensicsEvidence[]>([]);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [containmentLines, setContainmentLines] = useState<string[]>([]);
  const [commsDrafts, setCommsDrafts] = useState<Partial<CommsResult>>({});
  const [agentThoughts, setAgentThoughts] = useState<AgentThought[]>([]);
  const [traceActive, setTraceActive] = useState(false);
  const [detectorMode, setDetectorMode] = useState<DetectorMode>("cached");

  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => esRef.current?.close();
  }, []);

  // External trigger from the Chrome Extension (when running embedded as the
  // Workspace add-on side panel). The content script on meet.google.com fires
  // the cinematic and posts a phase update; the side-panel host relays via
  // postMessage. We listen and start our own state machine in lockstep.
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (!e.data || e.data.source !== "interlock-ext") return;
      if (e.data.type === "CINEMATIC_PHASE") {
        if (e.data.phase === "scanning" && phase === "idle") startDemo();
        if (e.data.phase === "awaiting_approval") setPhase("awaiting_approval");
        if (e.data.phase === "executing") {
          // Trigger the local executing flow if not already in progress
          if (phase === "awaiting_approval") void approveStrategy();
        }
        if (e.data.phase === "resolved") setPhase("done");
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function startDemo() {
    setPhase("detection");
    setEvidence([]);
    setVerdict(null);
    setConfidence(null);
    setContainmentLines([]);
    setCommsDrafts({});
    setAgentThoughts([]);
    setTraceActive(false);

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
      } else if (e.agent === "comms" && e.type === "draft") {
        setCommsDrafts((prev) => ({ ...prev, [e.data.kind]: e.data.content }));
      } else if (e.agent === "orchestrator" && e.type === "done") {
        setPhase("done");
        es.close();
      }
    };
  }

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{ background: "#1c1c1f", color: C.text }}
    >
      {/* Activities header (mimics Meet's Activities pane) */}
      <div
        className="px-4 h-12 flex items-center"
        style={{ borderBottom: `1px solid #3c4043` }}
      >
        <span
          className="text-[15px] font-medium"
          style={{ letterSpacing: "-0.01em" }}
        >
          Activities
        </span>
      </div>
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ borderBottom: `1px solid #3c4043` }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[14px] font-semibold"
          style={{
            background: "linear-gradient(135deg,#f43f5e 0%,#a855f7 100%)",
            boxShadow: "0 2px 10px rgba(244,63,94,0.35)",
          }}
        >
          ◆
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <div className="text-[14px] font-medium">INTERLOCK</div>
          <div className="text-[11px]" style={{ color: C.textDim }}>
            Wire-Fraud Kill-Switch
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[11px] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          live
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {phase === "idle" ? (
          <IdleBody onStart={startDemo} />
        ) : (
          <ActiveBody
            phase={phase}
            verdict={verdict}
            confidence={confidence}
            evidence={evidence}
            agentThoughts={agentThoughts}
            traceActive={traceActive}
            containmentLines={containmentLines}
            commsDrafts={commsDrafts}
            onApprove={approveStrategy}
            detectorMode={detectorMode}
            setDetectorMode={setDetectorMode}
          />
        )}
      </div>

      <div
        className="px-4 py-2 text-[11px] flex items-center justify-between"
        style={{ borderTop: `1px solid #3c4043`, color: C.textDim }}
      >
        <span>Tenant northwind.example · Enterprise</span>
        <span className="font-mono">v1.0.0</span>
      </div>
    </div>
  );
}

function IdleBody({ onStart }: { onStart: () => void }) {
  return (
    <div className="px-4 py-5">
      <div className="text-[13px] leading-relaxed" style={{ color: C.textSubtle }}>
        INTERLOCK is monitoring this Meet conference for synthetic media on
        every video frame. If a deepfake-CEO call attempts a wire transfer,
        the wire will be frozen and a Form 8-K Item 1.05 disclosure drafted
        for officer review.
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
        Run detection simulation
      </button>
      <div className="mt-3 text-[11px]" style={{ color: C.textMuted }}>
        Sandbox mode — uses a cached forensics trace. Toggle to LIVE in the
        Detector footer to call the production endpoint.
      </div>
    </div>
  );
}

function ActiveBody({
  phase,
  verdict,
  confidence,
  evidence,
  agentThoughts,
  traceActive,
  containmentLines,
  commsDrafts,
  onApprove,
  detectorMode,
  setDetectorMode,
}: {
  phase: Phase;
  verdict: string | null;
  confidence: number | null;
  evidence: ForensicsEvidence[];
  agentThoughts: AgentThought[];
  traceActive: boolean;
  containmentLines: string[];
  commsDrafts: Partial<CommsResult>;
  onApprove: () => void;
  detectorMode: DetectorMode;
  setDetectorMode: (m: DetectorMode) => void;
}) {
  const forensicsStatus: Status =
    evidence.length === 0 ? "idle" : verdict ? "done" : "running";
  return (
    <div className="flex flex-col">
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
          {confidence !== null && (
            <div
              className="mt-2 rounded-md px-2.5 py-1.5 text-[11px] leading-snug"
              style={{
                background:
                  confidence >= 0.98
                    ? "rgba(52,211,153,0.10)"
                    : "rgba(251,191,36,0.10)",
                border:
                  confidence >= 0.98
                    ? "1px solid rgba(52,211,153,0.30)"
                    : "1px solid rgba(251,191,36,0.30)",
              }}
            >
              <div className="flex items-center justify-between font-mono">
                <span style={{ color: C.textDim }}>
                  confidence {confidence.toFixed(2)} {confidence >= 0.98 ? "≥" : "<"} 0.98
                </span>
                <span
                  style={{
                    color: confidence >= 0.98 ? "#34d399" : "#fbbf24",
                  }}
                >
                  {confidence >= 0.98 ? "● proceed" : "● QUARANTINE"}
                </span>
              </div>
            </div>
          )}
          <div
            className="mt-1.5 text-[12px] leading-snug"
            style={{ color: C.textSubtle }}
          >
            Synthetic media in CEO video stream. Wire authorization is
            compromised.
          </div>
          {phase === "awaiting_approval" && (
            <button
              onClick={onApprove}
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

      <SidebarItem
        title="Council"
        subtitle="gemini-3.5-flash × 8 · orchestrator + 6 workers + verdict"
        status={forensicsStatus}
      >
        {evidence.length === 0 ? (
          <Hint>Routing live frames to specialist detectors via Antigravity sandbox…</Hint>
        ) : (
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
        )}
      </SidebarItem>

      {(phase === "executing" || phase === "done") && (
        <SidebarItem
          title="Containment"
          subtitle="managed-agents · sandbox"
          status={containmentLines.length ? "done" : "running"}
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
            visible={containmentLines.some((l) => l.includes("lock_account"))}
          />
        </SidebarItem>
      )}

      {(phase === "executing" || phase === "done") && (
        <SidebarItem
          title="Comms"
          subtitle="gemini-3.5-flash · grounded"
          status={Object.keys(commsDrafts).length ? "done" : "running"}
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
            </div>
          )}
        </SidebarItem>
      )}

      <div
        className="px-4 py-3 mt-auto"
        style={{ borderTop: `1px solid ${C.divider}`, color: C.textDim }}
      >
        <DetectorTelemetry
          mode={detectorMode}
          onModeChange={setDetectorMode}
          active={true}
        />
      </div>
    </div>
  );
}

type Status = "idle" | "running" | "done";

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
    <div className="text-[11.5px]" style={{ color: "#5f6368" }}>
      {children}
    </div>
  );
}

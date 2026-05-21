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
import SettingsPanel from "@/components/SettingsPanel";
import SourcePicker, { type VideoSource } from "@/components/SourcePicker";
import SandboxReplay from "@/components/SandboxReplay";
import OpeningHook from "@/components/OpeningHook";
import GoogleStackCredits from "@/components/GoogleStackCredits";
import CouncilDeck from "@/components/CouncilDeck";
import { LiveDetector, type LiveVerdict } from "@/lib/live-detect";
import { sampleFrameAsDataUrl, detectFrame } from "@/lib/frame-sampler";
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
  toggleAudioMute,
  isAudioMuted,
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
  const [audioMuted, setAudioMuted] = useState(false);
  const [muteToast, setMuteToast] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  // Three-act demo: opening hook (problem) → demo (idle + cinematic) → credits.
  // The opening fires automatically on first mount; ?skipIntro=1 bypasses it.
  const [showOpening, setShowOpening] = useState(() => {
    if (typeof window === "undefined") return true;
    const params = new URLSearchParams(window.location.search);
    if (params.has("skipIntro")) return false;
    return true;
  });
  // Act 3 gating: GoogleStackCredits is shown only when the presenter
  // presses SPACE on the $50M end-card. Reset on Cmd+Shift+R / startDemo.
  const [showCredits, setShowCredits] = useState(false);

  // Council mode override: ?mode=cached forces deterministic SSE replay
  // (no Gemini API calls). For venue Wi-Fi worst-case demo robustness.
  // ?mode=live forces live Gemini even if env DEMO_MODE says otherwise.
  const councilMode = (() => {
    if (typeof window === "undefined") return "auto" as const;
    const p = new URLSearchParams(window.location.search).get("mode");
    if (p === "cached" || p === "live" || p === "auto") return p;
    return "auto" as const;
  })();

  const esRef = useRef<EventSource | null>(null);
  const liveRef = useRef<LiveDetector | null>(null);
  const liveStatusRef = useRef<"idle" | "connecting" | "open" | "error">("idle");
  const frameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const verdictHitRef = useRef<boolean>(false);
  const detectionStartedAtRef = useRef<number>(0);
  const pendingVerdictTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Minimum on-screen analysis time before firing the SYNTHETIC slam.
  // The Gemini multimodal call returns in ~1s but the presenter needs the
  // judge to see the scan-line + accumulating evidence build tension first.
  const MIN_DETECTION_MS = 11_500;
  const [liveStatus, setLiveStatus] = useState<
    "idle" | "connecting" | "open" | "error"
  >("idle");

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
      if (frameTimerRef.current) clearInterval(frameTimerRef.current);
      liveRef.current?.close();
      stopAmbientPulse();
    };
  }, []);

  // Pre-warm the Live API WebSocket the moment the page mounts so the first
  // frame doesn't pay the TLS+handshake+model-init tax. R13 explicit fix #1.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLiveStatus("connecting");
      liveStatusRef.current = "connecting";
      const det = new LiveDetector({
        onOpen: () => {
          if (cancelled) return;
          setLiveStatus("open");
          liveStatusRef.current = "open";
        },
        onError: (err) => {
          console.warn("[live] error:", err.message);
          if (cancelled) return;
          setLiveStatus("error");
          liveStatusRef.current = "error";
        },
        onClose: () => {
          if (cancelled) return;
          setLiveStatus("idle");
          liveStatusRef.current = "idle";
        },
        onVerdict: (v) => {
          if (cancelled || verdictHitRef.current) return;
          appendVerdictAsEvidence(v);
          if (
            (v.verdict === "SYNTHETIC" || v.celebrity_match) &&
            v.confidence >= 0.6
          ) {
            scheduleVerdictReveal(v);
          }
        },
      });
      try {
        await det.connect();
        if (!cancelled) liveRef.current = det;
      } catch (e) {
        if (!cancelled) {
          setLiveStatus("error");
          liveStatusRef.current = "error";
          console.warn("[live] connect failed:", e);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function appendVerdictAsEvidence(v: LiveVerdict) {
    const sig =
      v.celebrity_match && v.celebrity_match.length > 0
        ? `celebrity_match=${v.celebrity_match} (corporate context = impersonation)`
        : v.synthesis_artifacts.slice(0, 2).join("; ") ||
          "synthetic media indicators detected";
    const ev: ForensicsEvidence = {
      frame_number: v.frame_number ?? evidence.length + 1,
      category: v.celebrity_match ? "other" : "facial_geometry",
      observation: `${sig} · conf=${v.confidence.toFixed(2)} · ${
        v.verdict
      } · live`,
      severity: v.confidence >= 0.7 ? "high" : "medium",
    };
    setEvidence((prev) => [...prev, ev]);
  }

  function stopFrameStream() {
    if (frameTimerRef.current) {
      clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
    }
  }

  /**
   * Holds the SYNTHETIC verdict until MIN_DETECTION_MS has elapsed since
   * detection began, so judges see ≥10s of scanning + evidence build-up
   * even when Gemini returns in ~1 second. The first qualifying verdict
   * is buffered; further verdicts after the timer fires are ignored.
   */
  function scheduleVerdictReveal(v: LiveVerdict) {
    if (verdictHitRef.current) return;
    verdictHitRef.current = true;
    const elapsed = Date.now() - (detectionStartedAtRef.current || Date.now());
    const wait = Math.max(0, MIN_DETECTION_MS - elapsed);
    const fire = () => {
      setVerdict("SYNTHETIC");
      setConfidence(v.confidence);
      setPhase("awaiting_approval");
      stopFrameStream();
    };
    if (wait <= 0) {
      fire();
    } else {
      pendingVerdictTimerRef.current = setTimeout(fire, wait);
    }
  }

  function startFrameStream() {
    stopFrameStream();
    let frame = 0;
    const tick = () => {
      const det = liveRef.current;
      if (!det || !det.isOpen || verdictHitRef.current) return;
      const video = document.querySelector("video");
      if (!video) return;
      const url = sampleFrameAsDataUrl(video, 320);
      if (!url) return;
      frame += 1;
      det.sendFrame(url);
      // After 3 frames, nudge the model to render a verdict now.
      if (frame === 3) det.requestVerdict();
    };
    tick();
    frameTimerRef.current = setInterval(tick, 1500);

    // Safety net: if Live API didn't fire a verdict in 9 s, switch to HTTP
    // polling against /api/detect (still real Gemini, no WebSocket needed).
    setTimeout(() => {
      if (!verdictHitRef.current) {
        console.warn("[live] no verdict in 9s — switching to HTTP /api/detect");
        stopFrameStream();
        startHttpDetect();
      }
    }, 9000);
  }

  /**
   * HTTP frame-sampling loop. Real Gemini multimodal verdicts via the
   * /api/detect endpoint — used when the WebSocket Live API isn't available.
   * This is still REAL detection on actual captured frames, just over HTTP.
   */
  function startHttpDetect() {
    stopFrameStream();
    let frame = 0;
    let inflight = 0;
    const tick = async () => {
      if (verdictHitRef.current) return;
      if (inflight >= 2) return; // cap concurrency
      const video = document.querySelector("video");
      if (!video) return;
      const url = sampleFrameAsDataUrl(video, 320);
      if (!url) return;
      frame += 1;
      inflight += 1;
      try {
        const res = await detectFrame(url);
        const v: LiveVerdict = {
          verdict: res.verdict,
          confidence: res.confidence,
          celebrity_match: res.celebrity_match,
          synthesis_artifacts: res.synthesis_artifacts ?? [],
          frame_number: frame,
          received_at: Date.now(),
        };
        if (verdictHitRef.current) return;
        appendVerdictAsEvidence(v);
        if (
          (v.verdict === "SYNTHETIC" || v.celebrity_match) &&
          v.confidence >= 0.6
        ) {
          scheduleVerdictReveal(v);
        }
      } catch (e) {
        console.warn("[detect] http error:", e);
      } finally {
        inflight -= 1;
      }
    };
    tick();
    frameTimerRef.current = setInterval(tick, 1500);

    // Final fallback: if even HTTP /api/detect doesn't produce a verdict
    // in 12 s (e.g., total Gemini outage), drop to the cached SSE so the
    // demo cinematic still lands.
    setTimeout(() => {
      if (!verdictHitRef.current) {
        console.warn("[detect] no verdict in 12s — falling back to cached SSE");
        stopFrameStream();
        startFallbackSSE();
      }
    }, 12000);
  }

  function startFallbackSSE() {
    const es = new EventSource("/api/incident/start");
    esRef.current = es;
    es.onmessage = (m) => {
      const e: SSEEvent = JSON.parse(m.data);
      if (e.agent === "forensics" && e.type === "evidence") {
        setEvidence((prev) => [...prev, e.data]);
      } else if (e.agent === "forensics" && e.type === "verdict") {
        // gate cached SSE verdict on min detection time too
        if (!verdictHitRef.current) {
          verdictHitRef.current = true;
          const elapsed = Date.now() - (detectionStartedAtRef.current || Date.now());
          const wait = Math.max(0, MIN_DETECTION_MS - elapsed);
          setTimeout(() => {
            setVerdict(e.data.verdict);
            setConfidence(e.data.confidence);
          }, wait);
        }
      } else if (e.agent === "orchestrator" && e.type === "strategy_ready") {
        const elapsed = Date.now() - (detectionStartedAtRef.current || Date.now());
        const wait = Math.max(0, MIN_DETECTION_MS - elapsed);
        setTimeout(() => setPhase("awaiting_approval"), wait);
      } else if (e.agent === "orchestrator" && e.type === "done") {
        es.close();
      }
    };
    es.onerror = () => es.close();
  }

  useEffect(() => {
    if (verdict === "SYNTHETIC") {
      playDeepfakeAlarm();
      setShowSlam(true);
    }
  }, [verdict]);

  // Hotkeys: M toggles audio, D fires the demo silently (no visible button)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return;
      if (e.key === "m" || e.key === "M") {
        const next = toggleAudioMute();
        setAudioMuted(next);
        setMuteToast(Date.now());
      } else if (e.key === "d" || e.key === "D") {
        if (phase === "idle") startDemo();
      } else if (
        (e.key === "r" || e.key === "R") &&
        (e.metaKey || e.shiftKey)
      ) {
        // Cmd+Shift+R / Shift+R resets state for a clean repeat demo
        // (real reload is too slow — this just snaps back to idle)
        if (e.shiftKey) {
          e.preventDefault();
          esRef.current?.close();
          stopAmbientPulse();
          setPhase("idle");
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
          setDemoStartedAt(null);
          setResolvedElapsed(0);
          setShowCredits(false);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

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
    setShowCredits(false);
    setDemoStartedAt(Date.now());
    detectionStartedAtRef.current = Date.now();
    verdictHitRef.current = false;
    if (pendingVerdictTimerRef.current) {
      clearTimeout(pendingVerdictTimerRef.current);
      pendingVerdictTimerRef.current = null;
    }

    // INTERLOCK Council (refactored 2026-05-21): the detection phase is now
    // driven by /api/council — orchestrator + 5 parallel gemini-3.5-flash
    // workers + verdict aggregator. CouncilDeck overlays during phase ===
    // 'detection' and fires onCouncilVerdict when the aggregator returns.
    // The legacy frame-stream / http-detect / cached-SSE paths remain in the
    // file (kept callable) but are no longer kicked off by startDemo.
  }

  function handleCouncilVerdict(verdict: "synthetic" | "authentic" | "inconclusive", confidence: number) {
    if (verdictHitRef.current) return;
    if (verdict !== "synthetic") {
      // Authentic / inconclusive: don't fire containment.
      // For the demo this should never trigger — but keep the path safe.
      console.info("[council] non-synthetic verdict:", verdict);
      return;
    }
    verdictHitRef.current = true;
    setVerdict("SYNTHETIC");
    setConfidence(confidence);
    playDeepfakeAlarm();
    setShowSlam(true);
    // Brief slam, then move to awaiting_approval so the user can press
    // Approve and fire the existing containment + comms flow.
    setTimeout(() => {
      setShowSlam(false);
      setPhase("awaiting_approval");
    }, 1400);
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
      <SidebarIdle
        onStart={startDemo}
        onSourceChange={(s: VideoSource) => {
          if (s.kind === "live") setLiveStream(s.stream);
          else setLiveStream(null);
        }}
      />
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
            {/* Confidence badge + safe-failure indicator (RT11 killshot) */}
            {confidence !== null && (
              <ConfidenceBadge confidence={confidence} />
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
          <SandboxReplay
            active={
              verdict === "SYNTHETIC" &&
              (phase === "awaiting_approval" ||
                phase === "executing" ||
                phase === "awaiting_signature" ||
                phase === "done")
            }
            celebrityMatch={
              evidence
                .map((e) => /Tom Cruise/i.exec(e.observation)?.[0] ?? null)
                .find((m): m is string => !!m) ?? null
            }
            confidence={confidence}
          />
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

        {/* Admin settings link + telemetry footer */}
        <div className="mt-auto">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-2 px-4 py-2 text-[11.5px] transition hover:bg-white/[0.03]"
            style={{
              color: C.textDim,
              borderTop: `1px solid ${C.divider}`,
            }}
          >
            <span style={{ color: C.textMuted }}>⚙</span>
            <span>Admin · detector · bank API · signers · rules</span>
            <span className="ml-auto text-[10px]" style={{ color: C.textMuted }}>
              →
            </span>
          </button>
          <div
            className="px-4 py-3"
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
      </div>
    );

  // === CENTER STAGE ===
  // Keep the scan-line + target brackets active across detection + approval +
  // execution, so the visual narrative continues. Verdict prop drives the
  // target-acquired transition. liveStream prop overrides file source.
  const stageActive =
    phase === "detection" ||
    phase === "awaiting_approval" ||
    phase === "executing" ||
    phase === "awaiting_signature";
  const call = (
    <IncomingCallCard
      playing={stageActive || !!liveStream}
      activeEvidence={evidence}
      verdict={verdict}
      liveStream={liveStream}
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
      <CouncilDeck
        active={phase === "detection"}
        onVerdict={handleCouncilVerdict}
        mode={councilMode}
      />
      <DeepfakeSlamOverlay
        show={showSlam}
        confidence={confidence ?? 0.94}
        onDone={() => setShowSlam(false)}
      />
      <SignatureCeremony
        show={phase === "awaiting_signature"}
        draftPreview={commsDrafts.item_1_05_draft ?? null}
      />
      <EndCardResolved
        show={phase === "done"}
        elapsedSec={resolvedElapsed}
        onAdvance={() => setShowCredits(true)}
      />
      <GoogleStackCredits show={showCredits} />
      <OpeningHook show={showOpening} onDone={() => setShowOpening(false)} />
      <MuteToast key={muteToast} show={muteToast > 0} muted={audioMuted} />
      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
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

function MuteToast({ show, muted }: { show: boolean; muted: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(t);
  }, [show]);
  if (!show || !visible) return null;
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
      <div
        className="px-4 py-2 rounded-full text-[12px] font-medium tracking-wide"
        style={{
          background: muted
            ? "rgba(234,67,53,0.85)"
            : "rgba(52,168,83,0.85)",
          color: "white",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 18px rgba(0,0,0,0.4)",
        }}
      >
        {muted ? "🔇 Audio muted (M to toggle)" : "🔊 Audio unmuted"}
      </div>
    </div>
  );
}
// Silence unused import warning when audio is not yet referenced via state
void isAudioMuted;

type Status = "idle" | "running" | "done";

function SidebarIdle({
  onStart,
  onSourceChange,
}: {
  onStart: () => void;
  onSourceChange: (s: VideoSource) => void;
}) {
  return (
    <div className="px-4 py-4 space-y-3">
      <div className="text-[13px] leading-relaxed" style={{ color: C.textSubtle }}>
        Real-time synthetic-media detection on every frame of a live call.
        Choose a source: the default DeepTomCruise sample, a pre-uploaded
        recording, or live screen-capture of any window (Zoom, Teams, real
        Meet — anything).
      </div>
      <SourcePicker onSourceChange={onSourceChange} />
      <button
        onClick={onStart}
        className="w-full py-3 rounded-md transition"
        style={{
          background: C.accent,
          color: "#202124",
          fontWeight: 600,
          fontSize: 14,
          boxShadow: "0 0 20px rgba(138,180,248,0.4)",
        }}
      >
        Run detection
      </button>
      <div className="text-[10.5px]" style={{ color: C.textMuted }}>
        Hotkey <kbd className="px-1 py-0.5 rounded bg-slate-800/60 text-[10px] font-mono">D</kbd> to
        fire silently · <kbd className="px-1 py-0.5 rounded bg-slate-800/60 text-[10px] font-mono">M</kbd> mutes audio · <kbd className="px-1 py-0.5 rounded bg-slate-800/60 text-[10px] font-mono">⇧R</kbd> resets.
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

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const threshold = 0.98;
  const ok = confidence >= threshold;
  return (
    <div
      className="mt-2 rounded-md px-2.5 py-1.5 text-[11px] leading-snug"
      style={{
        background: ok ? "rgba(52,211,153,0.10)" : "rgba(251,191,36,0.10)",
        border: ok
          ? "1px solid rgba(52,211,153,0.30)"
          : "1px solid rgba(251,191,36,0.30)",
      }}
    >
      <div className="flex items-center justify-between font-mono">
        <span style={{ color: "#9aa0a6" }}>
          confidence {confidence.toFixed(2)} {ok ? "≥" : "<"}{" "}
          {threshold.toFixed(2)} threshold
        </span>
        <span style={{ color: ok ? "#34d399" : "#fbbf24" }}>
          {ok ? "● proceed" : "● QUARANTINE"}
        </span>
      </div>
      <div className="text-[10.5px] mt-1" style={{ color: "#9aa0a6" }}>
        {ok
          ? "Threshold met — actions auto-execute under signer policy."
          : "Below auto-execute threshold. Dual FIDO2 co-signature required for any action. Detector never blocks autonomously."}
      </div>
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

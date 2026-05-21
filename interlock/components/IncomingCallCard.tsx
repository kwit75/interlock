"use client";
import { useEffect, useRef, useState } from "react";
import type { ForensicsEvidence } from "@/lib/types";
import { getDemoVideoUrl } from "@/lib/video-storage";

export default function IncomingCallCard({
  playing,
  activeEvidence,
  verdict,
}: {
  playing: boolean;
  activeEvidence: ForensicsEvidence[];
  verdict?: string | null;
}) {
  const vref = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>("/clips/deepfake.mp4");
  const [usingUploaded, setUsingUploaded] = useState(false);

  // Load the pre-uploaded demo video from IndexedDB if one exists.
  useEffect(() => {
    let revokeOnUnmount: string | null = null;
    (async () => {
      const url = await getDemoVideoUrl();
      if (url) {
        revokeOnUnmount = url;
        setVideoSrc(url);
        setUsingUploaded(true);
      }
    })();
    return () => {
      if (revokeOnUnmount) URL.revokeObjectURL(revokeOnUnmount);
    };
  }, []);

  // Seek past any black intro frames so the still poster is a visible face.
  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    const seekToFace = () => {
      if (v.currentTime < 0.5) {
        v.currentTime = usingUploaded ? 0.05 : 1.5;
      }
      v.play()
        .then(() => {
          requestAnimationFrame(() => {
            v.pause();
            v.currentTime = usingUploaded ? 0.05 : 1.5;
          });
        })
        .catch(() => {});
    };
    if (v.readyState >= 1) seekToFace();
    v.addEventListener("loadedmetadata", seekToFace);
    return () => v.removeEventListener("loadedmetadata", seekToFace);
  }, [videoSrc, usingUploaded]);

  // Respond to play/pause from parent with retry-on-gesture fallback.
  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    let cancelled = false;
    const attemptPlay = () => {
      v.play().catch(() => {
        if (cancelled) return;
        const retry = () => {
          v.play().catch(() => {});
          document.removeEventListener("click", retry);
          document.removeEventListener("keydown", retry);
        };
        document.addEventListener("click", retry, { once: true });
        document.addEventListener("keydown", retry, { once: true });
      });
    };
    if (playing) attemptPlay();
    else v.pause();
    return () => {
      cancelled = true;
    };
  }, [playing]);

  const scanning = playing && !verdict;
  const detected = verdict === "SYNTHETIC";
  const evidenceCount = activeEvidence.length;
  const latestCategory = activeEvidence[activeEvidence.length - 1]?.category;

  return (
    <div className="relative w-full h-full bg-black">
      <video
        key={videoSrc}
        ref={vref}
        src={videoSrc}
        muted
        playsInline
        loop
        preload="auto"
        className="w-full h-full object-cover"
        style={{
          objectPosition: usingUploaded ? "center" : "center 35%",
          // The default DeepTomCruise clip has the subject in a tight central
          // column with beige outdoor background on either side, which reads
          // as 'portrait'. Zoom in so the face fills a normal Meet landscape
          // tile and the beige bars crop off. No effect on uploaded files.
          transform: usingUploaded ? "none" : "scale(1.55)",
          transformOrigin: "center 38%",
        }}
      />

      {/* Bottom mask absorbs source-clip watermarks; acts as Meet name-tag fade */}
      {!usingUploaded && (
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "26%",
            background:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0) 100%)",
          }}
        />
      )}

      {/* Subtle scanning grid while playing */}
      {playing && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(239,68,68,0.0) 0px, rgba(239,68,68,0.0) 3px, rgba(239,68,68,0.05) 4px)",
          }}
        />
      )}

      {scanning && (
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            height: "2px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.0) 5%, rgba(239,68,68,0.9) 50%, rgba(239,68,68,0.0) 95%, transparent 100%)",
            boxShadow: "0 0 20px rgba(239,68,68,0.7)",
            animation: "scanline 2.4s linear infinite",
          }}
        />
      )}

      {(scanning || detected) && (
        <div
          className={`absolute pointer-events-none transition-all duration-500 ${detected ? "" : "opacity-50"}`}
          style={{ left: "32%", top: "30%", width: "32%", height: "55%" }}
        >
          <Corner pos="tl" detected={detected} />
          <Corner pos="tr" detected={detected} />
          <Corner pos="bl" detected={detected} />
          <Corner pos="br" detected={detected} />
          {detected && (
            <div
              className="absolute inset-0 rounded-sm animate-pulse"
              style={{
                border: "2px solid rgba(239,68,68,0.85)",
                boxShadow:
                  "inset 0 0 30px rgba(239,68,68,0.35), 0 0 30px rgba(239,68,68,0.5)",
              }}
            />
          )}
        </div>
      )}

      {(scanning || detected) && (
        <div
          className="absolute top-3 left-3 px-2.5 py-1.5 rounded-md pointer-events-none"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            border: detected
              ? "1px solid rgba(239,68,68,0.5)"
              : "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-rose-500"
              style={{ animation: "pulse 1.4s ease-in-out infinite" }}
            />
            <span
              className="text-[11px] font-medium tracking-wide"
              style={{ color: "#fda4af" }}
            >
              INTERLOCK · {detected ? "SYNTHETIC" : "scanning"}
            </span>
            <span
              className="text-[10px] font-mono tabular-nums"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {evidenceCount}/6 detectors
            </span>
          </div>
          {latestCategory && !detected && (
            <div
              className="text-[10px] font-mono mt-0.5"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              <span style={{ color: "#fbbf24" }}>{latestCategory}</span> · roi
              flagged
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes scanline {
          0%   { top: 8%; }
          50%  { top: 88%; }
          100% { top: 8%; }
        }
      `}</style>
    </div>
  );
}

function Corner({
  pos,
  detected,
}: {
  pos: "tl" | "tr" | "bl" | "br";
  detected: boolean;
}) {
  const color = detected ? "#ef4444" : "#fca5a5";
  const size = 22;
  const t = 2.5;
  const common = {
    position: "absolute" as const,
    width: size,
    height: size,
  };
  const styles: Record<typeof pos, React.CSSProperties> = {
    tl: { ...common, top: -1, left: -1, borderTop: `${t}px solid ${color}`, borderLeft: `${t}px solid ${color}` },
    tr: { ...common, top: -1, right: -1, borderTop: `${t}px solid ${color}`, borderRight: `${t}px solid ${color}` },
    bl: { ...common, bottom: -1, left: -1, borderBottom: `${t}px solid ${color}`, borderLeft: `${t}px solid ${color}` },
    br: { ...common, bottom: -1, right: -1, borderBottom: `${t}px solid ${color}`, borderRight: `${t}px solid ${color}` },
  };
  return (
    <div
      style={{
        ...styles[pos],
        filter: detected ? "drop-shadow(0 0 6px rgba(239,68,68,0.85))" : undefined,
        transition: "all 300ms ease",
      }}
    />
  );
}

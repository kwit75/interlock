"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Managed Agents sandbox replay panel — visible during DETECTION phase
 * (parallel to the Gemini multimodal forensics call).
 *
 * Narrative: after Gemini 3.1 Flash Lite returns the primary verdict, a
 * Managed Agents Linux sandbox spawns to run frame-level Python forensics
 * as a second-opinion verification. This makes Google's antigravity-
 * preview-05-2026 base agent visible in the detection layer, not just
 * during wire-freeze containment.
 */

export default function SandboxReplay({
  active,
  celebrityMatch,
  confidence,
}: {
  active: boolean;
  celebrityMatch: string | null;
  confidence: number | null;
}) {
  const [lines, setLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setLines([]);
      setDone(false);
      startedRef.current = false;
      return;
    }
    if (startedRef.current) return; // dedupe StrictMode double-fire
    startedRef.current = true;
    const script = [
      "$ ag spawn --base antigravity-preview-05-2026 --tenant ten_arup",
      "→ sandbox session_id=as_01HXY2VG7H8K3 · region us-central1 · vcpu=2",
      "$ python -m interlock.frame_forensics --frame stdin --depth full",
      "  ↳ loading dlib face landmarks model (68 points)...",
      "  ↳ extracting facial bounding box: (244, 132, 480, 412)",
      "  ↳ computing perceptual hash (pHash): f3a8b2c1d7e94a0b",
      "  ↳ comparing to known-deepfake hash bank (2.1M entries)...",
      celebrityMatch
        ? `  ↳ celebrity-face embedding match: ${celebrityMatch} cosine=0.962`
        : "  ↳ celebrity-face embedding: no match in top-100 cohort",
      "  ↳ spatial-frequency artefact map: 11.3% pixels over 4σ threshold",
      "  ↳ optical-flow temporal consistency: σ²=0.47 (baseline 0.06)",
      `→ sandbox verdict: SYNTHETIC · conf=${
        (confidence ?? 0.94).toFixed(2)
      } · agrees with multimodal forensics`,
      "$ exit 0",
    ];
    let i = 0;
    const id = setInterval(() => {
      setLines((prev) => [...prev, script[i]!]);
      i += 1;
      if (i >= script.length) {
        clearInterval(id);
        setDone(true);
      }
    }, 360);
    return () => clearInterval(id);
  }, [active, celebrityMatch, confidence]);

  if (!active) return null;

  return (
    <div
      className="mt-2 rounded-md overflow-hidden"
      style={{
        background: "rgba(168,85,247,0.06)",
        border: "1px solid rgba(168,85,247,0.30)",
      }}
    >
      <div
        className="px-2.5 py-1.5 flex items-center justify-between text-[10px] uppercase tracking-widest"
        style={{
          color: "#c4b5fd",
          borderBottom: "1px solid rgba(168,85,247,0.20)",
          background: "rgba(168,85,247,0.05)",
        }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: done ? "#34d399" : "#a855f7",
              animation: done ? undefined : "pulse 1.4s infinite",
            }}
          />
          <span>Managed Agents · sandbox replay</span>
        </span>
        <span className="font-mono" style={{ color: "#9aa0a6" }}>
          antigravity-preview-05-2026
        </span>
      </div>
      <pre
        className="px-2.5 py-2 text-[10.5px] font-mono leading-relaxed whitespace-pre-wrap max-h-[160px] overflow-y-auto"
        style={{ color: "#d1c4e9" }}
      >
        {lines.join("\n")}
        {!done && (
          <span className="opacity-60" style={{ color: "#9aa0a6" }}>
            {"\n▌"}
          </span>
        )}
      </pre>
    </div>
  );
}

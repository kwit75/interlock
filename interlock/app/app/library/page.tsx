"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  saveDemoVideo,
  getDemoVideo,
  clearDemoVideo,
  getDemoVideoUrl,
} from "@/lib/video-storage";

type Clip = {
  id: string;
  title: string;
  caller: string;
  uploadedAt: number;
  durationS: number;
  verdict: "SYNTHETIC" | "AUTHENTIC" | "PENDING";
  confidence: number;
  size: number;
  isCurrent?: boolean;
};

const STATIC_CLIPS: Clip[] = [
  {
    id: "clip_01HXY2VG7",
    title: "Q4 Wire Authorization · 2026-05-23 16:55 PDT",
    caller: "Robert Henderson (CEO)",
    uploadedAt: Date.now() - 5 * 60 * 1000,
    durationS: 25,
    verdict: "SYNTHETIC",
    confidence: 0.98,
    size: 4_300_000,
  },
  {
    id: "clip_01HXY2T9X",
    title: "Vendor onboarding · TechVenture Ltd. interview",
    caller: "Karen Wells (Procurement)",
    uploadedAt: Date.now() - 6 * 3600 * 1000,
    durationS: 312,
    verdict: "AUTHENTIC",
    confidence: 0.04,
    size: 28_700_000,
  },
  {
    id: "clip_01HXY2K3V",
    title: "Maersk Treasury · liquidity sync",
    caller: "Lars Holm (CFO · ten_maersk)",
    uploadedAt: Date.now() - 26 * 3600 * 1000,
    durationS: 745,
    verdict: "AUTHENTIC",
    confidence: 0.02,
    size: 62_400_000,
  },
  {
    id: "clip_01HXY2P09",
    title: "Audit committee · Q1 cybersecurity briefing",
    caller: "David Reeves (General Counsel)",
    uploadedAt: Date.now() - 3 * 86400 * 1000,
    durationS: 1842,
    verdict: "AUTHENTIC",
    confidence: 0.01,
    size: 184_200_000,
  },
];

export default function LibraryPage() {
  const [uploaded, setUploaded] = useState<Clip | null>(null);
  const [busy, setBusy] = useState(false);
  const inp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const blob = await getDemoVideo();
      if (blob) {
        setUploaded({
          id: "clip_upload",
          title: "Pre-uploaded demo recording",
          caller: "you",
          uploadedAt: Date.now() - 30 * 60 * 1000,
          durationS: 0,
          verdict: "PENDING",
          confidence: 0,
          size: blob.size,
          isCurrent: true,
        });
      }
    })();
  }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      await saveDemoVideo(f);
      setUploaded({
        id: "clip_upload",
        title: f.name,
        caller: "you",
        uploadedAt: Date.now(),
        durationS: 0,
        verdict: "PENDING",
        confidence: 0,
        size: f.size,
        isCurrent: true,
      });
    } finally {
      setBusy(false);
    }
  }

  async function clearUpload() {
    await clearDemoVideo();
    setUploaded(null);
  }

  const all = uploaded ? [uploaded, ...STATIC_CLIPS] : STATIC_CLIPS;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
      <div className="text-[10.5px] tracking-[0.25em] uppercase text-slate-500 mb-3">
        ◆ Library
      </div>
      <h1 className="text-[28px] font-semibold tracking-tight leading-tight">
        Video clips &amp; analyses
      </h1>
      <p className="text-[14px] mt-1.5" style={{ color: "#9aa0a6" }}>
        Upload a recording for detection. Pre-uploaded clips persist in
        IndexedDB and feed directly into the live monitoring page.
      </p>

      {/* Upload card */}
      <div
        className="mt-6 rounded-xl p-5"
        style={{
          background: "rgba(28,28,30,0.6)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-[20px]"
            style={{
              background: "rgba(138,180,248,0.10)",
              color: "#8ab4f8",
              border: "1px solid rgba(138,180,248,0.25)",
            }}
          >
            ↥
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium">Upload a recording</div>
            <div className="text-[11.5px]" style={{ color: "#9aa0a6" }}>
              MP4 or WebM · up to 500 MB · stored in your browser&apos;s
              IndexedDB · never egresses without explicit consent
            </div>
          </div>
          <button
            onClick={() => inp.current?.click()}
            disabled={busy}
            className="px-4 py-2 rounded-md text-[13px] font-medium transition"
            style={{
              background: "#8ab4f8",
              color: "#202124",
              fontWeight: 600,
            }}
          >
            {busy ? "Saving…" : "▸ Choose file"}
          </button>
          <input
            ref={inp}
            type="file"
            accept="video/*"
            hidden
            onChange={onFile}
          />
        </div>
      </div>

      {/* Clips list */}
      <div className="mt-6 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          className="grid grid-cols-[1fr_140px_120px_120px_120px] gap-3 px-4 py-2.5 text-[10.5px] tracking-widest uppercase"
          style={{ background: "rgba(255,255,255,0.03)", color: "#9aa0a6" }}
        >
          <span>Title</span>
          <span>Caller</span>
          <span>Uploaded</span>
          <span>Size</span>
          <span>Verdict</span>
        </div>
        {all.map((c, i) => (
          <ClipRow
            key={c.id}
            c={c}
            alt={i % 2 === 0}
            onClear={c.isCurrent ? clearUpload : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function ClipRow({
  c,
  alt,
  onClear,
}: {
  c: Clip;
  alt: boolean;
  onClear?: () => void;
}) {
  const tone =
    c.verdict === "SYNTHETIC"
      ? { color: "#fda4af", bg: "rgba(244,63,94,0.10)" }
      : c.verdict === "AUTHENTIC"
        ? { color: "#34d399", bg: "rgba(52,211,153,0.08)" }
        : { color: "#fbbf24", bg: "rgba(251,191,36,0.08)" };
  return (
    <div
      className="grid grid-cols-[1fr_140px_120px_120px_120px] gap-3 px-4 py-3 text-[12.5px] items-center"
      style={{ background: alt ? "rgba(255,255,255,0.015)" : "transparent" }}
    >
      <div className="min-w-0">
        <div className="truncate text-slate-100">{c.title}</div>
        <div className="text-[10.5px] font-mono" style={{ color: "#5f6368" }}>
          {c.id}
          {c.isCurrent && (
            <span
              className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest"
              style={{
                background: "rgba(138,180,248,0.12)",
                color: "#8ab4f8",
                border: "1px solid rgba(138,180,248,0.30)",
              }}
            >
              loaded
            </span>
          )}
        </div>
      </div>
      <div style={{ color: "#bdc1c6" }} className="truncate">
        {c.caller}
      </div>
      <div style={{ color: "#9aa0a6" }} className="font-mono">
        {timeAgo(c.uploadedAt)}
      </div>
      <div style={{ color: "#9aa0a6" }} className="font-mono">
        {(c.size / 1024 / 1024).toFixed(1)} MB
      </div>
      <div className="flex items-center gap-2">
        <span
          className="px-2 py-0.5 rounded-full text-[10px] tracking-widest uppercase font-medium"
          style={{
            background: tone.bg,
            color: tone.color,
            border: `1px solid ${tone.color}40`,
          }}
        >
          {c.verdict}
        </span>
        {c.isCurrent && (
          <Link
            href="/app/live"
            className="text-[10.5px] underline-offset-4 hover:underline"
            style={{ color: "#8ab4f8" }}
          >
            analyze
          </Link>
        )}
        {onClear && (
          <button
            onClick={onClear}
            className="text-[10.5px]"
            style={{ color: "#5f6368" }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
// silence noUnused on import — we may need getDemoVideoUrl in a sibling page
void getDemoVideoUrl;

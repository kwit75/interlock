"use client";
import { useEffect, useRef, useState } from "react";
import {
  saveDemoVideo,
  getDemoVideo,
  clearDemoVideo,
} from "@/lib/video-storage";

export default function DemoUploader({
  onChange,
}: {
  onChange?: (hasVideo: boolean) => void;
}) {
  const [hasVideo, setHasVideo] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [size, setSize] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const inp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const blob = await getDemoVideo();
        if (blob) {
          setHasVideo(true);
          setSize(blob.size);
          onChange?.(true);
        }
      } catch {
        /* indexedDB may be unavailable in private mode */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      await saveDemoVideo(f);
      setHasVideo(true);
      setFilename(f.name);
      setSize(f.size);
      onChange?.(true);
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    setBusy(true);
    try {
      await clearDemoVideo();
      setHasVideo(false);
      setFilename(null);
      setSize(null);
      onChange?.(false);
      if (inp.current) inp.current.value = "";
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: "rgba(28,28,30,0.5)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="text-[10.5px] uppercase tracking-[0.2em] font-medium text-slate-500 mb-2">
        ◆ Demo recording
      </div>
      {hasVideo ? (
        <>
          <div className="flex items-center gap-2 text-[12.5px] text-emerald-300">
            <span>●</span>
            <span>Pre-loaded recording will play in this call</span>
          </div>
          {filename && (
            <div className="text-[10.5px] font-mono text-slate-500 mt-1 truncate">
              {filename}
            </div>
          )}
          {size && (
            <div className="text-[10.5px] font-mono text-slate-500 mt-0.5">
              {(size / 1024 / 1024).toFixed(1)} MB · stored in IndexedDB
            </div>
          )}
          <button
            onClick={clear}
            disabled={busy}
            className="mt-2 text-[11px] text-slate-400 hover:text-slate-200 underline-offset-4 hover:underline"
          >
            Remove recording &amp; use default
          </button>
        </>
      ) : (
        <>
          <p className="text-[11.5px] text-slate-400 leading-relaxed">
            Upload a Meet call recording (MP4, WebM). The clip plays as the
            speaker tile inside the live demo and persists across reloads.
          </p>
          <label
            className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded text-[12px] font-medium transition cursor-pointer"
            style={{
              background: "rgba(138,180,248,0.15)",
              color: "#8ab4f8",
              border: "1px solid rgba(138,180,248,0.35)",
            }}
          >
            {busy ? "Saving…" : "▸ Choose file"}
            <input
              ref={inp}
              type="file"
              accept="video/*"
              hidden
              onChange={onFile}
            />
          </label>
          <div className="text-[10.5px] text-slate-500 mt-1.5">
            Default: FaceForensics++ DeepTomCruise sample
          </div>
        </>
      )}
    </div>
  );
}

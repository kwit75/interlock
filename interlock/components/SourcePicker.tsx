"use client";
import { useEffect, useRef, useState } from "react";
import {
  saveDemoVideo,
  getDemoVideo,
  clearDemoVideo,
} from "@/lib/video-storage";

export type VideoSource =
  | { kind: "default" }
  | { kind: "uploaded"; filename?: string; size?: number }
  | { kind: "live"; stream: MediaStream; label: string };

export default function SourcePicker({
  onSourceChange,
}: {
  onSourceChange: (s: VideoSource) => void;
}) {
  const [active, setActive] = useState<"default" | "uploaded" | "live">(
    "default",
  );
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [uploadedSize, setUploadedSize] = useState<number | null>(null);
  const [liveLabel, setLiveLabel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInp = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const blob = await getDemoVideo();
        if (blob) {
          setUploadedFilename(null);
          setUploadedSize(blob.size);
        }
      } catch {
        /* no IndexedDB */
      }
    })();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setError(null);
    try {
      await saveDemoVideo(f);
      setUploadedFilename(f.name);
      setUploadedSize(f.size);
      stopLive();
      setActive("uploaded");
      onSourceChange({
        kind: "uploaded",
        filename: f.name,
        size: f.size,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function startScreenCapture() {
    setBusy(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 15 },
        audio: false,
      });
      streamRef.current = stream;
      const videoTrack = stream.getVideoTracks()[0];
      const label =
        videoTrack?.label ||
        videoTrack?.getSettings()?.displaySurface ||
        "shared screen";
      setLiveLabel(label);
      setActive("live");
      onSourceChange({ kind: "live", stream, label });
      // Detect when the user clicks the browser's "Stop sharing" button
      videoTrack.addEventListener("ended", () => {
        streamRef.current = null;
        setLiveLabel(null);
        if (active === "live") {
          setActive("default");
          onSourceChange({ kind: "default" });
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // User cancellation isn't an error worth showing
      if (!/cancelled|denied|abort/i.test(msg)) setError(msg);
    } finally {
      setBusy(false);
    }
  }

  function stopLive() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setLiveLabel(null);
    }
  }

  async function useDefault() {
    stopLive();
    setActive("default");
    onSourceChange({ kind: "default" });
  }

  async function clearUploaded() {
    setBusy(true);
    try {
      await clearDemoVideo();
      setUploadedFilename(null);
      setUploadedSize(null);
      if (fileInp.current) fileInp.current.value = "";
      if (active === "uploaded") {
        setActive("default");
        onSourceChange({ kind: "default" });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="rounded-lg p-3 space-y-2"
      style={{
        background: "rgba(28,28,30,0.5)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="text-[10.5px] uppercase tracking-[0.2em] font-medium text-slate-500">
        ◆ Video source
      </div>

      <SourceRow
        on={active === "default"}
        onClick={useDefault}
        icon="🎭"
        title="Default · DeepTomCruise sample"
        subtitle="FaceForensics++ public-domain reference clip"
      />

      <SourceRow
        on={active === "uploaded"}
        onClick={() => fileInp.current?.click()}
        icon="📁"
        title={uploadedFilename ?? "Upload a recording"}
        subtitle={
          uploadedSize
            ? `${(uploadedSize / 1024 / 1024).toFixed(1)} MB · IndexedDB`
            : "MP4 or WebM · persists across reloads"
        }
        trailing={
          uploadedSize ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                void clearUploaded();
              }}
              className="text-[10px] text-slate-400 hover:text-slate-200"
              disabled={busy}
            >
              clear
            </button>
          ) : null
        }
      />
      <input
        ref={fileInp}
        type="file"
        accept="video/*"
        hidden
        onChange={onFile}
      />

      <SourceRow
        on={active === "live"}
        onClick={startScreenCapture}
        icon="🖥️"
        title={liveLabel ?? "Live screen capture"}
        subtitle={
          active === "live"
            ? "● capturing · works with Zoom, Teams, real Meet, any window"
            : "Browser asks which window or tab to share"
        }
        trailing={
          active === "live" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                stopLive();
                useDefault();
              }}
              className="text-[10px] text-slate-400 hover:text-slate-200"
            >
              stop
            </button>
          ) : null
        }
      />

      {error && (
        <div className="text-[10.5px] text-rose-300">
          {error}
        </div>
      )}
    </div>
  );
}

function SourceRow({
  on,
  onClick,
  icon,
  title,
  subtitle,
  trailing,
}: {
  on: boolean;
  onClick: () => void | Promise<void>;
  icon: string;
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      onClick={() => void onClick()}
      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-left transition"
      style={{
        background: on ? "rgba(138,180,248,0.12)" : "transparent",
        border: on
          ? "1px solid rgba(138,180,248,0.35)"
          : "1px solid transparent",
      }}
    >
      <span className="text-[18px] leading-none">{icon}</span>
      <div className="flex-1 min-w-0">
        <div
          className="text-[12.5px] truncate"
          style={{ color: on ? "#c2dafb" : "#e8eaed" }}
        >
          {title}
        </div>
        <div
          className="text-[10.5px] truncate"
          style={{ color: "#9aa0a6" }}
        >
          {subtitle}
        </div>
      </div>
      {trailing}
    </button>
  );
}

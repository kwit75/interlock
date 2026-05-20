"use client";
import { useEffect, useState } from "react";

export default function MeetShell({
  children,
  call,
  rightPanel,
  callStartedAt,
}: {
  children?: React.ReactNode;
  call: React.ReactNode;
  rightPanel: React.ReactNode;
  callStartedAt: number | null;
}) {
  const [time, setTime] = useState("");
  const [callElapsed, setCallElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setTime(
        `${d.getHours().toString().padStart(2, "0")}:${d
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
      );
      if (callStartedAt) {
        setCallElapsed(Math.floor((Date.now() - callStartedAt) / 1000));
      } else {
        setCallElapsed(0);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [callStartedAt]);

  const mm = Math.floor(callElapsed / 60)
    .toString()
    .padStart(2, "0");
  const ss = (callElapsed % 60).toString().padStart(2, "0");

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#202124] text-slate-100 font-sans">
      {/* MAIN STAGE — fills everything except sidebar */}
      <main className="flex-1 relative flex flex-col min-w-0">
        {/* Floating top-left: meeting name */}
        <div className="absolute top-3 left-4 z-10 text-[12px] text-white/85 leading-snug pointer-events-none">
          <div className="font-medium tracking-tight">
            Q4 Vendor Wire Authorization
          </div>
          <div className="text-[11px] text-white/55">
            meet.google.com/qrx-vfgr-djy
          </div>
        </div>
        {/* Floating top-right: recording + clock */}
        <div className="absolute top-3 right-4 z-10 flex items-center gap-3 text-[11px] text-white/75 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/35 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Rec</span>
            <span className="font-mono tabular-nums">
              {mm}:{ss}
            </span>
          </div>
          <div className="font-mono tabular-nums">{time}</div>
        </div>

        {/* VIDEO STAGE — large central area, fills available space */}
        <div className="flex-1 min-h-0 flex items-center justify-center p-4 pb-24">
          <div className="relative w-full h-full max-w-[1280px] flex items-center justify-center">
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#0e0e10] border border-black/60 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
              {call}
              <div className="absolute bottom-3 left-4 px-2.5 py-1 rounded-md bg-black/55 backdrop-blur-sm text-[12px] text-white font-medium">
                Robert Henderson · CEO
              </div>
              {/* Participant strip — bottom-right thumbnails */}
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                <ParticipantTile name="Mary Chen" sub="CFO" />
                <ParticipantTile name="J. Park" sub="Treasury" muted />
              </div>
            </div>
          </div>
        </div>

        {/* Floating bottom control bar */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#2a2a2e]/95 border border-black/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)] pointer-events-auto backdrop-blur-sm">
            <CtrlBtn label="mic" icon={<MicIcon />} />
            <CtrlBtn label="camera" icon={<CamIcon />} />
            <CtrlBtn label="captions" icon={<CCIcon />} />
            <CtrlBtn label="present" icon={<PresentIcon />} />
            <CtrlBtn label="hand" icon={<HandIcon />} />
            <CtrlBtn label="more" icon={<MoreIcon />} />
            <div className="w-px h-6 bg-white/15 mx-1" />
            <button
              aria-label="Leave call"
              className="h-9 px-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[12px] font-medium transition flex items-center gap-1.5"
            >
              <PhoneEndIcon />
              <span>Leave</span>
            </button>
            <div className="w-px h-6 bg-white/15 mx-1" />
            <CtrlBtn label="people" icon={<PeopleIcon />} />
            <CtrlBtn label="chat" icon={<ChatIcon />} />
            <button
              aria-label="Activities"
              className="w-9 h-9 rounded-full bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/40 text-blue-300 flex items-center justify-center transition"
              title="Workspace add-on · INTERLOCK"
            >
              <span className="text-[15px]">◆</span>
            </button>
          </div>
        </div>
        {children && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[min(640px,calc(100%-2rem))] pointer-events-none">
            {children}
          </div>
        )}
      </main>

      {/* RIGHT SIDEBAR — Activities/Add-on panel */}
      <aside className="hidden md:flex w-[400px] flex-col border-l border-black/60 bg-[#1c1c1f]">
        <div className="px-3 h-12 border-b border-black/40 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-rose-500 via-rose-600 to-purple-600 flex items-center justify-center text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(244,63,94,0.4)]">
            ◆
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <div className="text-[13px] text-slate-50 font-medium tracking-tight truncate">
              INTERLOCK
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              Workspace add-on · v1.0
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            live
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">{rightPanel}</div>
      </aside>
    </div>
  );
}

function ParticipantTile({
  name,
  sub,
  muted,
}: {
  name: string;
  sub: string;
  muted?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  return (
    <div className="w-[112px] aspect-video rounded-md bg-[#28282c] border border-black/60 relative overflow-hidden flex items-center justify-center shadow-md">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white text-[10px] font-medium">
        {initials}
      </div>
      <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between text-[9px] text-white/85 leading-none">
        <span className="truncate">{name}</span>
        {muted && (
          <span className="w-3 h-3 rounded-full bg-rose-600/90 flex items-center justify-center text-[8px]">
            <MicMutedIcon />
          </span>
        )}
      </div>
    </div>
  );
}

function CtrlBtn({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-200 transition"
      title={label}
    >
      {icon}
    </button>
  );
}

/* === Inline SVG icons (Material-ish, simplified) === */
function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}
function CamIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
  );
}
function CCIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z" />
    </svg>
  );
}
function PresentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h6v2H7v2h10v-2h-3v-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H4V5h16v10z" />
    </svg>
  );
}
function HandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 24c-3.1 0-5.7-1.83-7-4.46l-.94-1.95.91-.86C6.66 16.16 7.6 16 8.1 16c.43 0 .85.07 1.25.2.43-1.32 1.43-1.92 2.4-2.1V4.5C11.75 3.67 12.42 3 13.25 3s1.5.67 1.5 1.5V11h1V3.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11h1V4.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V13h1V7.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V15c0 4.97-4.03 9-9 9z" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}
function PhoneEndIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08C.11 12.9 0 12.65 0 12.38c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  );
}
function MicMutedIcon() {
  return (
    <svg width="6" height="6" viewBox="0 0 24 24" fill="white">
      <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zM14.98 11.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3 3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
    </svg>
  );
}

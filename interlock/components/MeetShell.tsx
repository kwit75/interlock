"use client";
import { useEffect, useState } from "react";

const MEET_BG = "#202124";
const MEET_SURFACE = "#2c2c2f";
const MEET_BORDER = "#3c4043";
const MEET_TEXT = "#e8eaed";

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
      setCallElapsed(
        callStartedAt ? Math.floor((Date.now() - callStartedAt) / 1000) : 0,
      );
    }, 1000);
    return () => clearInterval(t);
  }, [callStartedAt]);

  const mm = Math.floor(callElapsed / 60)
    .toString()
    .padStart(2, "0");
  const ss = (callElapsed % 60).toString().padStart(2, "0");

  return (
    <div
      className="h-screen w-screen overflow-hidden flex font-sans"
      style={{ background: MEET_BG, color: MEET_TEXT }}
    >
      {/* MAIN STAGE */}
      <main className="flex-1 relative flex flex-col min-w-0">
        {/* Top-left: meeting code only (like real Meet) */}
        <div className="absolute top-3 left-4 z-10 flex items-center gap-2 pointer-events-none">
          <span
            className="px-2 py-1 rounded text-[12px] font-medium leading-none"
            style={{ background: "rgba(60,64,67,0.6)", color: MEET_TEXT }}
          >
            qrx-vfgr-djy
          </span>
        </div>
        {/* Top-right: recording + time */}
        <div className="absolute top-3 right-4 z-10 flex items-center gap-2 pointer-events-none">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded text-[12px] font-medium"
            style={{ background: "rgba(60,64,67,0.6)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ea4335] animate-pulse" />
            <span style={{ color: MEET_TEXT }}>Rec</span>
            <span
              className="font-mono tabular-nums"
              style={{ color: "#bdc1c6" }}
            >
              {mm}:{ss}
            </span>
          </div>
          <div
            className="px-2 py-1 rounded text-[12px] font-mono tabular-nums"
            style={{ background: "rgba(60,64,67,0.6)", color: "#bdc1c6" }}
          >
            {time}
          </div>
        </div>

        {/* Stage — video fills available space, minimal padding */}
        <div className="flex-1 min-h-0 flex p-3 pb-20">
          <div className="relative w-full h-full">
            <div
              className="absolute inset-0 rounded-xl overflow-hidden"
              style={{ background: "#000", border: `1px solid ${MEET_BORDER}` }}
            >
              {call}
              {/* Caller pill, bottom-left */}
              <div
                className="absolute bottom-3 left-3 px-2 py-1 rounded text-[13px] font-medium"
                style={{
                  background: "rgba(0,0,0,0.55)",
                  color: MEET_TEXT,
                  backdropFilter: "blur(8px)",
                }}
              >
                Robert Henderson · CEO
              </div>
              {/* Participant tiles, bottom-right */}
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                <ParticipantTile name="Mary Chen" sub="CFO" />
                <ParticipantTile name="J. Park" sub="Treasury" muted />
              </div>
            </div>
          </div>
        </div>

        {/* Floating overlay above control bar — e.g. wire pill */}
        {children && (
          <div className="absolute bottom-[72px] left-0 right-0 flex justify-center pointer-events-none">
            <div className="pointer-events-auto">{children}</div>
          </div>
        )}

        {/* Bottom control bar */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center pointer-events-none">
          <div
            className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-full"
            style={{
              background: "rgba(32,33,36,0.92)",
              border: `1px solid ${MEET_BORDER}`,
              backdropFilter: "blur(12px)",
            }}
          >
            <CtrlBtn icon={<MicIcon />} label="Mute" />
            <CtrlBtn icon={<CamIcon />} label="Turn off camera" />
            <CtrlBtn icon={<CCIcon />} label="Captions" />
            <CtrlBtn icon={<HandIcon />} label="Raise hand" />
            <CtrlBtn icon={<PresentIcon />} label="Present now" />
            <CtrlBtn icon={<EmojiIcon />} label="Send a reaction" />
            <CtrlBtn icon={<MoreIcon />} label="More options" />
            <div className="w-px h-6 bg-white/10 mx-0.5" />
            <button
              className="h-9 px-4 rounded-full flex items-center gap-1.5 transition"
              style={{
                background: "#ea4335",
                color: "white",
                fontSize: 13,
                fontWeight: 500,
              }}
              aria-label="Leave call"
            >
              <PhoneEndIcon />
              <span>Leave</span>
            </button>
            <div className="w-px h-6 bg-white/10 mx-0.5" />
            <CtrlBtn icon={<InfoIcon />} label="Meeting details" />
            <CtrlBtn icon={<PeopleIcon />} label="People" />
            <CtrlBtn icon={<ChatIcon />} label="Chat with everyone" />
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center transition"
              style={{
                background: "rgba(138,180,248,0.18)",
                color: "#8ab4f8",
                border: "1px solid rgba(138,180,248,0.45)",
              }}
              aria-label="Activities"
              title="Activities · INTERLOCK"
            >
              <ActivitiesIcon />
            </button>
            <CtrlBtn icon={<HostIcon />} label="Host controls" />
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR (Activities) */}
      <aside
        className="hidden md:flex w-[360px] flex-col"
        style={{ background: MEET_SURFACE, borderLeft: `1px solid ${MEET_BORDER}` }}
      >
        {/* Activities header */}
        <div
          className="h-14 px-4 flex items-center gap-3"
          style={{ borderBottom: `1px solid ${MEET_BORDER}` }}
        >
          <span
            className="text-[16px] font-medium"
            style={{ color: MEET_TEXT, letterSpacing: "-0.01em" }}
          >
            Activities
          </span>
        </div>
        {/* Plugin sub-header */}
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{ borderBottom: `1px solid ${MEET_BORDER}` }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[14px] font-semibold"
            style={{
              background:
                "linear-gradient(135deg,#f43f5e 0%,#a855f7 100%)",
              boxShadow: "0 2px 10px rgba(244,63,94,0.35)",
            }}
          >
            ◆
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <div className="text-[14px] font-medium" style={{ color: MEET_TEXT }}>
              INTERLOCK
            </div>
            <div className="text-[11px]" style={{ color: "#9aa0a6" }}>
              CFO Wire-Fraud Defense
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            live
          </div>
        </div>
        {/* Sidebar body */}
        <div className="flex-1 overflow-y-auto">{rightPanel}</div>
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
    <div
      className="w-[100px] aspect-video rounded-lg relative overflow-hidden flex items-center justify-center"
      style={{ background: MEET_SURFACE, border: `1px solid ${MEET_BORDER}` }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-medium"
        style={{
          background: "linear-gradient(135deg,#f43f5e,#f59e0b)",
        }}
      >
        {initials}
      </div>
      <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between text-[9px] leading-none">
        <span style={{ color: MEET_TEXT }} className="truncate">
          {name}
        </span>
        {muted && (
          <span
            className="w-3 h-3 rounded-full flex items-center justify-center"
            style={{ background: "#ea4335" }}
          >
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
      title={label}
      className="w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-white/10"
      style={{ color: MEET_TEXT }}
    >
      {icon}
    </button>
  );
}

/* Material-style icons (simplified, 18-20px) */
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z" />
    </svg>
  );
}
function HandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z" />
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
function EmojiIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  );
}
function ActivitiesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-1 9h-5v5h-2v-5H6v-2h5V5h2v5h5v2z" />
    </svg>
  );
}
function HostIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}
function MicMutedIcon() {
  return (
    <svg width="7" height="7" viewBox="0 0 24 24" fill="white">
      <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zM14.98 11.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3 3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
    </svg>
  );
}

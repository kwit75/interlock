"use client";
import { useEffect, useState } from "react";

export default function MeetShell({
  children,
  call,
  rightPanel,
}: {
  children: React.ReactNode;
  call: React.ReactNode;
  rightPanel: React.ReactNode;
}) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setTime(
        `${d.getHours().toString().padStart(2, "0")}:${d
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
      );
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-[#202124] text-slate-100">
      <header className="flex items-center justify-between px-4 h-14 border-b border-black/40 bg-[#202124]">
        <div className="flex items-center gap-3">
          <GoogleMeetMark />
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] text-slate-200 font-medium">
              Q4 Vendor Wire Authorization
            </span>
            <span className="text-[11px] text-slate-400">
              accounting.northwind.com · meet.google.com/qrx-vfgr-djy
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-slate-300">
          <span className="hidden md:inline text-slate-400">{time} PDT</span>
          <span className="hidden md:flex items-center gap-1 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Recording
          </span>
          <div className="w-7 h-7 rounded-full bg-purple-500 text-white text-[11px] flex items-center justify-center font-semibold">
            MC
          </div>
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <main className="flex-1 flex flex-col bg-[#0e0e10] relative">
          <div className="flex-1 flex items-stretch justify-center p-4 min-h-0">
            <div className="w-full max-w-5xl flex flex-col gap-3">
              <div className="flex-1 min-h-0 grid grid-cols-12 gap-3">
                <div className="col-span-12 lg:col-span-9 relative rounded-xl overflow-hidden bg-[#1a1a1d] border border-black/50 shadow-2xl">
                  {call}
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[11px] text-white">
                    Robert Henderson · CEO
                  </div>
                </div>
                <div className="hidden lg:flex col-span-3 flex-col gap-3">
                  <SelfTile name="Mary Chen" subtitle="CFO" />
                  <SelfTile name="J. Park" subtitle="Treasury" muted />
                </div>
              </div>
              {children}
            </div>
          </div>
          <MeetControlBar />
        </main>
        <aside className="hidden md:flex w-[440px] flex-col border-l border-black/60 bg-[#202124]">
          <PluginHeader />
          <div className="flex-1 overflow-y-auto p-3 bg-[#16161a]">{rightPanel}</div>
        </aside>
      </div>
    </div>
  );
}

function GoogleMeetMark() {
  return (
    <div className="flex items-center gap-2">
      <svg width="22" height="18" viewBox="0 0 87 72" aria-label="Google Meet">
        <path d="M49.5 36 64 47v-6.3l9.5 7.3c1.2.9 3 .1 3-1.4V25.4c0-1.5-1.8-2.3-3-1.4L64 31.3V25" fill="#00832d"/>
        <path d="M0 51v15a6 6 0 0 0 6 6h15V51z" fill="#0066da"/>
        <path d="M21 0H6a6 6 0 0 0-6 6v15h21z" fill="#e94235"/>
        <path d="M0 21h21v30H0z" fill="#2684fc"/>
        <path d="M64 0v25H21V0zm0 47 0 25H21V47z" fill="#ffba00"/>
        <path d="M64 25v22L49.5 36z" fill="#00ac47"/>
      </svg>
      <span className="text-[13px] text-slate-300">Meet</span>
    </div>
  );
}

function SelfTile({
  name,
  subtitle,
  muted,
}: {
  name: string;
  subtitle: string;
  muted?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  return (
    <div className="aspect-video rounded-lg bg-[#1f1f23] border border-black/50 relative overflow-hidden flex items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white text-sm font-medium">
        {initials}
      </div>
      <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-slate-300">
        <span>{name} · {subtitle}</span>
        {muted && <span className="text-rose-400">●mute</span>}
      </div>
    </div>
  );
}

function MeetControlBar() {
  const btn =
    "w-10 h-10 rounded-full flex items-center justify-center text-slate-200 hover:bg-white/10 transition";
  const danger =
    "w-12 h-10 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white";
  return (
    <div className="h-14 border-t border-black/40 bg-[#202124] flex items-center justify-center gap-2 px-4">
      <button className={btn} aria-label="mic" title="Mute">🎙</button>
      <button className={btn} aria-label="cam" title="Camera">📷</button>
      <button className={btn} aria-label="cc" title="Captions">CC</button>
      <button className={btn} aria-label="present" title="Present">↗</button>
      <button className={btn} aria-label="more" title="More">⋮</button>
      <div className="w-px h-6 bg-white/10 mx-2" />
      <button className={danger} aria-label="leave" title="Leave call">⌃</button>
      <div className="w-px h-6 bg-white/10 mx-2" />
      <button className={btn} aria-label="people" title="People">👥</button>
      <button className={btn} aria-label="chat" title="Chat">💬</button>
      <button className={`${btn} ring-2 ring-blue-500/60`} aria-label="addons" title="Workspace add-ons">
        ◆
      </button>
    </div>
  );
}

function PluginHeader() {
  return (
    <div className="px-3 py-3 border-b border-black/40 bg-[#1a1a1d] flex items-center gap-3">
      <div className="w-9 h-9 rounded-md bg-gradient-to-br from-rose-500 via-rose-600 to-purple-600 flex items-center justify-center text-white text-base font-semibold shadow-[0_2px_8px_rgba(244,63,94,0.45)]">
        ◆
      </div>
      <div className="flex flex-col leading-tight">
        <div className="text-[13px] text-slate-100 font-medium tracking-tight">
          INTERLOCK
        </div>
        <div className="text-[10px] text-slate-400">
          Workspace add-on · CFO wire-fraud defense
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        active
      </div>
    </div>
  );
}

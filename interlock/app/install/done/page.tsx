"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function InstalledPage() {
  const [progress, setProgress] = useState(0);
  const steps = [
    "Verifying OAuth scopes",
    "Provisioning per-tenant detector instance",
    "Connecting bank API gateway",
    "Registering officer-signer FIDO2 keys",
    "Activating in next Meet call",
  ];
  useEffect(() => {
    const id = setInterval(
      () => setProgress((p) => Math.min(p + 1, steps.length)),
      450,
    );
    return () => clearInterval(id);
  }, [steps.length]);

  const allDone = progress >= steps.length;

  return (
    <main className="min-h-screen bg-[#f1f3f4] text-slate-900 font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-[0_2px_24px_rgba(60,64,67,0.18)] overflow-hidden">
        <div className="px-8 pt-8 pb-2 flex flex-col items-center text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-semibold mb-4"
            style={{
              background:
                "linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)",
              boxShadow: "0 6px 24px rgba(244,63,94,0.35)",
            }}
          >
            ◆
          </div>
          <h1 className="text-[22px] font-medium text-slate-800">
            {allDone ? "INTERLOCK is installed" : "Installing INTERLOCK…"}
          </h1>
          <p className="text-[13px] text-slate-600 mt-1.5">
            {allDone
              ? "Active on every Workspace user. Open your next Meet call to see it live."
              : "Provisioning a per-tenant detector instance for northwind.example"}
          </p>
        </div>

        <div className="px-8 pt-6 pb-2">
          <ul className="space-y-3">
            {steps.map((s, i) => {
              const done = i < progress;
              const active = i === progress;
              return (
                <li
                  key={s}
                  className="flex items-center gap-3 text-[13px]"
                  style={{ color: done ? "#1e8e3e" : active ? "#1a73e8" : "#9aa0a6" }}
                >
                  {done ? (
                    <Check />
                  ) : active ? (
                    <Spinner />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 inline-block" />
                  )}
                  <span className={done ? "" : active ? "text-slate-800" : "text-slate-500"}>
                    {s}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {allDone && (
          <div className="px-8 pt-3 pb-7">
            <div
              className="rounded-lg px-3 py-2.5 text-[12px] mb-4"
              style={{
                background: "rgba(26,115,232,0.07)",
                border: "1px solid rgba(26,115,232,0.2)",
                color: "#1a73e8",
              }}
            >
              <strong className="font-medium">Pro tip</strong> · Press{" "}
              <kbd className="px-1 py-0.5 rounded bg-white border border-slate-300 text-[11px] font-mono mx-0.5">
                M
              </kbd>{" "}
              inside the call to mute INTERLOCK&apos;s alert audio (venue PA
              safety).
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/meet"
                className="flex-1 px-5 py-3 text-center rounded-md bg-[#1a73e8] hover:bg-[#1765cc] text-white text-[14px] font-semibold transition"
              >
                Open in Meet now
              </Link>
              <Link
                href="/"
                className="px-5 py-3 text-center rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 text-[14px] font-medium transition"
              >
                Back to landing
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1e8e3e">
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1a73e8"
      strokeWidth="2.5"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
    </svg>
  );
}

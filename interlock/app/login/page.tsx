"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"idle" | "signing-in">("idle");

  function signIn() {
    setStage("signing-in");
    setTimeout(() => router.push("/app"), 900);
  }

  return (
    <main className="min-h-screen bg-[#f1f3f4] text-slate-900 font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] bg-white rounded-lg shadow-[0_2px_18px_rgba(60,64,67,0.18)] overflow-hidden">
        <div className="px-8 pt-8 pb-2 flex items-center justify-center">
          <GoogleG />
        </div>
        <div className="px-8 pt-5 pb-5 text-center">
          <h1 className="text-[22px] font-normal text-slate-800">
            Sign in
          </h1>
          <p className="text-[13px] text-slate-600 mt-2">
            to continue to{" "}
            <span className="text-slate-800 font-medium">INTERLOCK</span>
          </p>
        </div>
        <div className="px-8 pb-3">
          <button
            type="button"
            onClick={signIn}
            disabled={stage !== "idle"}
            className="w-full flex items-center gap-3 border border-slate-300 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50 transition disabled:opacity-70"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white text-[12px] font-semibold flex items-center justify-center">
              MC
            </div>
            <div className="leading-tight">
              <div className="text-[14px] text-slate-800">Mary Chen</div>
              <div className="text-[12px] text-slate-500">
                mary.chen@northwind.example
              </div>
            </div>
            <div className="ml-auto text-slate-400">
              {stage === "signing-in" ? "…" : "›"}
            </div>
          </button>
          <button
            type="button"
            className="w-full mt-2 flex items-center gap-3 border border-slate-300 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50 transition text-[13px] text-slate-700"
          >
            <span className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-[16px] text-slate-500">
              +
            </span>
            <span>Use another account</span>
          </button>
        </div>
        <div className="px-8 pb-5 text-[11.5px] text-slate-500 leading-relaxed mt-2">
          To continue, Google will share your name, email address, language
          preference, and profile picture with INTERLOCK. Before using this
          app, you can review INTERLOCK&apos;s{" "}
          <Link href="/trust" className="text-[#1a73e8]">
            privacy policy
          </Link>{" "}
          and{" "}
          <Link href="/docs" className="text-[#1a73e8]">
            terms of service
          </Link>
          .
        </div>
        <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="px-3 py-2 text-[#1a73e8] hover:bg-blue-50 rounded text-[14px] font-medium"
          >
            Cancel
          </Link>
          <button
            onClick={signIn}
            disabled={stage !== "idle"}
            className="px-5 py-2 rounded bg-[#1a73e8] hover:bg-[#1765cc] text-white text-[14px] font-medium transition disabled:opacity-70"
          >
            {stage === "signing-in" ? "Signing in…" : "Continue"}
          </button>
        </div>
      </div>
    </main>
  );
}

function GoogleG() {
  return (
    <svg width="44" height="44" viewBox="0 0 48 48">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.18 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.75z"
      />
    </svg>
  );
}

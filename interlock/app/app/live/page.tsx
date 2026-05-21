"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /app/live is the in-app entry to the live monitoring surface — for the
 * demo it routes to the existing /meet page so the full cinematic arc
 * stays one URL. In production this view would render the same surface
 * inside the SaaS chrome.
 */
export default function AppLiveRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/meet");
  }, [router]);
  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans"
      style={{ background: "#0b0d10", color: "#e8eaed" }}
    >
      <div className="text-[13px]" style={{ color: "#9aa0a6" }}>
        Opening live monitoring…
      </div>
    </div>
  );
}

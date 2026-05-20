"use client";
/**
 * INTERLOCK · Meet Add-on full-stage view
 *
 * Routed to by the Workspace Add-on `mainStageUri`. Triggered when the user
 * promotes the INTERLOCK plugin from sidePanel into the full Meet tab during
 * an active synthetic-media incident — the cinematic detection arc takes
 * over the entire Meet UI for the climax.
 *
 * For the simulated demo, this is just a redirect to /meet (which contains
 * the full Meet shell + cinematic arc). In production, the Meet Add-ons SDK
 * would already be hosting us in a full-tab iframe; we'd render the cinematic
 * overlay directly without a second shell.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StagePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/meet");
  }, [router]);
  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans"
      style={{ background: "#202124", color: "#e8eaed" }}
    >
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center text-white text-xl font-semibold"
          style={{
            background: "linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)",
          }}
        >
          ◆
        </div>
        <div className="text-[14px] tracking-tight">
          INTERLOCK · loading main stage…
        </div>
      </div>
    </div>
  );
}

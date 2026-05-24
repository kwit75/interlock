/**
 * /meet-live — same Meet UI as /meet, but the Council fires in
 * `live-sandbox` mode:
 *
 *   - Frame Forensics worker → real `interactions.create({agent:
 *     "antigravity-preview-05-2026"})` call. The sandbox runs OpenCV +
 *     scipy.signal Python; numerical features return; Gemini 3.5 Flash
 *     reasons over the array.
 *   - Voice-Print worker → same sandbox primitive with librosa Python
 *     (YIN F0, MFCC band-8 cosine to RVC reference, spectral centroid).
 *   - Reverse Provenance, Counter-Strategy, Regulatory Precedent,
 *     Injection Guard → real Gemini 3.5 Flash calls (Search-grounded
 *     where applicable).
 *
 * `/meet` stays as the venue-Wi-Fi-resilient cached demo (default
 * pitch path). `/meet-live` is the architecturally-honest live verification
 * route — slower (sandbox spawn ~10–15s per sandbox worker), but every
 * env_id and feature value is real.
 *
 * Implementation: a one-time client redirect to `/meet?mode=live-sandbox`
 * so we re-use the entire existing page without duplicating ~1000 lines.
 */
"use client";
import { useEffect } from "react";

export default function MeetLivePage() {
  useEffect(() => {
    // Preserve any extra query params the user passed (e.g. ?ticker=AAPL).
    const url = new URL(window.location.href);
    url.pathname = "/meet";
    url.searchParams.set("mode", "live-sandbox");
    window.location.replace(url.toString());
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050608",
        color: "#e8eaed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-roboto), system-ui, sans-serif",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div
        style={{
          color: "#a855f7",
          fontSize: "11px",
          letterSpacing: "0.5em",
          textTransform: "uppercase",
        }}
      >
        ◆ INTERLOCK · LIVE SANDBOX MODE
      </div>
      <div style={{ color: "#9aa0a6", fontSize: "13px" }}>
        Routing to live Antigravity Managed Agent sandbox…
      </div>
      <div
        style={{
          color: "#6ee7b7",
          fontSize: "11px",
          fontFamily: "var(--font-roboto-mono), monospace",
        }}
      >
        agent: antigravity-preview-05-2026 · interactions.create
      </div>
    </div>
  );
}

import { NextRequest } from "next/server";
import { sseStream, sseResponse } from "@/lib/sse";
import { runForensics } from "@/lib/agents/forensics";
import { getWire } from "@/lib/mock-bank";

// Need Node runtime for @google/genai SDK
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const { stream, send, close } = sseStream();
  const mode = (process.env.DEMO_MODE as "auto" | "live" | "cached") || "auto";

  (async () => {
    try {
      const wire = getWire("W-7821");
      const { result: forensics, source } = await runForensics(mode);
      console.log("[start] forensics source:", source);

      // Stream evidence entries with theatrical pacing
      for (const ev of forensics.evidence) {
        send({ agent: "forensics", type: "evidence", data: ev });
        await new Promise((r) => setTimeout(r, 350));
      }
      send({
        agent: "forensics",
        type: "verdict",
        data: {
          verdict: forensics.verdict,
          confidence: forensics.confidence,
          summary: forensics.summary,
        },
      });

      // Strategy ready
      send({
        agent: "orchestrator",
        type: "strategy_ready",
        data: {
          steps: [
            `Freeze wire ${wire.wire_id}`,
            "Lock CEO accounts",
            "Draft Item 1.05 disclosure",
          ],
        },
      });

      send({ agent: "orchestrator", type: "done", data: { ok: true } });
      close();
    } catch (e) {
      console.error("[start] error:", e);
      send({ agent: "orchestrator", type: "done", data: { ok: false } });
      close();
    }
  })();

  return sseResponse(stream);
}

import { NextRequest } from "next/server";
import { sseStream, sseResponse } from "@/lib/sse";
import { runContainment } from "@/lib/agents/containment";
import { runComms } from "@/lib/agents/comms";
import { freezeWire } from "@/lib/mock-bank";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const { stream, send, close } = sseStream();
  const mode = (process.env.DEMO_MODE as "auto" | "live" | "cached") || "auto";

  (async () => {
    try {
      const wire = { wire_id: "W-7821", amount_usd: 50_000_000, vendor: "TechVenture Ltd." };

      // CONTAINMENT + COMMS in parallel
      const containmentP = (async () => {
        for await (const evt of runContainment(mode, wire)) {
          send({ agent: "containment", type: "stdout", data: evt });
        }
      })();

      const commsP = (async () => {
        const { result } = await runComms(mode);
        send({
          agent: "comms",
          type: "draft",
          data: { kind: "item_1_05_draft", content: result.item_1_05_draft },
        });
        await new Promise((r) => setTimeout(r, 400));
        send({
          agent: "comms",
          type: "draft",
          data: { kind: "board_alert", content: result.board_alert },
        });
        await new Promise((r) => setTimeout(r, 400));
        send({
          agent: "comms",
          type: "draft",
          data: { kind: "customer_comms", content: result.customer_comms },
        });
      })();

      await Promise.all([containmentP, commsP]);

      // Final state: flip the wire
      const frozen = freezeWire("W-7821");
      send({ agent: "orchestrator", type: "wire_frozen", data: frozen });

      send({ agent: "orchestrator", type: "done", data: { ok: true } });
      close();
    } catch (e) {
      console.error("[approve] error:", e);
      send({ agent: "orchestrator", type: "done", data: { ok: false } });
      close();
    }
  })();

  return sseResponse(stream);
}

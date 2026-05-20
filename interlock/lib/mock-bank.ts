import type { BankWire } from "@/lib/types";

// In-memory wire ledger; reset on cold start (acceptable for demo)
const wires = new Map<string, BankWire>();

export function getWire(id: string): BankWire {
  let w = wires.get(id);
  if (!w) {
    w = {
      wire_id: id,
      amount_usd: 50_000_000,
      vendor: "TechVenture Ltd.",
      status: "PENDING",
    };
    wires.set(id, w);
  }
  return w;
}

export function freezeWire(id: string): BankWire {
  const w = getWire(id);
  w.status = "FROZEN";
  w.frozen_at = new Date().toISOString();
  return w;
}

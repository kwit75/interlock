// Shared types across orchestrator + agents + UI

export type AgentName = "forensics" | "containment" | "comms";

export type ForensicsEvidence = {
  category:
    | "lip_sync"
    | "facial_geometry"
    | "lighting_shadows"
    | "eye_movement"
    | "temporal_consistency"
    | "edge_artifacts"
    | "voice_formants"
    | "other";
  frame_number: number;
  observation: string;
  severity: "low" | "medium" | "high";
  /** Optional bounding box on the video frame, percentage units [0..1]. */
  bbox?: { x: number; y: number; w: number; h: number };
};

export type AgentThought = {
  thought: string;
  rule_id?: string;
  /** ms delay before the next thought to give a "thinking" cadence */
  pause_ms?: number;
};

export type ForensicsResult = {
  verdict: "AUTHENTIC" | "SYNTHETIC" | "INCONCLUSIVE";
  confidence: number;
  evidence: ForensicsEvidence[];
  summary: string;
};

export type ContainmentEvent = {
  type: "stdout" | "stderr" | "status";
  line: string;
  env_id?: string;
};

export type CommsResult = {
  item_1_05_draft: string; // SEC 8-K Item 1.05 markdown
  board_alert: string; // urgent action items
  customer_comms: string; // apology/reassurance
};

export type BankWire = {
  wire_id: string;
  amount_usd: number;
  vendor: string;
  status: "PENDING" | "FROZEN" | "EXECUTED";
  frozen_at?: string;
};

export type SSEEvent =
  | { agent: "forensics"; type: "evidence"; data: ForensicsEvidence }
  | {
      agent: "forensics";
      type: "verdict";
      data: { verdict: string; confidence: number; summary: string };
    }
  | { agent: "containment"; type: "stdout"; data: ContainmentEvent }
  | {
      agent: "comms";
      type: "draft";
      data: { kind: keyof CommsResult; content: string };
    }
  | {
      agent: "orchestrator";
      type: "strategy_ready";
      data: { steps: string[] };
    }
  | { agent: "orchestrator"; type: "wire_frozen"; data: BankWire }
  | { agent: "orchestrator"; type: "done"; data: { ok: boolean } };

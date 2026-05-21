import { generate } from "@/lib/gemini";
import type { WorkerOutput, WorkerVerdict } from "@/lib/council/types";

/**
 * Verdict aggregator — the seventh 3.5 Flash call.
 *
 * thinkingLevel: "high" because this is the consequential call. Cost is
 * fine — it's one invocation, not five. JSON output enforced. Gates on
 * 3-of-5 worker agreement, never on 5/5 (so any single sub-agent failure
 * doesn't sink the demo).
 */
export type VerdictResult = {
  verdict: WorkerVerdict;
  confidence: number;
  rationale: string;
  passingWorkers: number;
  totalWorkers: number;
  modelUsed?: string;
};

const SCHEMA_PROMPT = `You are the verdict aggregator on a deepfake wire-fraud investigation. Five sub-agents have just returned independent findings. Aggregate them into a single decision.

Sub-agent outputs (JSON):
%PAYLOAD%

Decision rules:
1. Verdict is "synthetic" if at least 3 of 5 sub-agents return "synthetic" AND average confidence across "synthetic" votes is ≥ 0.70.
2. Verdict is "authentic" if at least 3 of 5 sub-agents return "authentic" AND no "synthetic" voter exceeds 0.80 confidence.
3. Otherwise verdict is "inconclusive".

Output STRICT JSON ONLY, no prose, no code fences:

{
  "verdict": "synthetic" | "authentic" | "inconclusive",
  "confidence": <0.0–1.0>,
  "rationale": "<one paragraph, ~3 sentences, naming the strongest two pieces of evidence>"
}`;

export async function runVerdictAggregator(
  workerOutputs: WorkerOutput[],
): Promise<VerdictResult> {
  const totalWorkers = workerOutputs.length;
  const passingWorkers = workerOutputs.filter((w) => w.status === "complete").length;

  // Determine consensus locally first — that lets us still produce a
  // verdict if the aggregator call fails mid-demo.
  const localVerdict = localAggregate(workerOutputs);

  const payload = JSON.stringify(
    workerOutputs.map((w) => ({
      worker: w.workerId,
      verdict: w.verdict ?? "missing",
      confidence: w.confidence ?? 0,
      finding: w.finding ?? w.error ?? "",
    })),
    null,
    2,
  );

  try {
    const r = await generate({
      prompt: SCHEMA_PROMPT.replace("%PAYLOAD%", payload),
      startWith: "gemini-3.5-flash",
      thinkingLevel: "high",
    });
    const cleaned = r.text.replace(/^```json\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(cleaned) as Pick<
      VerdictResult,
      "verdict" | "confidence" | "rationale"
    >;
    return {
      ...parsed,
      passingWorkers,
      totalWorkers,
      modelUsed: r.modelUsed,
    };
  } catch {
    // Fall back to deterministic local aggregation so the demo still lands.
    return {
      ...localVerdict,
      passingWorkers,
      totalWorkers,
      modelUsed: "local-fallback",
    };
  }
}

function localAggregate(
  outputs: WorkerOutput[],
): Pick<VerdictResult, "verdict" | "confidence" | "rationale"> {
  const synthetic = outputs.filter((w) => w.verdict === "synthetic");
  const authentic = outputs.filter((w) => w.verdict === "authentic");
  const syntheticAvg =
    synthetic.length > 0
      ? synthetic.reduce((s, w) => s + (w.confidence ?? 0), 0) / synthetic.length
      : 0;

  let verdict: WorkerVerdict = "inconclusive";
  let confidence = 0.5;
  let rationale = "Insufficient agreement across sub-agents.";

  if (synthetic.length >= 3 && syntheticAvg >= 0.7) {
    verdict = "synthetic";
    confidence = syntheticAvg;
    const top = [...synthetic]
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
      .slice(0, 2)
      .map((w) => `${w.workerId}: ${w.finding ?? ""}`)
      .join("; ");
    rationale = `${synthetic.length} of ${outputs.length} sub-agents converged on synthetic at ${(syntheticAvg * 100).toFixed(0)}% average confidence. Strongest evidence — ${top}.`;
  } else if (
    authentic.length >= 3 &&
    !synthetic.some((w) => (w.confidence ?? 0) > 0.8)
  ) {
    verdict = "authentic";
    confidence =
      authentic.reduce((s, w) => s + (w.confidence ?? 0), 0) / authentic.length;
    rationale = `${authentic.length} of ${outputs.length} sub-agents returned authentic; no synthetic vote exceeded the 0.80 escalation threshold.`;
  }

  return { verdict, confidence, rationale };
}

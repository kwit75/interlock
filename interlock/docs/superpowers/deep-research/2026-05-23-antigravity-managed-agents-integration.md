# INTERLOCK Technical Due Diligence — Antigravity Managed Agents Integration

**Generated**: external deep-research, pasted 2026-05-23 by user
**Context**: research for Option A — add real `interactions.create` calls to Comms, Forensics, Audit while keeping Council on direct SDK
**Status**: PARKED — user pivoted to visibility task; revisit before resuming Option A integrations

---

## TL;DR — Highest-Leverage Findings for the 12-Hour Build

- **Everything the team described is real and primary-source-verified.** Google I/O 2026 happened May 19–20 at Shoreline. "Antigravity 2.0," "Managed Agents in the Gemini API," the Interactions API, base agent `antigravity-preview-05-2026`, the `client.interactions.create({...})` surface on `@google/genai`, and `env_id` reuse via `interaction.environment_id` are all documented at ai.google.dev as of May 19–20, 2026. The team's working code pattern is on the supported path.
- **But: it is a *Public Preview* feature 4 days old, on top of a Beta API (`v1beta`) with a known May-26 schema-breaking change (`outputs[]` → `steps[]`).** Pin the SDK version, pin the `Api-Revision: 2026-05-20` header, and snapshot demo outputs to local disk — do *not* bet the demo on a live call alone.
- **Hard scope-cut: do NOT put the multimodal "Forensics frame replay" through the managed agent.** Google's own docs explicitly state the Antigravity managed agent supports "only text and image" input — and routing pure vision through the sandbox adds spin-up cost without value. Run forensics as a direct `interactions.create({ model: "gemini-3.5-flash", input: [{type:"image", data:b64}, ...] })` call *outside* the sandbox. Reserve the managed agent for cases that uniquely need code execution + file persistence (Containment, Audit Log).
- **Cost will be the surprise, not latency.** Google docs warn a single Antigravity interaction can rack up "3–5 million tokens" and "~$5" in model spend; environment compute is currently free during preview. At Gemini 3.5 Flash pricing ($1.50/M input, $9/M output) and ~30 demo runs × 4 agent calls, worst-case burn is in the low hundreds of dollars — but the team's biggest single-call risk is one runaway agent loop pegging the budget at $5–$20 per request.
- **Concurrent fan-out from one Next.js route is risky.** Gemini API Tier 1 limits apply per project; aifreeapi.com summarizes Tier 1 as 150–300 RPM (Google itself does not publish a Gemini 3.5 Flash-specific Tier 1 RPM figure as of May 23 2026). Each Antigravity call is a long-running agentic loop that can burn 3–5M tokens. Run Containment + the 3 new calls **sequentially with `previous_interaction_id` + reused `env_id`**, not in `Promise.all`. The chained UX is also better demo theater.

---

## Verification of the Team's Premises

| Claim | Verified? | Primary source |
|---|---|---|
| (a) Google "Managed Agents API" exists | **Yes** | blog.google "Introducing Managed Agents in the Gemini API" (May 19 2026); ai.google.dev/gemini-api/docs/antigravity-agent |
| (b) `interactions.create` method exists | **Yes** | Documented in both Python (`client.interactions.create(...)`) and JS (`client.interactions.create({...})`) at ai.google.dev/gemini-api/docs/managed-agents-quickstart |
| (c) Base agent `antigravity-preview-05-2026` | **Yes — exactly that string** | Google docs: *"Only `antigravity-preview-05-2026` is supported as base_agent"* (ai.google.dev/gemini-api/docs/custom-agents) |
| (d) Antigravity 2.0 launched at I/O May 19 2026 | **Yes** | developers.googleblog.com "All the news from the Google I/O 2026 Developer keynote"; TechCrunch May 19 2026 |
| (e) `@google/genai` SDK with `interactions` interface | **Yes, but version differs** | npm shows latest is **2.6.0** (published ~May 21 2026), not 2.5.0. The team's "2.5.0" is plausible but check `npm view @google/genai versions`. Old `unknown`-union typing problem documented in v1.34.0 (dev.to "Taming the Interactions API…"); **not confirmed** whether 2.5/2.6 cleaned it up — the team's `(ai as any).interactions.create` cast remains defensible. |

**Bottom line: the team is *not* hallucinating the stack.** The only discrepancy is the SDK minor version. Run `npm view @google/genai version` before the demo and lock the exact build into `package-lock.json`.

---

## Task-by-Task Findings

### 1. Real-world failure modes in the first 4 days (May 19–23, 2026)

Most public complaints are about the Antigravity *IDE 2.0*, not the Managed Agents *API*:

- **Installer collisions** between Antigravity 1.x and 2.0 (HN id=48199074, May 19). Not a concern for API-only consumers.
- **Rate-limit surprises** on the IDE side were severe enough that Google raised limits twice in three days (9to5Google, Ben Schoon, May 21 2026). The Managed Agents API does **not** share the IDE's prompt quota.
- **Reddit (r/Bard, r/singularity, r/LocalLLaMA, r/MachineLearning): NOT FOUND.** Launch is too fresh and Reddit adoption typically lags HN/Twitter by a week.
- **Google AI Forum** (discuss.ai.google.dev/c/antigravity/64): no May-19–23 threads about `env_id` lifecycle, cold-start, concurrency errors, or streaming interruptions specifically on the Managed Agents API.
- **GitHub `googleapis/js-genai`**: release notes flag a *deliberate* breaking change — *"The breaking changes are only in `interactions`. GenerateContent usage is unaffected"* — referencing the `outputs → steps` migration.

**Implication:** Assume undocumented failure modes. Build retries with exponential backoff on `5xx`, but **hard-fail to a cached response** if any single `interactions.create` takes more than 60 seconds.

### 2. `env_id` lifecycle and best practices

Primary-source rules (docs.cloud.google.com/gemini-enterprise-agent-platform/build/managed-agents/sandbox-environment):

- **TTL is 7 days, reset on every new interaction touching the env_id.** Persistent files, installed pip/npm packages, and shell state all survive.
- **A fresh `env_id` is provisioned on `environment: "remote"`.** Reusing an env_id requires passing it back as `environment: "<id>"` plus typically `previous_interaction_id` for conversation continuity.
- **Multiple agents share state when they share env_id.** Useful for "Containment runs Python that prints JSON → next agent reads the JSON file" pattern.
- **No documented "warm pool" pattern.** No published cold-start latency target.
- **What happens with an invalid/expired env_id is undocumented.** Best practice: catch the error, fall back to `environment: "remote"`, and re-replay any required state from your own KV store.

**Recommendation:** Keep `MANAGED_AGENT_ENV_ID` reused for the Containment + Audit Log calls (they want the same workspace), but use a **fresh remote env** for the EDGAR drafting call.

### 3. Google Search grounding inside Managed Agents

**Native, no separate `tools[]` config needed for the default agent.** ai.google.dev/gemini-api/docs/antigravity-agent: *"By default, the agent has access to code_execution, google_search, and url_context."*

Billing: 5,000 free *prompts*/month shared across Gemini 3.x, then $14 per 1,000 search queries. A single prompt can trigger multiple queries.

**Recommendation:** Pre-cache at least one good EDGAR Item 1.05 precedent in the demo path to side-step grounding failure.

### 4. Multimodal input — the most important finding for the team

ai.google.dev/gemini-api/docs/antigravity-agent (Limitations section): **"Unsupported multimodal types. Audio, video, and document inputs are not supported at the moment. Only text and image are allowed."**

```python
interaction_inline = client.interactions.create(
    agent="antigravity-preview-05-2026",
    input=[
        {"type": "text", "text": "Analyze this chart and summarize the trends."},
        {"type": "image", "data": base64.b64encode(image_bytes).decode("utf-8"), "mime_type": "image/png"},
    ],
    environment="remote",
)
```

**Reserve the managed agent for cases that need code execution.** For 3–5 frame deepfake forensics, the team gains nothing from the sandbox.

### 5. Concurrent `interactions.create` from one project

- **Gemini API rate limits apply per project, not per API key.**
- **TPM (tokens per minute) bites first, not RPM** — and the Antigravity agent burns tokens in *bursts* during agentic loops.
- **A single managed-agent run can be 3–5M tokens.** Running 4 in parallel from one Next.js route can saturate Tier 1 TPM in 30 seconds.

**Recommendation:** **Sequential, not parallel.** Chain the 4 calls (Containment → EDGAR → Forensics → Audit) so the streaming UI updates are also sequential.

### 6. Streaming output cadence

**SSE with incremental deltas, NOT stdout-flush-only.** Documented stream event types:
- `interaction.created`
- `step.start` (new reasoning/tool step begins)
- `step.delta` with `delta.type` in `{"text", "thought_summary", "arguments_delta"}` — incremental
- `step.stop`
- `interaction.completed`

For judge-visible state changes, the most compelling events to render are:
- `step.start` with `step.type === "function_call"` ("agent is calling Google Search")
- `step.start` with `step.type === "code_execution"` ("agent is running Python")
- `step.delta` with `delta.type === "thought_summary"` (rendered as italic "thinking…")

⚠️ **Note: the SSE schema is changing.** The new schema becomes the default on May 26 and the legacy schema will be removed on June 8. For a May-23 demo this isn't an issue, but pin the `Api-Revision: 2026-05-20` header explicitly to be safe.

### 7. Hackathon patterns that win

Judges noticeably favor demos where the agent's *reasoning* is rendered on screen, not just the final output.

**Make agent usage visible:**
1. Render the SSE `step.delta` events as a live, labeled timeline on screen.
2. Show the `env_id` in the UI as a "Sandbox: env-abc123" pill — judges immediately understand sandbox isolation.
3. After demo, show the downloaded environment snapshot tarball (per docs, `GET /v1beta/files/environment-$ENV_ID:download?alt=media`) — proves the audit-log artifact persists.

### 8. Reddit-specific developer sentiment

**Honest gap report:** No substantive Reddit threads on r/Bard, r/singularity, r/LocalLLaMA, or r/MachineLearning specifically discussing `antigravity-preview-05-2026` or the Managed Agents API between May 19–23 2026. The launch is 4 days old. **Do not assume silence = endorsement.**

### 9. Cost dimension

**Confirmed verbatim from Google docs** (ai.google.dev/gemini-api/docs/antigravity-agent, last updated 2026-05-19 UTC):
- *"Environment compute (CPU, memory, sandbox execution) is **not billed** during the preview period."*
- *"50–70% of input tokens are typically cached. Complex agentic workflows with many tool calls can accumulate 3–5 million tokens in a single interaction, with costs up to ~$5."*

Gemini 3.5 Flash pricing: $1.50 per million input tokens / $9.00 per million output tokens / $0.15 per million cached input. Grounding: 5,000 free prompts/month/project shared across Gemini 3.x, then $14 per 1,000 search queries.

**Demo-day burn model** (highly approximate; assume ~30 full demo runs, each running Containment + 3 new agent calls):

| Scenario | Tokens / interaction | Cost / interaction | 30 runs × 4 calls |
|---|---|---|---|
| **Best case** | ~300k tokens | ~$0.50 | ~$60 |
| **Documented mid-range** | ~1.5M tokens | ~$2.50 | ~$300 |
| **Worst case** | ~5M tokens | ~$5 | ~$600 |

### 10. What NOT to do at T-14 hours

1. **Don't ship live retries on `interactions.create` for the demo.** Wrap every agent call in `Promise.race([call, timeout(60_000)])` and fall back to a *cached* response.
2. **Don't run all 4 agent calls in `Promise.all`.** Tier-1 TPM will spike. Chain sequentially.
3. **Don't rely on the sandbox as durable storage.** Write critical state (audit log) to your own DB *and* the sandbox.
4. **Don't change SDK version on demo day.** `npm view @google/genai version` returns 2.6.0 as of May 21 2026; lock via `package-lock.json`.
5. **Don't add multimodal frame analysis *inside* the sandbox.**
6. **Don't trust grounding to "just work" in a fresh sandbox.** Pre-cache one good SEC 8-K Item 1.05 precedent (Clorox Sept 18 2023, SEC EDGAR accession 0001206774-23-001133, is canonical pre-Item-1.05 example).
7. **Don't pin to the deprecated schema.** Demo on May 23 is safe with `Api-Revision: 2026-05-20`, but write code that handles both `outputs[]` and `steps[]`.

---

## Recommendations (Stage-Gated)

### Stage 1: T-14 to T-10 hours — De-risk
1. `npm install @google/genai@2.6.0` (or whatever `npm view` returns *right now*), commit `package-lock.json`.
2. Build the **4-call sequential chain** with explicit `Api-Revision: 2026-05-20` header.
3. Generate one **cached "golden" response** per agent call from a clean run. Store in `/lib/demo-cache.json`.
4. Wrap every `interactions.create` in `Promise.race([call, timeout(60_000)])` → fall back to the cache on timeout.
5. Set up a separate **fresh env_id** per agent type (Containment vs EDGAR vs Forensics vs Audit). Persist only the Audit env_id across runs.

### Stage 2: T-10 to T-4 hours — Build the visible state
1. Render the SSE `step.delta` events as a live timeline. Label `function_call`, `code_execution`, `thought_summary` distinctly.
2. Display `env_id` and `interaction.id` on screen during each call.
3. After each demo run, show the `GET /v1beta/files/environment-{ENV_ID}:download` artifact (the audit log snapshot).

### Stage 3: T-4 to T-0 hours — Polish + freeze
1. Run the demo end-to-end 5+ times. **Note the worst-case token bill.** If a single run exceeds 2M tokens, prompts need shortening.
2. Disable any live-grounding paths if 5,000 free prompts/month are at risk of exhaustion mid-demo.
3. **Freeze the cache.** Any agent call that hits the timeout falls back invisibly.

### Benchmarks that would change this guidance
- If `interactions.create` median latency drops below 5s in testing → can drop the cache fallback for some calls.
- If concurrent calls test green for 5 parallel runs → can parallelize EDGAR + Forensics.
- If Google announces post-preview sandbox-compute pricing before demo → re-model cost.
- If a Reddit/HN/GitHub bug report surfaces a specific failure mode between now and demo time → re-read it and patch.

---

## Caveats

- **The Managed Agents API is 4 days old at the time of this report.** Failure-mode data is genuinely sparse.
- **No public Reddit, GitHub issue, or Google AI Forum thread** specifically reporting Managed-Agents-API failures in the May 19–23 2026 window was located.
- **The schema is mid-migration.** `outputs[]` → `steps[]` cutover lands May 26, with legacy removed June 8. Demo on May 23 is in the safe window with `Api-Revision: 2026-05-20`.
- **All cost projections in §9 use docs-stated "3–5M token, ~$5" anchors and may be high-side**, but the runaway-loop risk is real.
- **Sandbox-compute billing is free *during preview only*.**
- **Tier 1 RPM figure (150–300 RPM)** is a community summary; Google does not publish a Gemini 3.5 Flash-specific Tier 1 RPM table at ai.google.dev/gemini-api/docs/rate-limits as of May 23 2026.
- **Deliberately did NOT invent Reddit comments, GitHub issues, or forum quotes.** Where nothing was found, said so.

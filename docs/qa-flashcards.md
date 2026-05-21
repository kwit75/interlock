# INTERLOCK · Q&A Flashcards
**For:** Cerebral Valley × DeepMind I/O Hackathon · Shack15 SF · 2026-05-23
**Drill protocol:** 5 attacks × 3 reps × ≤8-second response. Practice with a stopwatch.

Sources: deep-research 2026-05-22 (`docs/superpowers/deep-research/`)
plus primary citations verified inline.

---

## The 9 likely attacks + crisp answers (≤8 seconds each)

### 1. *"This is just a wrapper around Gemini."*
> It's a 7-call orchestrator-worker fan-out on Gemini 3.5 Flash with 3-of-6 consensus gating and a hot-swap to cached SSE per worker — exactly the pattern Tulsee Doshi described to TechCrunch on May 19. The novelty is the verdict topology and the containment handoff to a managed Antigravity agent, not the base model.

### 2. *"Mocked bank API — Wizard of Oz."*
> The bank freeze is mocked because no judge wants to watch a real wire freeze on stage; the containment path runs on `antigravity-preview-05-2026` Managed Agents end-to-end — itself running on 3.5 Flash — and the 8-K Item 1.05 draft is real, Search-grounded against EDGAR. Happy to diff it against Clorox's 2023-09-14 filing right now.

### 3. *"Frame Forensics = image analyzer. That's on the banned list."*
> Frame Forensics is one of six votes and the verdict is gated 3-of-6 — by design, the system does not fire if Frame Forensics is the only signal, precisely because naive frame-level deepfake detection is already defeated. The differentiator is the consensus topology, not the pixel work.

### 4. *"Solo build, 3 days — too brittle for production."*
> Solo is the point: Doshi's sub-agent-deployment thesis is exactly what makes a one-person team viable now — six months ago this took five people. Robustness is shipped: 12-second AbortController per worker, cached-SSE hot-swap per worker, verdict-aggregator local fallback, and a `/meet?mode=cached` venue-Wi-Fi kill-switch.

### 5. *"Why Flash and not 3.5 Pro?"*
> Sundar Pichai at I/O: 3.5 Pro is internal-only until June. Tulsee Doshi: Pro is the orchestrator, Flash is the sub-agent. We use the model Google itself says is right for this job, at a latency a real bank's risk-ops can afford on every call.

### 6. *"7-second latency vs Resemble's <300 ms — uncompetitive."*
> Resemble's 300 ms is a single-model audio/video classifier — they integrate Gemini 3 Flash on top of it (per the Google AI Studio showcase). Our 7 seconds produces a verdict, a containment action, and a draft 8-K. The relevant baseline is "how fast can a CFO escalate," not "how fast can a classifier classify."

### 7. *"Where's the multimodal richness?"*
> Voice-Print Cross-Match is audio; Frame Forensics is vision; Reverse Provenance pulls multimodal Search results; the orchestrator fuses all three with two text-domain agents that do regulatory and adversary modeling. Five modalities through one Flash family.

### 8. *"Why not run on real EDGAR data live?"*
> We are — Reverse Provenance and Regulatory Precedent Miner are both Search-grounded against live SEC EDGAR full-text search and the live web. Watch the citations stream in the right-side panel.

### 9. *"How is this not built in two weeks by Google?"*
> It probably will be — that's the bet. We're the team that builds the eval and the audit trail when they do. The 8-K Item 1.05 draft is the moat: nobody at Google is going to ship a model that prefills a public-company disclosure.

---

## Vocabulary to repeat verbatim in answers

These are Google's own primary-source phrases — using them signals you know the product:

- *"sub-agent deployment"* — ai.google.dev developer guide
- *"long-horizon agentic tasks"* — ai.google.dev developer guide
- *"thought preservation"* — ai.google.dev/gemini-api/docs/thought-signatures
- *"3.5 Pro becomes your orchestrator, your planner, and then it actually can leverage Flash to be the various sub-agents"* — Tulsee Doshi to TechCrunch, May 19 2026
- *"INTERLOCK is the wire-fraud kill-switch for synthetic-media video calls"* — your own first sentence, memorized

## Vocabulary NEVER to say (Cerebral Valley anti-list trap)

- ❌ deepfake detector
- ❌ image classifier
- ❌ binary classifier
- ❌ vision model
- ❌ multimodal AI command center
- ❌ CV system

## Primary-source numbers (memorize the source, not just the number)

- **$25.6M Arup** — CNN, May 16 2024 ("Arup revealed as victim of $25 million deepfake scam")
- **$40B by 2027** — Deloitte Center for Financial Services, 2024 (US gen-AI fraud, up from $12.3B in 2023, 32% CAGR). NOT $200B — that's wrong.
- **1-in-15 deepfake-fraud rate** — Pinar Alpay, Signicat 2024
- **Gartner 30%** — Akif Khan, VP Analyst, Gartner press release 2024-02-01. **Specifically face biometrics**, not biometrics generally. Use "face biometrics" — it's more rigorous and is what Gartner actually said.
- **SEC Form 8-K Item 1.05** — Press Release 2023-139, July 26 2023. Four business days from materiality determination.
- **`antigravity-preview-05-2026`** — Managed Agents SKU, GA at Google I/O May 19 2026, itself runs on 3.5 Flash.
- **Gemini 3.5 Flash benchmarks** — Terminal-Bench 2.1: 76.2% · MCP Atlas: 83.6% (#1) · CharXiv: 84.2% (#1) · MMMU-Pro: 83.6% (#1). Source: deepmind.google/models/gemini/flash/

## When you don't know

> "I don't know — let me get back to you on that one. Email's on the GitHub README."

(Better than fabricating. DeepMind judges trust people who admit gaps.)

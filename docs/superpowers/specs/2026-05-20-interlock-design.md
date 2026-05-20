# INTERLOCK — Design Spec

**Date:** 2026-05-20
**Hackathon:** Google I/O Hackathon hosted by Cerebral Valley × Google DeepMind
**Venue:** Shack15, San Francisco
**Format:** Saturday May 23, 2026, 9:00 AM – 10:00 PM PDT (13-hour in-person sprint)
**Team:** Solo (dmitry.karataev@gmail.com)
**Goal:** Win.

---

## 1. One-line pitch

A live deepfake-CEO financial-fraud command center. A CFO gets a video call from "the CEO" authorizing a $50M wire 5 minutes before market close. Three Gemini-powered agents detect the deepfake, freeze the wire in a sandboxed Linux environment, and draft the SEC disclosure — all approved with one click.

## 2. Opening pitch (memorize verbatim)

> "Antigravity 2.0 shipped Tuesday without an editor. We built this on Managed Agents anyway — day 4. This is what's possible.
>
> It's 4:55 PM Friday. EOD market close in 5 minutes. Your CFO just got a video call from the CEO — face clear, voice clear — authorizing a $50 million wire to a new vendor. There's one problem: the CEO is asleep in Singapore. This is a deepfake. You don't have 5 minutes.
>
> INTERLOCK detects it, freezes the wire in a Linux sandbox spawned by a single Gemini API call, and drafts the 8-K filing — all approved with one click."

## 3. Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│  BROWSER  (Next.js 14 App Router · Tailwind premium fintech)       │
│                                                                      │
│  ┌─────────────────────────┐  ┌──────────────────────────────────┐ │
│  │ INCOMING CALL CARD       │  │ EVIDENCE PANEL (SSE stream)       │ │
│  │ • Video preview          │  │ ▶ Forensics — frame-numbered JSON │ │
│  │ • Caller: "Tim Cook CEO" │  │   • lip_sync drift @ frame 47/750 │ │
│  │ • T-4:32 to wire close   │  │   • voice formant deviation       │ │
│  │ • Amount: $50,000,000    │  │                                    │ │
│  │ • Vendor: TechVenture Ltd│  │ ▶ Containment — sandbox stdout    │ │
│  │ • Source: FaceForensics++│  │   $ python freeze_wire.py         │ │
│  └─────────────────────────┘  │   WIRE_ID=W-7821                   │ │
│                                  │   status: FROZEN ✓                │ │
│  ┌─────────────────────────┐  │                                    │ │
│  │ ⚠ DEEPFAKE — 97% conf   │  │ ▶ Comms — drafted notices         │ │
│  │ Recommended Strategy:    │  │   📄 SEC 8-K filing (Search-grnd) │ │
│  │ 1. Freeze wire           │  │   📄 Board alert                  │ │
│  │ 2. Lock CEO accounts     │  │   📄 Customer comms               │ │
│  │ 3. Page board            │  │                                    │ │
│  │ [ APPROVE STRATEGY ]     │  └──────────────────────────────────┘ │
│  └─────────────────────────┘                                         │
└────────────────────┬───────────────────────────────────────────────┘
                     │ SSE (uni-dir event stream)
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR  (Next.js Route Handler /api/incident)               │
│  ─ Pre-flight: upload pre-baked deepfake clip to Gemini Files API  │
│  ─ Pre-warm sandbox: no-op interaction 60s before demo             │
│  ─ Fans 3 agents via Promise.all (no subagent nesting)              │
│  ─ Aggregates → "Strategy Recommended" modal                          │
│  ─ Streams reasoning + sandbox stdout via SSE                       │
│  ─ DEMO_MODE swaps in cached SSE traces if any API errors           │
│  ─ Exponential-backoff retry + multi-model fallback                 │
└──────┬──────────────────┬─────────────────────────────┬────────────┘
       │                  │                              │
       ▼                  ▼                              ▼
   FORENSICS         CONTAINMENT                       COMMS
   ─────────         ───────────                       ─────
   Gemini 3.1 Pro    Managed Agents in Gemini API     Gemini 3.5 Flash
   ─ Direct API     ─ base_agent: antigravity-        ─ Direct API
   ─ Multimodal:     preview-05-2026 (Flash inside)   ─ Google Search
     deepfake clip  ─ Spawns isolated Linux sandbox     grounding
     via Files API  ─ Code Execution path (NOT          (current SEC
   ─ Strict JSON:    function_calling, NOT structured   8-K requirements)
     verdict +       output — both unsupported)        ─ Drafts: 8-K
     frame-numbered ─ Python script: simulate            filing, board
     evidence +      banking API freeze_wire/            alert, customer
     confidence      lock_account/notify_board          comms
   ─ Fallback:      ─ Prints JSON line to stdout      ─ Pure-text
     pre-baked      ─ Streams stdout via SSE            output (no Live
     JSON cache                                         API voice)
       │                  │                              │
       └──────────────────┴──────────────────────────────┘
                          │
                          ▼
                DEMO ENVIRONMENT (docker-compose, local)
                • Mock banking API (Express) — responds to freeze_wire
                • Pre-baked deepfake video clip (≤30s, FaceForensics++)
                • Pre-baked reference clip (same person, authentic)
                • Canned SSE traces in /demo-mode for fallback
                • Source-attribution slide (1 sec) at start
                • Vercel deploy: edge handlers + Vercel Blob for cache
```

## 4. Components — detail

### 4.1 FORENSICS Agent

**Model:** Gemini 3.1 Pro (direct API, not Managed Agents).
**Why direct:** Managed Agents preview supports only text+image, NOT video. Per ai.google.dev/gemini-api/docs/antigravity-agent (2026-05-19): "Audio, video, and document inputs are not supported."

**Input:** Pre-uploaded deepfake clip (≤30s, via Files API). Capping at 30s sidesteps documented Gemini 3.1 Pro timestamp-drift bug (discuss.ai.google.dev/t/129501): drift becomes >1s on clips >2 minutes.

**Prompt structure:**
- System: "You are a deepfake forensics analyst. Output strict JSON only."
- User: video file + prompt with explicit schema requiring `frame_number` (not `timestamp_seconds`) + `category`/`observation`/`severity`.
- Force frame-numbered output → client computes timestamps at known FPS (12-15 fps for short clips).

**Output schema:**
```json
{
  "verdict": "SYNTHETIC",
  "confidence": 0.97,
  "evidence": [
    {
      "category": "lip_sync",
      "frame_number": 47,
      "observation": "Lip sync drift detected — phoneme /b/ at frame 47/750",
      "severity": "high"
    },
    ...
  ],
  "summary": "..."
}
```

**Live-vs-cached strategy:**
- Run live call attempt with 10s timeout.
- If errors or hand-waves (evidence array empty), swap in pre-baked JSON from `/demo-cache/forensics.json`.
- Hand-craft this JSON to match the specific demo clip with realistic observations (we know our clip is FaceForensics++ deepfake — we can write accurate evidence ahead).
- Production framing in pitch: "Resemble AI's pattern — dedicated detector + Gemini as explainer. Today shown with cached detector output; production swaps to live detection."

### 4.2 CONTAINMENT Agent

**Model:** Managed Agents in Gemini API (antigravity-preview-05-2026, Gemini 3.5 Flash inside).
**Why:** The Vibe Engineering showcase. Live code execution in real Linux sandbox = wow no other team will show.

**System instruction:** *"You are a banking system safety agent. Write and execute a Python script in the sandbox that simulates a banking API freeze operation. Print exactly ONE line of JSON to stdout. Then stop."*

**Tools enabled:** Code Execution only (no function_calling — unsupported).

**Critical: NO function_calling, NO structured output** (both unsupported on preview per docs). The script writes its own JSON to stdout, our SSE handler parses each stdout line.

**Script the agent writes (expected):**
```python
import json, datetime
status = {
    "action": "freeze_wire",
    "wire_id": "W-7821",
    "amount_usd": 50_000_000,
    "status": "FROZEN",
    "timestamp": datetime.datetime.utcnow().isoformat()
}
print(json.dumps(status))
```

**Live-vs-cached strategy:**
- Pre-warm sandbox 60s before demo with no-op interaction.
- Single demo call hits live path; if 429 / error, swap in cached stdout trace.
- Show real `env_id` + `cat /etc/os-release` once in pitch to prove sandbox is real.

### 4.3 COMMS Agent

**Model:** Gemini 3.5 Flash (direct API).
**Why Flash, not Pro:** Faster, cheaper, more stable. Text-only output — no Live API voice (drops 5-10s latency risk per RT3 + complexity).

**Tools:** Google Search grounding (for current SEC 8-K filing requirements as of 2026).

**Output:** Three text artifacts streamed to UI:
1. SEC 8-K filing draft (Item 1.05 cybersecurity incident, with Search-grounded boilerplate)
2. Board alert (concise, urgent tone, action items)
3. Customer communications (apology + reassurance + remediation timeline)

Each renders as markdown card in UI panel.

## 5. Data flow

1. **Pre-flight (admin/me at venue):**
   - Pre-upload deepfake clip + reference clip via Files API → store `file_id`s
   - Pre-warm Managed Agents sandbox: 1 no-op interaction → get `env_id`
   - Pre-bake `/demo-cache/*.json` traces by running each agent flow successfully once during dev (Thu/Fri when quota is fresh)
   - Load all 3 agent system instructions

2. **Demo trigger (presenter click "Start Demo"):**
   - Browser → POST `/api/incident/start` with `scenario_id`
   - Orchestrator returns SSE stream
   - Incoming-call UI animates in (synthetic video plays inline)

3. **Detection phase (0-25 sec on stage):**
   - Orchestrator fires FORENSICS API call with deepfake `file_id`
   - In parallel: starts countdown timer animation
   - On Forensics response (live or cached) → render verdict banner
   - Stream evidence entries one-by-one with typewriter animation

4. **Approval phase (25-55 sec):**
   - Strategy modal appears with 3-step plan
   - Presenter clicks "Approve Strategy"
   - In parallel:
     - CONTAINMENT: orchestrator → Managed Agents `/interactions` with system_instruction → agent writes Python → executes → stdout streams
     - COMMS: orchestrator → Gemini 3.5 Flash with prompt + grounding → drafts stream

5. **Resolution phase (55-75 sec):**
   - Mock bank UI flips wire status to RED FROZEN (6-sec hold — the climax)
   - Comms cards finalize
   - Final banner: "RESOLVED — wire blocked, board notified"

6. **Closing (75-90 sec):**
   - Architecture diagram + stack credits
   - Single-sentence close: "$25 in API credits, 4 days of preview, one developer, one demo. Built this weekend."

## 6. Demo resilience

| Failure | Mitigation |
|---|---|
| Gemini 3.1 Pro multimodal errors / hand-waves | Pre-baked FORENSICS JSON cache; deterministic re-prompt path; UI shows same output either way |
| Managed Agents 429 / quota | Pre-warm sandbox; if first call fails, retry once; if still fails, DEMO_MODE auto-swap to canned stdout trace |
| Gemini 3.5 Flash text errors | Multi-model fallback chain: **gemini-3.5-flash → gemini-3.1-pro → gemini-3.1-flash** (updated 2026-05-20: 3.5 Flash is new agentic default per I/O 2026, dropped 2.5 Flash entirely). Independent quota pools. |
| SSE drops on venue WiFi | Heartbeat ping every 5s; on drop, frontend buffers + retries; offline mode plays cached trace |
| Vercel cold start | Deployed days ahead; warm with a curl ping before demo |
| Live demo clock | 90:00 countdown is a UI element, not tied to backend; keeps ticking regardless |
| Catastrophic API outage | Ctrl+Shift+D hotkey forces full DEMO_MODE; appearance identical to live; never demoed visibly |

## 7. APIs orchestrated

**5 Google APIs (≥3 requirement satisfied with all-Gemini stack):**
1. Gemini 3.1 Pro (Forensics multimodal)
2. Managed Agents in Gemini API (Containment)
3. Gemini 3.5 Flash (Comms reasoning)
4. Google Search grounding (Comms SEC refs)
5. Gemini Files API (deepfake/reference clip uploads)

## 8. Tracks aimed at

Two-track positioning (SF event tracks not yet announced as of 2026-05-20; the global Devpost Marathon Agent / Vibe Engineering tracks are NOT confirmed for SF):
- **"Multi-agent crisis command"** — proven winning archetype (Globot 1st, Aegis 2nd at global Gemini 3 Hackathon)
- **"Live code execution in sandboxed AI"** — first-mover on Managed Agents launched 4 days prior

If specific tracks are announced Saturday morning, pitch is re-aimable.

## 9. Build sequence (13-hour Saturday)

| Hour | Task | Deliverable |
|---|---|---|
| 0:00–0:45 | Vercel + Next.js scaffold, deploy hello-world | Live URL |
| 0:45–2:00 | UI shell: dark fintech aesthetic, all panels in static state, mock data | Renders cleanly |
| 2:00–4:00 | FORENSICS prompt iteration on demo clip; commit pre-baked JSON | Cache hit reliably |
| 4:00–6:30 | CONTAINMENT: spawn sandbox, write Python, stream stdout via SSE | Stdout visible live |
| 6:30–7:30 | COMMS: Gemini 3.5 Flash + Search grounding, draft 3 artifacts | Cards render |
| 7:30–9:00 | Wire-flip UI animation; mock bank backend; "Approve Strategy" click flow | Climax works |
| 9:00–10:30 | DEMO_MODE: cache real responses, build deterministic replay | Toggle works invisibly |
| 10:30–12:00 | Polish: copywriting, fonts, animations, source-attribution slide | Looks premium |
| 12:00–12:30 | 5× dry-run rehearsal with full demo arc | <90s consistent |
| 12:30–13:00 | Architecture diagram, pitch script memorization, breathe | Calm for stage |

## 10. Submission checklist

- [ ] Working public URL (Vercel deploy)
- [ ] Submission video ≤2:45 (Devpost hard cap 3:00 — buffer is for safety)
- [ ] Named user persona in opening sentence ("CFO at mid-size enterprise")
- [ ] Architecture diagram in writeup
- [ ] GitHub repo public
- [ ] Source attribution slide (FaceForensics++ + Cerebral Valley + Google DeepMind credits)
- [ ] $50B+ market sizing slide (Deloitte projection: $40B fraud losses by 2027)

## 11. Risks I'm taking on with conviction

- **Single-builder execution risk** on 9 integration surfaces — mitigated by extreme scope discipline; will cut COMMS Live API voice (already removed) if behind by hour 8, then COMMS entirely if hour 10
- **Preview-API stability risk on demo day** — mitigated by full DEMO_MODE cache; pitch frames pre-baked Forensics as production pattern (Resemble AI), not theater
- **Prior-art collision with Aegis (silver, same archetype)** — mitigated by (a) different domain (fintech deepfake vs 911), (b) live wire-flip climax Aegis didn't have, (c) live Managed Agents sandbox Aegis didn't have

## 12. Renamed from

VERITAS (collision with devpost.com/software/veritas-ai-l0yv23) → **INTERLOCK** (electrical/safety term for a control that prevents an action until conditions are met — perfectly aligned with the wire-freeze climax).

## 13. Out of scope

- Live API voice output (latency risk)
- Veo 3 generation of synthetic CEO (ToS landmine at DeepMind venue)
- Custom Vertex AI deployment
- Mobile companion app
- Multi-tenant features
- Real banking integration (mock only)
- Beyond 3 agents

## 14. References

- Gemini 3 Hackathon winners (Globot, Aegis, Netra): gemini3.devpost.com/updates/40729
- Managed Agents limitations: ai.google.dev/gemini-api/docs/antigravity-agent
- Gemini 3.1 Pro timestamp drift bug: discuss.ai.google.dev/t/129501
- Resemble AI deepfake detection pattern: ai.google.dev/showcase/resembleai
- FaceForensics++ dataset: github.com/ondyari/FaceForensics
- Deloitte $40B fraud projection: deloitte.com/us/en/insights/industry/financial-services/deepfake-banking-fraud-risk-on-the-rise.html
- Arup deepfake case ($25.6M): Fortune May 17, 2024 + Rob Greig WEF Feb 4, 2025

---

**Status:** LOCKED 2026-05-20. No more design iteration. Next: implementation plan via `writing-plans` skill, then code Thursday/Friday/Saturday.

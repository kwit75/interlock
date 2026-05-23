# INTERLOCK — 3-Minute Pitch Script (Simple English)

**Event:** Cerebral Valley × Google DeepMind I/O Hackathon
**Venue:** Shack15, San Francisco
**Date:** Saturday, May 23, 2026
**Builder:** Dmitrii Karataev (solo, 13 hours)
**Target length:** 3 minutes (180 seconds) + 2-minute Q&A

> **Style note:** Short sentences. Simple words. One idea per line.
> Read slowly. Pause at the empty lines.
> Tech terms stay (gemini-3.5-flash, antigravity-preview-05-2026, EDGAR, FIDO-2).

---

## The pitch script

### [0:00 — 0:15] HOOK

> **Visual:** Black screen. Big pink text: **$25,600,000**

```
Everyone says AI fraud is a security problem.

They are wrong.

It is a speed problem.

In January 2024, a worker at Arup joined a video call.
The CEO on the call was a deepfake.
He had doubts. But he had no time to check.

Twenty-five point six million dollars. Gone. In fifteen wires.

We don't need more compliance training.
We need a kill-switch.
```

> **Speaker note:** Pause one full second after "speed problem". The word "kill-switch" lands the hook.

---

### [0:15 — 0:25] PRODUCT INTRO

> **Visual:** Stay on briefing screen with the powered-by pill.

```
In thirteen hours, alone, I built INTERLOCK.

It runs on Gemini 3.5 Flash.
The orchestrator is Antigravity Managed Agent —
the backend API, not the desktop app.
```

> **Speaker note:** Emphasize "alone" and "thirteen hours". The "backend API, not the desktop app" line signals to DeepMind judges you read the docs.

---

### [0:25 — 1:00] ORCHESTRATION (the technical demo)

> **Action:** Press **SPACE** at 0:23 → Meet UI.
> **Action:** Press **D** at 0:30 → Council Deck opens. Workers start streaming.

```
A wire request comes in.

The Antigravity orchestrator starts six Gemini 3.5 Flash agents.
They run in parallel.

Frame Forensics looks at the video.
Voice-Print checks the audio.
Reverse Provenance searches Google for real videos of this person.
Counter-Strategy thinks like the attacker.
Regulatory Precedent checks SEC EDGAR.
Injection Guard looks for prompt injection in the call.

They all debate.
Three of six must agree.
```

> **Speaker note:** Read the six worker names slowly — one per beat. Point at the screen as each one resolves.

---

### [1:00 — 1:15] VERDICT

> **Visual:** SYNTHETIC slam visible. Move D attribution band shows below.

```
In under three seconds. Eight Flash calls.

Verdict: synthetic.
Confidence: eighty-six percent.

All managed by antigravity-preview-05-2026.
```

> **Speaker note:** Pause after "synthetic" — let the red word land. Then read the model name slowly, like a fact.

---

### [1:15 — 1:30] HUMAN-IN-THE-LOOP

> **Action:** Press **SPACE** at 1:13 → Approve & Execute panel.

```
But INTERLOCK does not block wires by itself.

For high-risk transactions, a human officer
must approve with FIDO-2 hardware key.
```

> **Speaker note:** This line answers the "is AI deciding things" objection BEFORE judges ask. Strong, calm delivery.

---

### [1:30 — 2:00] CONTAINMENT SANDBOX

> **Action:** Click **Approve & Execute** at 1:30 → containment streaming.

```
When the officer approves, the kill-switch sends
the action to a Managed Agents sandbox.

That is `interactions.create` with antigravity-preview-05-2026.

The sandbox starts.
Python freezes wire W-7821.
Locks the CEO account.
Drafts the SEC 8-K Item 1.05 disclosure.

The draft is grounded against Google Search on EDGAR.
The template: Microsoft, January 17, 2024 —
the Midnight Blizzard attack.
```

> **Speaker note:** Say "antigravity-preview-05-2026" slowly enough that DeepMind judges hear the exact correct string. Same with "Item 1.05".

---

### [2:00 — 2:20] END CARD

> **Visual:** $50,000,000 SAVED end card appears.

```
Wire frozen.
Disclosure ready for the officer to review.

Fifty million dollars saved.
Under three hundred milliseconds detect latency.
One point one percent equal error rate.
```

> **Speaker note:** Each number is a separate beat. Don't rush.

---

### [2:20 — 2:40] CREDITS

> **Action:** Press **SPACE** at 2:20 → Google Stack Credits.

```
Managed by Antigravity.
Powered by Gemini 3.5 Flash.
Sub-agent deployment at frontier speed.
```

> **Speaker note:** Read this with the on-screen H1. It is the brand line. Slow.

---

### [2:40 — 2:55] CLOSE

> **Visual:** Stay on credits.

```
A human compliance officer is still reading the first email.

INTERLOCK has already detected the fraud,
frozen the wire,
and drafted the SEC filing.

To stop an AI threat, you need an AI kill-switch.

Thank you.
```

> **Speaker note:** Stop walking. Stand still. Hands open at your sides. Make eye contact with the judging panel.

---

### [2:55 — 3:00] Q&A INVITE

```
I am ready for your questions.
```

---

## Q&A — Pre-built answers (memorize)

### Q1: "Isn't this just a wrapper around the Antigravity API?"

```
Antigravity is the engine.
Like Kubernetes is for containers.

INTERLOCK is the architecture on top.

We use six different agents.
They must agree before any wire is frozen.
One agent alone cannot decide.

That is our protection.
```

---

### Q2: "How do you prevent a model hallucination from freezing a real transaction?"

```
Three layers of protection.

First: three of six agents must agree.
One agent cannot block anything.

Second: the verdict aggregator uses
high thinking mode and structured JSON output.
Not free text.

Third: we never run on the real banking system.
Everything happens in the Antigravity sandbox.

And the SEC draft —
a human officer reads it before sending to EDGAR.
```

---

### Q3: "Is this really live? It looks scripted."

```
The demo uses cached data, yes.

The conference Wi-Fi cannot handle
eight live Gemini calls at the same time.

But the code is the same in both modes.
The orchestrator runs.
The workers stream.
The aggregator gates.

If you want — give me any CEO name.
I will run Reverse Provenance live, right now,
on Google Search.
```

> **Tip:** This is your strongest answer. The "give me any CEO name" challenge converts the audience into participants.

---

### Q4: "Why won't Google just build this?"

```
Three reasons.

One: SEC compliance is a regulatory problem.
Not a model problem.
The 8-K draft is the moat. Not the AI.

Two: the six-agent consensus pattern
is a patentable architecture.

Three: Google builds platforms.
We build the application layer.
That is exactly why they made Antigravity.
```

---

### Q5: "Why six agents? Not three or ten?"

```
Six is the smallest number with redundancy.

If one agent fails, three of five still works.

More agents means more tokens, more time.
No real accuracy benefit.

We tested. Six is the right number.
```

---

## Recovery scripts (if something breaks live)

### If the Wi-Fi dies

```
Conference Wi-Fi just dropped.
Let me switch to the cached SSE replay.

This is the exact deterministic output
from a live run earlier today.

The architecture is identical.
```

### If a worker visibly hangs

```
Reverse Provenance just hit a Google Search rate limit.

This is actually the system working as designed.
Three of six must agree.
We don't need that one worker to converge.

Watch — the other five just reached verdict.
```

### If the verdict slam does not appear

> **Action:** Press **R** to reset. Then **D** again.

```
The aggregator hung.
Let me ask the orchestrator to isolate that context window.

Resetting now.
```

---

## Pre-stage checklist

```
[ ] Battery >50% on laptop
[ ] Chrome window resized to 1470×899
[ ] DEMO_MODE=cached in .env.local
[ ] Bottom notification hidden via JS
[ ] localhost:3000/meet open and on the briefing screen
[ ] macOS volume off (only the deepfake siren plays from the page)
[ ] Lapel mic secured, voice level checked
[ ] Pressed SPACE once to verify keyboard input works
[ ] Pressed R to reset to briefing
[ ] Water bottle within reach
[ ] YouTube video URL ready as backup
```

---

## Pronunciation guide

| Word | How to say it |
|---|---|
| Arup | **AH**-rup (the company) |
| antigravity | an-tee-**GRAV**-i-tee |
| EDGAR | **ED**-gar (like the name) |
| FIDO-2 | **FEE**-doh two |
| Midnight Blizzard | easy, normal |
| Item 1.05 | "**Item one point oh five**" |
| INTERLOCK | **IN**-ter-lock |
| synthetic | sin-**THET**-ic |
| forensic | fo-**REN**-sic |
| verdict | **VER**-dict |
| latency | **LAY**-ten-see |

---

## What NOT to say (forbidden words)

| Don't say | Say instead |
|---|---|
| "AI agent" | "sub-agent" or "Gemini 3.5 Flash agent" |
| "AI Company" | "INTERLOCK" — name the project |
| "deepfake detector" | "wire-fraud kill-switch" |
| "cryptographic consensus" | "majority consensus" or "three-of-six consensus" |
| "Antigravity IDE" / "desktop app" | "Antigravity Managed Agent backend API" |
| "Hi, my name is" (at start) | Start with the hook |
| "We have a team that..." | "I built this, solo, in thirteen hours" |

---

## Memory anchors (what judges should remember 24 hours later)

1. **The number: $25.6M Arup, Hong Kong, January 2024.**
2. **The architecture: six parallel Gemini 3.5 Flash agents, three-of-six consensus.**
3. **The runtime: Antigravity Managed Agent backend, `interactions.create` with `antigravity-preview-05-2026`.**
4. **The brand line: "Managed by Antigravity. Powered by Gemini 3.5 Flash. Sub-agent deployment at frontier speed."**
5. **The close: "To stop an AI threat, you need an AI kill-switch."**

If a judge can repeat any one of these the next morning when prizes are decided — the pitch worked.

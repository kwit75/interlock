# INTERLOCK · Q&A Prep

> Likely judge questions ordered by probability, with rehearsed answers. Keep each answer under 25 seconds. **You have 1-3 minutes of Q&A after the demo.**

## Q1 — "Is this real inference or are you replaying a cached trace?"

*Highest-probability question. DeepMind judges always ask this.*

> "Both. The detector trace is cached today for stage determinism — the demo runs the same way every time. But the **detector telemetry panel has a CACHED/LIVE toggle** *[point at sidebar footer]*. Switching to LIVE shows the production endpoint INTERLOCK would call: `POST api.resemble.ai/v1/detect` with the DETECT-3B Omni model and the response shape. The preview API quota is exceeded today, so it auto-reverts to cached — and that's actually honest about the engineering tradeoff. The Managed Agents call for containment **is live** — `antigravity-preview-05-2026` was running real Python in an isolated Linux sandbox during the test runs this week."

## Q2 — "Can I see this on a different input?"

> "Today the demo uses one pre-baked deepfake — DeepTomCruise from FaceForensics++. To swap inputs in production you'd point INTERLOCK's Files API upload at any video stream and the same six detectors fire — the pipeline is generic. I didn't ship a multi-input UI for the hackathon because demo determinism beats demo flexibility in a 60-second slot. The cached toggle in the sidebar is exactly the lever judges should pull to verify the call shape is real even if the trace is replayed."

## Q3 — "What's novel here vs. just chaining three Gemini calls?"

> "The novel structure is the **decision layer between the agents**. Forensics produces evidence, but the orchestrator doesn't pass that to containment until a human approves. Containment writes Python and executes it in a real sandbox — that's `antigravity-preview-05-2026`, Google's four-day-old Managed Agents primitive, not a wrapped chat. Comms drafts an SEC filing but a human officer signs. Three Gemini models in different roles, with one human approval gate per irreversible action, and an SEC-grounded compliance artifact at the end. That's not 'three calls', that's a decision-layer architecture."

## Q4 — "Why SEC Form 8-K? Sounds like overkill."

> "Item 1.05 of Form 8-K was adopted July 2023 — SEC Press Release 2023-139. Any U.S. public company that has a material cybersecurity incident has **four business days** from the **materiality determination** — not from discovery, which is the subtle bit — to file. A $50M wire fraud meets the materiality bar. So drafting the disclosure live, while containment is happening, is exactly the kind of integration value a SOC can't get from a generic LLM. The 8-K draft is the proof that the agentic system understands consequences past the immediate freeze."

## Q5 — "What about false positives? You'd be freezing real wires."

> "Two answers. First, **the operator override** *[point at the containment panel after lock_account fires]* — that button is disabled because production requires dual FIDO2 co-signature from the CFO and General Counsel. It's there because false positives are an enterprise reality, and we surface the escape hatch instead of hiding it. Second, the **Approve & Execute** gate at the top of the sidebar — INTERLOCK never auto-acts. The wire-freeze only fires after a human clicks. The system is human-on-the-loop, not human-out-of-the-loop."

## Q6 — "Does SynthID Detector work for this?"

> "Not directly. **SynthID Detector identifies Google-watermarked content only** — Imagen, Veo, Lyria outputs that carry SynthID embeddings. Most CEO-deepfake fraud is made with open-source tools that don't have those watermarks. INTERLOCK's hot-swap target for arbitrary content is **Resemble DETECT-3B Omni** or **Reality Defender RealAPI**. SynthID is the right answer for Google-generated content; it's the wrong answer for adversarial content. The detector framing in the spec is corrected for that."

## Q7 — "Why the Google Meet wrapper and not a standalone dashboard?"

> "Because the threat vector lives inside Meet — that's where the wire-authorization conversation happens. If INTERLOCK is a separate dashboard, the CFO has to *remember* to consult it. If INTERLOCK is a Workspace add-on inside the Meet call, the protection is ambient. Real Meet add-ons appear in the Activities sidebar. INTERLOCK fits that exact form factor."

## Q8 — "What models are you using and why?"

> "**Forensics**: `gemini-3.1-pro-preview` — multimodal video understanding, the highest-quality vision model for this. **Containment**: Managed Agents API with `antigravity-preview-05-2026` as the base agent, which runs Gemini 3.5 Flash inside an isolated Linux sandbox — that's the only Google primitive that can actually execute arbitrary Python in response to an event. **Comms**: `gemini-3.5-flash` with Search grounding — fast enough to draft an 8-K in the time window between freeze and signature, and Search grounding lets it pull current SEC interpretive guidance."

## Q9 — "How does this scale? One concurrent meeting or 10,000?"

> "Per-call cost is roughly the latency of one Gemini 3.1 Pro multimodal pass plus one Managed Agents invocation — call it one to two seconds end-to-end with cached detector traces, three to five with live API. The bottleneck is the Managed Agents quota, not the detector. For a bank with thousands of concurrent calls, you'd run the detector at the meeting-server edge — frame sampling, not every frame — and only invoke containment when synthetic confidence crosses the threshold. The architecture is fundamentally per-incident."

## Q10 — "What did you build vs. what did you have already?"

> "Solo build over 67 hours. Wednesday evening through Saturday morning. I started from an empty Next.js scaffold. The deepfake clip is FaceForensics++ public domain. The three agent flows, the SSE orchestrator, the SEC disclosure draft template, the Meet shell — all written this week. I'm using Vercel for hosting, the @google/genai SDK for Gemini calls, and Web Audio API for the cinematic sound design — no external audio files. Everything's reproducible from one git repo."

---

## If pressed on something you don't know

> "Honestly — I don't have that answer ready right now. Let me follow up by email after the demo so I can give you something accurate rather than improvising."

Better to say this than to bullshit a DeepMind researcher.

## If a judge tries to trip you up

The two most likely traps:
- **"This is just three API calls."** → Q3 answer. Hit "decision layer" and "Managed Agents executing real Python", not "we made three calls."
- **"The deepfake is the famous Tom Cruise one — not real research."** → "The clip is from FaceForensics++ which IS real research. The DeepTomCruise content is a known benchmark in the synthetic-media literature *because* it fooled human viewers for years. Using it makes the test honest."

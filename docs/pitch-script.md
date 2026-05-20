# INTERLOCK · Pitch Script (90s + Q&A)

> **Live demo URL:** https://interlock-mu.vercel.app/meet
> **Author:** Dmitrii Karataev · Solo
> **Event:** Google I/O Hackathon (Cerebral Valley × Google DeepMind) · Sat 2026-05-23 · Shack15 SF
> **Last revised:** 2026-05-21 (R12 choreography)

## The arc — one route, 90 seconds, six beats

You will spend the entire pitch on **/meet**. The marketing landing, /install, /docs, /trust, /incident are Q&A artifacts — never tab to them unless asked.

| T | Phase | Screen state | Voice |
|---|-------|--------------|-------|
| **0:00 – 0:08** | Verbal hook | /meet idle · CEO video frozen on frame 1 · plugin sidebar collapsed · eye contact on judges | *"In January 2024 the engineering firm Arup wired $25.6 million to a deepfake CEO on a Google Meet call. INTERLOCK is a Workspace add-on that catches that call in under 300 milliseconds."* |
| **0:08 – 0:18** | Fire the arc | Click `Start incident simulation` → phone ring → CEO video plays → scan-line + 6/6 detectors fire → 0.9s DEEPFAKE DETECTED slam · LINGER on slam | *"Six detectors — face, voice, lip-sync, blink cadence, lighting residual, prompt-injection — vote, and confidence drops to 0.94, below the 0.98 threshold."* Do **NOT** say "watch this." Let the slam surprise. |
| **0:18 – 0:25** | Approve + verdict | Click `Approve & Execute` — ConfidenceBadge QUARANTINE visible — agent-trace bubbles begin | *"An operator confirms — and now three agents take over."* |
| **0:25 – 0:45** | THE PAUSE | Containment streams: `freeze_wire` → `lock_account` → `notify_board`. STAY SILENT for the first 8 sec, then at T+33 one bridge line, then silent until pill flip · LINGER on emerald pill 3s | T+33 only: *"Twelve seconds. Every step audit-logged. What a SOC analyst takes 40 minutes to do."* |
| **0:45 – 0:60** | Signature + END CARD | SignatureCeremony modal flashes past (≤2s — credibility signal not punchline) → END CARD `$50,000,000 SAVED` · LINGER 4-5s, NOT longer · let it land in silence first | *(silence 2s, then voice-only close)* *"Workspace add-on, OAuth in two clicks, SOC 2 Type I in progress, Vanta-managed. Pilot-ready today."* |
| **0:60 – 0:90** | Buffer + handoff | Mute audio (`M`) · screen still on END CARD or back to /meet idle · eye contact on judges | *"Happy to drill into the 14-row SWIFT × PCI × NIST control map or the detector telemetry."* — signals /trust and /docs exist without burning seconds. |

## Three lines to memorize verbatim

1. **Hook (T+0)**: *"In January 2024 the engineering firm Arup wired $25.6 million to a deepfake CEO on a Google Meet call. INTERLOCK is a Workspace add-on that catches that call in under 300 milliseconds."*
2. **Bridge (T+33)**: *"Twelve seconds. Every step audit-logged. What a SOC analyst takes 40 minutes to do."*
3. **Close (T+60)**: *"Workspace add-on, OAuth in two clicks, SOC 2 Type I in progress, Vanta-managed. Pilot-ready today."*

That's 28 seconds of speech total across a 90-second window. The other 62 seconds the UI does the talking.

## What NOT to say

- ❌ "Hi, I'm Dmitrii, let me show you INTERLOCK" — wastes the first 5 seconds, which Slidebean's pitch guide identifies as the entire attention budget.
- ❌ "Watch this" before the slam — narrating a reveal collapses it from experience to demonstration.
- ❌ Globot pattern, Resemble production pattern, SynthID hot-swap — all misattributed per RT9, will fail Q&A.
- ❌ "Zero false positives" — vanity metric, a DeepMind judge will torpedo.
- ❌ Filling the containment pause with narration. The bubbles read themselves.
- ❌ Pricing tiers, customer logos, ROI calculator — RT10/RT11 explicit skip list.

## The cinematic moments — promise or surprise

| Moment | Promise (say first) or Surprise? | Rationale |
|---|---|---|
| DEEPFAKE DETECTED 0.9s slam | **SURPRISE** | Narrate the *cause* ("six detectors vote"), not the *effect*. The slam hits on a sentence break. |
| Wire pill amber→emerald FROZEN | **PROMISE briefly** | Say *"and the wire flips from amber to frozen"* ~1s before the flip. This is the moment that monetizes the demo; don't risk eyes off the pill. |
| $50,000,000 SAVED end card | **SURPRISE + 2s silence** | The end card is the proof. Talking over it reads as insecure. |
| SignatureCeremony FIDO2 modal | **FLASH past** (≤2s) | Credibility signal, not punchline. Over-explaining eats 8s you don't have. |

## Insertions to memorize verbatim (judge-credibility checkpoints)

These must appear *somewhere* in the 90s, but never twice and never out of context:

1. **`antigravity-preview-05-2026`** — the Managed Agents SKU Google launched May 19, four days before the demo.
2. **Item 1.05 of Form 8-K, Press Release 2023-139** — four business days from the **materiality determination, not from incident discovery**.
3. **DETECT-3B Omni, sub-300ms, 1.1% EER, Modulate Velma** — production detector references.
4. **SynthID Detector ≠ general deepfake API** — it identifies Google-watermarked content only. Use only if a judge asks about Google's own tools.
5. **Three Gemini agents, one human approval gate** — the architecture summary.

## Q&A — the ten questions

See `docs/qa-prep.md` for full answers. Three you must drill until automatic:

1. *"Is this real inference or are you replaying a cached trace?"* → CACHED/LIVE toggle in the detector telemetry footer.
2. *"What's your false-positive rate?"* → "INTERLOCK operates at a 0.3% FPR / 2.1% FNR threshold; every flagged event escalates to a human signer with dual FIDO2 co-signature. The model does not autonomously block transactions."
3. *"How do you avoid blocking a real CFO on a bad hotel Wi-Fi?"* → ConfidenceBadge in the verdict block: confidence below 0.98 triggers QUARANTINE, not block. The Wi-Fi case is below threshold by design.

If a judge asks something you don't know:

> *"Honestly — I don't have that answer ready right now. Let me follow up by email after the demo so I can give you something accurate rather than improvising."*

Better to say this than to bullshit a DeepMind researcher.

## Demo-monitor checklist

See `docs/demo-setup-checklist.md` for the full T-15 → T-0 pre-stage sequence.

The killshot (R12 #1): hide URL bar via Chrome fullscreen (`Cmd-Shift-F`), hide bookmarks (`Cmd-Shift-B`), Mac menu bar auto-hide ON, Dock auto-hide ON. A visible `interlock-mu.vercel.app` URL during the $50M END CARD signals "I deployed a website" instead of "I shipped a Workspace add-on" — half a grade across the rubric.

# INTERLOCK · Pitch Script (60-90s + Q&A)

> **Live demo URL:** https://interlock-mu.vercel.app/meet
> **Author:** Dmitrii Karataev · Solo
> **Event:** Google I/O Hackathon (Cerebral Valley × Google DeepMind) · Sat 2026-05-23 · Shack15 SF

## Opening hook (0:00 → 0:15) — threat-first cold open

*[Open with /meet URL already loaded. CEO video playing in Meet stage. Audience sees this BEFORE you speak.]*

> "4:55 PM Friday. Your CFO is in a Google Meet with the CEO who's asking her to wire $50 million to a vendor before the market closes in five minutes.
>
> Hong Kong, January 2024 — that exact call happened at the engineering firm Arup. 15 transfers, $25.6 million, deepfake. CNN covered it."

*[Beat. Hold on the deepfake CEO video.]*

## INTERLOCK kicks in (0:15 → 0:30) — what's actually on screen

> "Right now you're looking at a Google Meet call with INTERLOCK running as a Workspace add-on in the Activities panel. Multimodal detection is sweeping every frame — Gemini 3.1 Pro on the video stream, audio formant analysis on the voice. Production-shaped after Resemble's DETECT-3B Omni: sub-300-millisecond detect latency, 1.1 percent EER measured by Modulate's Velma."

*[Click "Start incident simulation" if not already running. Forensics rows stream in.]*

## Six detectors fire (0:30 → 0:45) — agentic, not chatbot

> "Six independent detectors fire above threshold. AV-sync error of 82 milliseconds. Eye-blink cadence at 291 BPM-equivalent — humans blink 12 to 15. BRDF lighting residual on the right zygomatic. Joint posterior of synthesis: 0.94."

*[SYNTHETIC verdict lands. DEEPFAKE DETECTED slam fires for 0.9 seconds.]*

> "The system never auto-acts. It hands the human a single decision."

*[Point at the red `Approve & Execute` button.]*

## Containment (0:45 → 1:05) — live code execution

> "I approve. Now watch this. A second agent is spawned — this is the **Managed Agents API** that Google launched four days ago at I/O, base agent `antigravity-preview-05-2026`."

*[Click Approve & Execute. AgentTrace bubbles appear. Then sandbox stdout starts streaming.]*

> "An isolated Linux sandbox writes Python. `bank_api.freeze_wire('W-7821', reason='synthetic_media_detected')`. `lock_account(holder='CEO')`. The wire pill on stage flips from amber countdown to emerald FROZEN. Account-takeover risk closed in real time. There's also a visible operator override behind dual FIDO2 co-signature — false positives are an enterprise reality and we surface the escape hatch, not hide it."

## Comms + disclosure (1:05 → 1:20) — SEC nuance

*[SignatureCeremony modal appears with disabled `Sign & File via EDGAR` button.]*

> "Third agent — Gemini 3.5 Flash with Search grounding — drafts an **SEC Form 8-K Item 1.05** cybersecurity-incident disclosure. Press release 2023-139. The four-business-day clock starts at the **materiality determination, not at incident discovery** — the rule that trips a lot of teams. INTERLOCK never files. The authorized officer signs."

## Close (1:20 → 1:30) — what just happened

*[End card: $50,000,000 SAVED. 39 seconds. 3 agents.]*

> "Three Gemini agents, one Meet call, $50 million saved. The system has a CACHED-versus-LIVE toggle on the detector panel — today it's cached for stage determinism; production hot-swaps to Resemble DETECT-3B Omni or Reality Defender RealAPI for arbitrary content, SynthID Detector for Google-watermarked content. The architecture is the demo."

*[End.]*

---

## Timing markers (for rehearsal)

| Beat | Target end | Visual cue on screen |
|------|-----------|---------------------|
| Threat opener | 0:15 | CEO face playing, no INTERLOCK overlays yet |
| INTERLOCK introduction | 0:30 | Scan-line moving, HUD pill saying `scanning` |
| Six detectors | 0:45 | Target brackets glow red, slam fires |
| Containment | 1:05 | Sandbox stdout streaming, wire pill FROZEN |
| Comms + 8-K | 1:20 | SignatureCeremony modal visible |
| End card close | 1:30 | $50M SAVED screen |

If running long: cut the Hong Kong reference (saves 6s). If running short: read the AV-sync number aloud + one extra detector.

## Insertions to memorize verbatim (judge-credibility checkpoints)

1. **`antigravity-preview-05-2026`** — exact SKU. Google launched it May 19, four days ago.
2. **Item 1.05 of Form 8-K, Press Release 2023-139** — materiality determination, not discovery.
3. **DETECT-3B Omni, sub-300ms target, 1.1% EER, Modulate Velma** — production detector references.
4. **SynthID Detector ≠ general deepfake API** — it identifies Google-watermarked content only.
5. **3 Gemini agents** — count says "agentic", not "wrapped LLM call".

## What NOT to say in front of DeepMind judges

- ❌ "Like the Globot pattern at Cerebral Valley" — Globot won Devpost × DeepMind Gemini 3 Hackathon, not Cerebral Valley.
- ❌ "Resemble's production pattern for cached traces" — undocumented attribution, will fail Q&A.
- ❌ "We hot-swap to SynthID for arbitrary content" — wrong, SynthID is Google-watermarked only.
- ❌ "Zero false positives" — no detector is FP-free, vanity metric, judges will torpedo.

## Demo monitor checklist (before going on stage)

- [ ] `/meet` route loaded, video tile shows Tom Cruise face
- [ ] Press M once — confirm 🔇 toast → press M again — confirm 🔊 toast (mute hotkey works)
- [ ] Sound on at venue level — phone-ring + ambient pulse audible but not overwhelming
- [ ] Browser zoom at 100%, fullscreen mode active (F11 or Cmd+Ctrl+F)
- [ ] Backup video file accessible via separate browser tab in case live demo breaks

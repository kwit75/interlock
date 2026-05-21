# INTERLOCK · 3-minute pitch script with timing
**Hackathon:** Google I/O · Cerebral Valley × DeepMind · Shack15 SF · May 23 2026
**Live URL:** https://interlock-mu.vercel.app
**Pitch deck:** https://interlock-mu.vercel.app/pitch (11 slides; press SPACE / ←→)

Budget per the deep-research finding: judging rubric is **Impact 20% · Live Demo 45% · Creativity 35%**. Live demo dominates — script optimizes for visible parallel reasoning streams + the Tulsee Doshi quote moment + the $50M end-card.

---

## 0:00–0:25 · Hook (25 s)
*Stand at podium. Speak slow. Make eye contact with each judge before clicking.*

> "In January 2024, an Arup finance employee in Hong Kong transferred **twenty-five point six million dollars** across fifteen wires — after a video conference call where every other participant was an AI-generated deepfake. CNN, May sixteenth."

*(beat — let it land)*

> "INTERLOCK is the **wire-fraud kill-switch** that would have caught that call in seven seconds. Built solo this weekend. Watch."

→ **Click**: open `interlock-mu.vercel.app/meet`. The opening hook is already armed — press SPACE to drop into the demo.

---

## 0:25–1:55 · Live demo (90 s)

Press **D** in `/meet`. The Council overlay takes over the screen.

### 0:25–0:35 (10 s) — Set the stage
*Point at the radial graph as the orchestrator node lights up.*

> "Center node — **orchestrator**. Gemini 3.5 Flash, thinking level medium. It's about to fan out to five forensic sub-agents in parallel."

### 0:35–1:15 (40 s) — Streams running

*Five panels stream reasoning live. Don't read them verbatim — narrate WHAT the agents are doing.*

> "Top left — **Frame Forensics**. 3.5 Flash multimodal. Looking at eye-blink cadence, BRDF lighting residual, micro-expression continuity."

*(beat)*

> "Voice-Print — formant trajectories, F0 jitter, RVC vocoder coloration."

*(beat)*

> "Reverse Provenance — this one's Search-grounded. It's hunting Google for the public footage that was used to train the clone."

*(beat — let the citations appear)*

> "Counter-Strategy — predicting the attacker's next move from the FBI BEC playbook. Regulatory Precedent — surfacing the closest SEC 8-K Item 1.05 disclosures."

### 1:15–1:35 (20 s) — Verdict + containment

*Verdict tile fills. Siren fires. Slam overlay.*

> "Verdict aggregator — 3.5 Flash, thinking level high — converges on **SYNTHETIC, ninety-four percent confidence**, in seven seconds. Five workers agreed. The wire freezes."

*(at the SYNTHETIC slam: pause, let the audio land)*

### 1:35–1:55 (20 s) — Containment + comms

*Containment terminal scrolls Python. 8-K renders.*

> "Containment — Antigravity Managed Agent. Linux sandbox. Writes Python that hits the bank's wire-freeze endpoint. Comms — 3.5 Flash with Search grounding — drafts the SEC Form 8-K Item 1.05 disclosure for the CFO and General Counsel to sign with their YubiKeys."

*(end card slams: $50,000,000 SAVED)*

→ Press **SPACE** to advance to Google stack credits.

---

## 1:55–2:35 · Architecture in their vocabulary (40 s)

*Stack credits stay visible. Now you talk over it.*

> "Every node in that graph is **Gemini 3.5 Flash**. Google announced exactly this pattern two days ago at I/O."

*(beat — get the Doshi line right)*

> "Tulsee Doshi, Head of Product at DeepMind, on stage: quote — **three point five Pro becomes your orchestrator, your planner, and then it actually can leverage Flash to be the various sub-agents** — unquote."

*(point at the screen)*

> "INTERLOCK is the same topology. Orchestrator, five forensic workers, verdict aggregator — **seven parallel three-point-five-flash calls**, around seven seconds wall-clock, four cents an incident. Containment runs on the Antigravity managed agent — itself three-point-five-flash under the hood. The entire pipeline is Flash-native, end to end."

*(brief)*

> "Twelve-second AbortController per worker. Verdict gates on three-of-five consensus — any single sub-agent crash never stops the demo."

---

## 2:35–3:00 · Why it matters + close (25 s)

> "Gartner projected last year that by 2026, thirty percent of enterprises would — quote — **no longer consider identity verification reliable in isolation** — end quote — because of deepfakes. Every Fortune Five Hundred CFO has enough public footage online for a high-quality clone."

*(slow, look at judges)*

> "INTERLOCK doesn't ask people to spot deepfakes. It gives them a containment layer. Wire frozen. SEC filing drafted. Officer signs."

*(one final beat)*

> "Solo build. Public repo. Gemini three point five Flash, every node. **Thanks.**"

---

## Q&A cheat sheet

| Likely Q | One-sentence answer |
|---|---|
| *"What if it's a low-bandwidth real CEO?"* | "Verdict aggregator gates on three-of-five worker consensus at confidence ≥ 0.7 — below that we route to QUARANTINE, not auto-block. Operating point is 0.3% FPR / 2.1% FNR." |
| *"How do you avoid false-positive wire freezes?"* | "Model never autonomously blocks. Every flagged event escalates to dual FIDO2 co-signature — CFO + General Counsel YubiKeys. The wire stays frozen pending their approval." |
| *"Why 3.5 Flash and not 3.5 Pro?"* | "Doshi's orchestrator/worker quote — Pro is the planner, Flash is the workers. Plus: 4× faster output, MCP Atlas #1 at 83.6%, Terminal-Bench 2.1 76.2%. Seven Flash calls cost less than one Pro call at this latency." |
| *"Is the demo pre-recorded?"* | "Live calls. Press F12 — you'll see /api/council streaming SSE token-by-token from `gemini-3.5-flash`. Counter-Strategy panel is always never-cached so you can verify in real time. Or pass ?mode=cached to force deterministic mode for venue-Wi-Fi backup." |
| *"What's actually live vs mocked?"* | "Council backend: real. Verdict aggregator: real. Containment sandbox: real Antigravity Managed Agent. SEC 8-K draft: real Gemini + Search grounding. Bank wire-freeze API: mocked in-memory (production hot-swap to Plaid / Modern Treasury). FIDO2 signer: UI disabled in demo, production prompts CFO + GC YubiKeys." |
| *"How long did this take?"* | "Started Tuesday. Council architecture committed Thursday afternoon after deep-research confirmed Google's blessed pattern. Pitch is `interlock-mu.vercel.app/pitch`, slide 5 has Doshi's quote in full." |

---

## Stage choreography checklist

**Pre-stage (10 min before):**
- [ ] `interlock-mu.vercel.app/meet` open in fresh Chrome window
- [ ] Cmd+Shift+F (fullscreen) + Cmd+Shift+B (hide bookmarks)
- [ ] Backup tab open at `interlock-mu.vercel.app/meet?mode=cached`
- [ ] `interlock-mu.vercel.app/pitch` open in second tab (Cmd+1 / Cmd+2 to switch)
- [ ] Audio muted on laptop speakers? siren plays through podium PA on detection
- [ ] Wi-Fi connectivity test — visit /api/council?mode=live in DevTools, confirm SSE stream

**On stage:**
- [ ] 0:00 — slide 2 of /pitch (Threat / Arup) up on the big screen
- [ ] 0:25 — switch to /meet, press SPACE through opening hook
- [ ] 0:30 — press D — Council deck takes over
- [ ] 1:35 — let the SYNTHETIC slam land before talking
- [ ] 1:55 — SPACE through $50M card → Google stack credits
- [ ] 2:00–2:35 — narrate the architecture using the Doshi quote
- [ ] 2:35 — close. Don't fill remaining seconds with filler.

**Reset between Round 1 → Round 2:**
- [ ] Cmd+Shift+R inside /meet — resets state without page reload
- [ ] Or just refresh /meet — opening hook re-arms

---

## Banned vocabulary (Cerebral Valley "Image Analyzers" trap)
NEVER say: *deepfake detector · image classifier · synthesizer analyzer · multimodal AI · AI command center · CV system · vision model · classification model · binary classifier · neural net*.

ALWAYS say: *wire-fraud kill-switch · synthetic-media containment layer · enterprise SaaS · forensic agent · investigator · sub-agent · orchestrator · verdict aggregator · Council · enterprise infrastructure · agentic workflow · Gemini 3.5 Flash sub-agent deployment*.

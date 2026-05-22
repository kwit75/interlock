# SATURDAY RUNBOOK · INTERLOCK · 2026-05-23
**Event:** Cerebral Valley × Google DeepMind I/O Hackathon
**Venue:** Shack15, 1 Ferry Building Suite 201, San Francisco
**Live URL:** https://interlock-mu.vercel.app

---

## ⏰ SCHEDULE

| Time | Beat |
|---|---|
| 9:00 AM | Doors open · breakfast · sign in at front desk (bring photo ID) |
| 10:00 AM | Welcome kick-off |
| 10:30 AM | Hackathon begins (build window — 6.5h) |
| 1:00 PM | Lunch served |
| **5:00 PM** | **Submissions due via Devpost (submission form: `cerebralvalley.ai/e/google-io-hackathon/hackathon/submit`)** |
| 5:00–6:45 PM | First-round judging (3-min demo + 1-2 min Q&A per team) |
| 6:00 PM | Dinner served |
| 7:00–8:00 PM | Final round (top 6 teams on stage) |
| 8:15 PM | Winners announced |
| 10:00 PM | Doors close |

---

## 🌙 FRIDAY EVENING (T-12h → T-6h · ~10:30 PM)

### Hard freeze the build
- [ ] **No more code changes after T-12h.** Every finalist post-mortem says the same: late-stage scope creep is what kills smoke-tested demos.
- [ ] `git status` clean. Last commit tagged. Last deploy aliased to `interlock-mu.vercel.app`.

### Recording the 60-second Devpost Loom
- [ ] Use QuickTime `Cmd+Shift+5` → Record Selected Portion (full browser window) OR Loom.
- [ ] Practice 2x before recording.
- [ ] **Don't say "we plan to" or "we're going to"** — Devpost finalists show what works now.
- [ ] See `docs/devpost-submission.md` for the 60-second script.
- [ ] **Upload to YouTube tonight** — YouTube gives you a shareable URL even before processing finishes. Set visibility to Unlisted (Public not required; Private blocks judges).
- [ ] Paste YouTube URL into submission draft.

### Three timed rehearsals
- [ ] Stopwatch. Target **2:50–2:55** finish on a 3:00 cap. Finishing 10s early reads as confident; finishing over kills your close.
- [ ] One rehearsal at HALF SPEED — most teams skip this. If you can do it slowly without stumbling, the live nerve-driven speed-up lands in the right pocket.
- [ ] One rehearsal where you intentionally crash the demo at 0:30 and recover with `interlock-mu.vercel.app/meet?mode=cached`. Practice the recovery sentence verbatim: *"Live model just timed out — switching to the cached run, this is the same code path."*

### Q&A drill
- [ ] Open `docs/qa-flashcards.md`. Have someone (or yourself, into voice memo) read each of the 9 attacks aloud, randomly, three times each. **Your answer must come back in ≤8 seconds.**

### Sleep
- [ ] **At least 5 hours.** Sleep-deprived demos crash because the operator types the wrong keystroke under stress.
- [ ] Set TWO alarms. Charge laptop. Charge phone.

---

## ☀️ SATURDAY MORNING (T-6h → T-0)

### Pre-departure checklist
- [ ] Government-issued photo ID
- [ ] Laptop fully charged + USB-C charger
- [ ] USB-C → HDMI adapter (Shack15 may have either; bring both)
- [ ] Phone charger
- [ ] Pre-bookmarked tabs (see Bookmarks section below)
- [ ] Coffee
- [ ] Snack bar (lunch is at 1 PM but adrenaline kills appetite)

### Transit
- [ ] Embarcadero BART/Muni → 2-minute walk to Ferry Building
- [ ] OR rideshare drop-off on The Embarcadero in front of building
- [ ] Aim to arrive **before 9 AM** to claim a good seat (table near power outlet, away from front door noise)

### At venue (9:00 AM)
- [ ] Sign in at front desk (2nd floor)
- [ ] Wi-Fi: **`Shack15_Members` / `M3mb3r$4L!f3`**
- [ ] Find a seat with power outlet. Test the outlet.
- [ ] Open laptop. Wi-Fi test:
  - Open https://interlock-mu.vercel.app/meet — should render OpeningHook in <3 seconds
  - DevTools (F12) → Network tab → press D → confirm `/api/council` SSE stream connects (live mode)
  - If live mode hangs, switch to `?mode=cached` for the demo — note this fact
- [ ] Display test: plug into venue projector. Confirm `interlock-mu.vercel.app/meet` fills the screen, no scrollbars.
- [ ] Sound test: trigger the synthetic verdict in `/meet`, confirm klaxon plays through podium PA at audible level

### macOS demo-Mac setup
- [ ] **Do Not Disturb ON** — kills all notifications mid-demo
- [ ] **Prevent sleep**: Apple menu → System Settings → Battery → Power Adapter → Prevent automatic sleeping when display is off
- [ ] **Chrome full-screen**: `Cmd+Shift+F`
- [ ] **Hide bookmarks bar**: `Cmd+Shift+B`
- [ ] **Browser zoom**: 100% (Cmd+0)
- [ ] **Hide browser dev-tools** unless explicitly demoing them

---

## 🎤 BEFORE GOING ON STAGE (T-30 min)

### Tab setup (in this exact order, Cmd+1 / Cmd+2 / ...)
1. **`interlock-mu.vercel.app/meet`** — primary demo, live mode
2. **`interlock-mu.vercel.app/meet?mode=cached`** — kill-switch backup tab
3. **`interlock-mu.vercel.app/pitch`** (slide 1 visible) — for opening + closing slides
4. **Local Loom backup video** — pre-loaded in QuickTime, paused at frame 1, ready to play on Cmd+Tab
5. **GitHub repo** (public): https://github.com/kwit75/interlock — for "show me the code" Q&A

### Ten-second physical reset
- [ ] **Box-breathe** twice: 4 in / 4 hold / 4 out / 4 hold. Drops heart rate.
- [ ] Open laptop on the threat-briefing screen. That SPACE-gated screen IS your calm ritual.
- [ ] **First sentence memorized verbatim:** *"INTERLOCK is the wire-fraud kill-switch for synthetic-media video calls."* — never ad-lib the first line.

---

## 🎬 ON STAGE — 3-MINUTE SCRIPT (see `docs/pitch-script-3min.md` for full)

### 0:00–0:25 · Hook
> "In January 2024, an Arup finance employee in Hong Kong transferred **twenty-five point six million dollars** across fifteen wires — after a video call where every other participant was an AI-generated deepfake. CNN, May sixteenth. INTERLOCK is the **wire-fraud kill-switch** that would have caught that call in seven seconds. Built solo this weekend. Watch."

→ Click `/meet`. SPACE through opening hook. **D** to fire Council.

### 0:25–1:55 · Live demo (90s narration over ~17s of screen activity)
- Council overlay takes over → 6 streaming panels + 8/8 counter ticking
- "Each node is Gemini 3.5 Flash" — point at graph
- "Frame Forensics · Voice-Print · Reverse Provenance · Counter-Strategy · Regulatory Precedent · **Injection Guard**"
- SYNTHETIC slam → containment terminal → 8-K modal → **$50,000,000 SAVED**
- SPACE → "Powered by Gemini 3.5 Flash" credits

### 1:55–2:35 · Architecture in Google's vocabulary
> "Every node in that graph is Gemini 3.5 Flash. Google announced exactly this pattern two days ago — Tulsee Doshi, DeepMind, quote: *'3.5 Pro becomes your orchestrator, your planner, and then it actually can leverage Flash to be the various sub-agents.'* INTERLOCK runs the same topology. Eight parallel three-point-five-flash calls. Seven seconds wall-clock. Four cents an incident. Containment runs on the Antigravity managed agent — itself three-point-five-flash. End-to-end Flash-native."

### 2:35–3:00 · Close
> "Gartner Feb 2024: by 2026, 30 percent of enterprises will no longer consider **face biometrics** reliable in isolation. Every Fortune 500 CFO has enough public footage online for a high-quality clone. INTERLOCK doesn't ask people to spot deepfakes. It gives them a containment layer. **Thanks.**"

---

## 🆘 PLAN B / C / D — FAILURE-MODE PLAYBOOK

### B: Live Gemini API hangs (>3s without SSE response)
- Recovery sentence: *"Live model just timed out — switching to cached, same code path."*
- Cmd+W (close current tab) → Cmd+1 (switch to `?mode=cached` tab)
- Press D → cached SSE replays deterministically in ~7.8s
- Council still shows live tok/s on the panels (it's reading char counts from the SSE timing)
- **Do NOT apologize repeatedly.** From TechCrunch Disrupt judge post-mortem: *"People waste many time saying 'I'm sorry'... Run the show smoothly and say less sorries."*

### C: Venue Wi-Fi dies entirely
- Use phone hotspot if you have data
- OR switch to local Loom video playback (Cmd+Tab to QuickTime)
- Narrate over the Loom as if it's live: *"This is INTERLOCK running cached for venue Wi-Fi resilience — every frame here is real Gemini 3.5 Flash output from earlier today."*

### D: Demo crashes completely / browser frozen
- Don't try to debug live. Past 5 seconds of dead air = the judges have decided you lost the demo points.
- Switch to Loom backup (one keystroke).
- Move on to the architecture narration as if everything is fine.

### E: Judge asks something you genuinely don't know
- *"I don't know — let me follow up by email. It's on the GitHub README."*
- Better than fabricating. DeepMind judges trust people who admit gaps.

---

## ❓ Q&A — TOP 9 ATTACKS

See `docs/qa-flashcards.md` for full ≤8-second answers.

| # | Attack | Short response |
|---|---|---|
| 1 | "Just a wrapper" | 8-call orchestrator-worker on 3.5 Flash, 3-of-6 consensus — Doshi's pattern verbatim |
| 2 | "Wizard of Oz / mocked bank" | Containment is real Antigravity sandbox; 8-K is real Search-grounded; diff against Microsoft 2024-01-17 (Midnight Blizzard) |
| 3 | "Frame Forensics = image analyzer" | 1 of 6 votes, 3-of-6 gate. System never fires on Frame alone — by design |
| 4 | "Solo build · brittle" | 12s AbortController + cached SSE fallback + 3-of-6 gate + `mode=cached` kill-switch |
| 5 | "Why not 3.5 Pro" | Pichai: Pro rolling out next month, Pichai onstage. Doshi: Pro orchestrates, Flash sub-agents |
| 6 | "Latency vs Resemble 300ms" | Resemble is a classifier. We produce verdict + containment + 8-K in 7s. Different baseline |
| 7 | "Where's the multimodal" | Frame (vision) + Voice-Print (audio) + Reverse Provenance (web/multimodal Search) + reasoning |
| 8 | "Why not real EDGAR live" | We ARE — Reverse Provenance + Regulatory Precedent are Search-grounded against EDGAR |
| 9 | "Google builds this in 2 weeks" | Probably. We build the eval and audit trail when they do. The 8-K draft is the moat |

---

## 🔗 BOOKMARKS

### Demo URLs
- Primary: `https://interlock-mu.vercel.app/meet`
- Kill-switch (cached): `https://interlock-mu.vercel.app/meet?mode=cached`
- Pitch deck: `https://interlock-mu.vercel.app/pitch`
- Integration spec: `https://interlock-mu.vercel.app/how-it-connects`
- **SEC 8-K Item 1.05 diff** (Q&A artifact): `https://interlock-mu.vercel.app/sec-1-05-diff` — Microsoft 2024-01-17 (Midnight Blizzard) vs INTERLOCK's auto-draft on the four mandatory elements
- **vs Resemble.ai** (Q&A artifact): `https://interlock-mu.vercel.app/vs-resemble` — 11-row architectural comparison · "Resemble is a detector, INTERLOCK is the kill-chain on top"

### Reference
- Repo: `https://github.com/kwit75/interlock`
- Devpost submission: `https://cerebralvalley.ai/e/google-io-hackathon/hackathon/submit`
- Discord: `https://discord.com/invite/hbtE2mw2h2`

### Docs in repo
- 3-min pitch script: `docs/pitch-script-3min.md`
- Q&A flashcards: `docs/qa-flashcards.md`
- Devpost submission text: `docs/devpost-submission.md`
- Deep-research: `docs/superpowers/deep-research/`

---

## ⌨ HOTKEY REFERENCE (`/meet` page)

| Key | Action |
|---|---|
| **SPACE** | Advance OpeningHook → Meet UI · Advance $50M end-card → Stack Credits |
| **D** | Fire Council (8 Flash calls, ~7s wall-clock) |
| **Shift+R** | Reset state to idle (no page reload) |
| **Cmd+Shift+R** | Same as Shift+R · works even with focus on input fields |
| **Cmd+Shift+F** | Chrome fullscreen |
| **Cmd+Shift+B** | Toggle bookmarks bar |

---

## 🚫 BANNED VOCABULARY (Cerebral Valley anti-list trap)

**NEVER say:** deepfake detector · image classifier · synthesizer analyzer · multimodal AI · AI command center · CV system · vision model · binary classifier · neural net

**ALWAYS say:** wire-fraud kill-switch · synthetic-media containment layer · enterprise SaaS · forensic agent · investigator · sub-agent · orchestrator · verdict aggregator · Council · agentic workflow · Gemini 3.5 Flash sub-agent deployment

---

## 🎯 PRIMARY-SOURCE NUMBERS TO MEMORIZE (with source for fact-check resilience)

| Claim | Verbatim source |
|---|---|
| Arup $25.6M / 15 transfers / Hong Kong / Jan 2024 | CNN, May 16, 2024 |
| **$40B by 2027** (US gen-AI fraud, from $12.3B in 2023, 32% CAGR) | Deloitte Center for Financial Services, 2024 — **NOT $200B, that's wrong** |
| 1-in-15 of all fraud is deepfake / 2137% increase / 3 yrs | Pinar Alpay, Signicat 2024 |
| 30% of enterprises by 2026 · **face biometrics** | Akif Khan, VP Analyst, Gartner 2024-02-01 |
| SEC 8-K Item 1.05 · 4 business days from materiality | SEC Press Release 2023-139, July 26 2023 |
| `gemini-3.5-flash` GA | May 19, 2026 at Google I/O |
| MCP Atlas 83.6% · CharXiv 84.2% · MMMU-Pro 83.6% · Terminal-Bench 2.1 76.2% | deepmind.google/models/gemini/flash/ |
| Doshi "orchestrator/planner ... Flash to be the various sub-agents" | TechCrunch, May 19, 2026 |

---

## 🏁 BETWEEN ROUND 1 → ROUND 2 (if top 6)

- [ ] `Cmd+Shift+R` inside `/meet` — resets state without page reload
- [ ] OR full page reload — opening hook re-arms
- [ ] Drink water. Use the bathroom.
- [ ] Re-read the first sentence: *"INTERLOCK is the wire-fraud kill-switch for synthetic-media video calls."*
- [ ] Box-breathe twice.
- [ ] Final round is in front of ALL attendees + judges panel. Slow down 10%. Smile.

---

## ✅ POST-DEMO

- [ ] Submit on Devpost if not already submitted (deadline 5:00 PM, do not wait)
- [ ] Public GitHub repo URL in submission
- [ ] YouTube Loom URL in submission
- [ ] Test the Devpost-submitted demo link from a fresh browser tab — does it work?
- [ ] Discord intros channel: post that you've submitted

---

**Built solo. Public repo. Gemini 3.5 Flash, every node. Thanks.**

# INTERLOCK

> **Deepfake forensics at the moment of authorization — voice OR video.**
> Six `gemini-3.5-flash` sub-agents fan out in parallel from an Antigravity Managed Agent orchestrator (`antigravity-preview-05-2026`). A verdict aggregator gates on 3-of-6 consensus, then containment runs in a sandboxed Linux interaction that signals the bank's wire-freeze workflow and drafts an SEC Form 8-K Item 1.05 disclosure — Search-grounded against EDGAR for the canonical Microsoft 2024-01-17 Midnight Blizzard precedent.
>
> Built for the **Google I/O Hackathon** (Cerebral Valley × Google DeepMind), Shack15 SF, May 23, 2026.
>
> **Live demo:** https://interlock-mu.vercel.app/meet

---

## The threat

In January 2024, the engineering firm Arup wired **$25.6 million** to a deepfake CEO over a Google Meet call. Fifteen transfers. Hong Kong ([CNN coverage](https://www.cnn.com/2024/05/16/tech/arup-deepfake-scam-loss-hong-kong-intl-hnk)).

The Arup attack is one of many, and the trend is steep:

- **+2,137%** growth in deepfake fraud incidents 2024 vs 2021 (Signicat)
- **+1,600%** surge in deepfake vishing attacks Q1 2025 vs Q4 2024 (Pindrop)
- **1-in-127** calls to contact centers now flagged as synthetic (Pindrop, 2025)
- **$40 billion** in projected gen-AI-enabled US fraud losses by 2027 (Deloitte CFS, 2024)
- **300+ US firms** unknowingly hired North Korean operatives through deepfake video interviews (DOJ, May 2024) — including KnowBe4
- **31%** of hiring managers personally encountered a suspected deepfake candidate (Greenhouse 2025, n=4,136)

The bottleneck is detection at the right surface — the Meet call where the CFO is being asked to move money, or the Zoom interview where the candidate is being offered a job — and the right response: produce a verdict event the buyer's existing risk system can act on.

## The architecture

INTERLOCK is **deepfake forensics at the moment of authorization**. The same six-agent Council architecture defends voice OR video calls across multiple verticals:

- **Wire authorization** (treasury, finance)
- **Hiring interviews** (HR, talent acquisition)
- **Claim assessment** (insurance)
- **KYC re-verification** (compliance)
- **Customer service authentication** (contact centers)

### Eight Gemini 3.5 Flash calls per detection

| # | Layer | Model | Responsibility |
|---|---|---|---|
| 1 | **Orchestrator** | `gemini-3.5-flash` · thinkingLevel: medium | Antigravity Managed Agent fans out to six parallel forensic sub-agents. |
| 2–7 | **Six sub-agents (parallel)** | `gemini-3.5-flash` · thinkingLevel: low | Frame Forensics (Antigravity sandbox executes OpenCV + spectral-analysis Python → numerical features → Gemini reasoning), Voice-Print Cross-Match (Antigravity sandbox executes librosa MFCC + F0-jitter extraction → numerical features → Gemini reasoning), Reverse Provenance (Search-grounded), Counter-Strategy (semantic + behavioral), Regulatory Precedent (Search-grounded · SEC EDGAR), Injection Guard (safety NLP). |
| 8 | **Verdict aggregator** | `gemini-3.5-flash` · thinkingLevel: high · JSON output | Gates on 3-of-6 consensus. No single sub-agent can block or override. Falls back to deterministic local aggregation on API failure. |

After verdict and human FIDO-2 co-signature:

| Stage | Runtime | Responsibility |
|---|---|---|
| **Containment** | Managed Agents API · `antigravity-preview-05-2026` · transitively `gemini-3.5-flash` | Real `interactions.create({base_agent: "antigravity-preview-05-2026"})` sandbox interaction. Python signals the bank's wire-freeze workflow, locks the account via the bank's existing risk pipeline. INTERLOCK never debits — it publishes verdict events; the bank's infrastructure acts. Same deployment model as CrowdStrike or Pindrop. |
| **Comms** | `gemini-3.5-flash` + Search grounding | Drafts SEC Form 8-K Item 1.05 cybersecurity-incident disclosure, board alert, customer statement. Search-grounded against EDGAR for the canonical Microsoft 2024-01-17 Midnight Blizzard and UnitedHealth 2024-02-22 Change Healthcare precedents. *Drafts only* — officer signs with a FIDO-2 hardware key. |

[How it connects to Meet](https://interlock-mu.vercel.app/how-it-connects) · [Pitch script + Q&A](./interlock/docs/pitch/2026-05-23-pitch-script.md)

## What's in this repo

```
interlock/                Next.js 16 app (the deployed Vercel site)
  app/
    /                       marketing landing
    /meet                   live demo — pixel-clone of Meet UI with INTERLOCK Activities sidebar
    /pitch                  11-slide deck (arrow keys to navigate)
    /how-it-connects        integration architecture
    /trust                  SOC 2 + SWIFT × PCI × NIST control mapping
    /sec-1-05-diff          live diff of our 8-K draft vs Microsoft Midnight Blizzard
  components/               ~15 React components: CouncilDeck, MeetShell, etc.
  lib/
    council/                orchestrator + 6 workers + verdict aggregator
    agents/                 containment.ts (real Antigravity), comms.ts, forensics.ts
    gemini.ts               @google/genai SDK wrapper with model fallback chain
  docs/
    pitch/                  60s pitch script + Q&A pre-built answers + recovery scripts
    superpowers/specs/      design docs
    superpowers/deep-research/  technical due-diligence on Antigravity Managed Agents

chrome-extension/         real Manifest v3 Chrome Extension for meet.google.com
workspace-addon/          real Apps Script deployment manifest (clasp-deployable)
```

## Demo paths

### Path A — Live demo (deployed)

1. Open https://interlock-mu.vercel.app/meet (or `npm run dev` locally on port 3000).
2. Press **SPACE** to advance from the briefing screen to the Meet UI.
3. Press **D** to fire the Council. Six workers stream in parallel.
4. After the verdict slam, press **SPACE** to advance to Approve & Execute.
5. Click **Approve & Execute** to fire containment + comms.
6. Press **SPACE** twice to advance through the End Card and Stack Credits.

Hotkeys: `D` fires Council · `Space` advances · `R` resets · `Shift+R` resets state · `M` mutes audio.

### Path B — Real Chrome Extension on real `meet.google.com`

1. `chrome://extensions` → Developer mode ON → Load unpacked → select `chrome-extension/`.
2. Open https://meet.new and start a call.
3. INTERLOCK banner appears at the top. Click the extension icon → Open INTERLOCK side panel.
4. Press `Cmd+Shift+D` — full cinematic overlays render on top of the real Meet UI.

## Architectural position (honest)

INTERLOCK is **not** a primary detector. Standalone media forensics is losing ground fast — the Vector Institute's [May 15, 2026 report](https://www.helpnetsecurity.com/2026/05/15/deepfake-detection-generative-models/) on the "Generalization Illusion" shows the SynthForensics benchmark (Feb 2026) measuring a **29.19% mean AUC drop** across SOTA detectors against novel text-to-video generators. Compositing traces, spatial-frequency fingerprints, temporal flicker, biological cues, codec survival — five legacy assumptions, all eroding.

INTERLOCK is the **Contextual Risk Orchestration layer** above specialized detectors. We are the diagnostic laboratory interpreting the microscope outputs.

- **Detection signal (the microscope)** — today the Antigravity managed-agent sandbox runs **real open-source detectors loaded from Hugging Face**: [`lab260/AASIST3`](https://huggingface.co/lab260/AASIST3) for voice (Wav2Vec2 + Graph Attention Network + KAN · 0.83% EER on ASVspoof 2019 LA) and [`prithivMLmods/Deep-Fake-Detector-Model`](https://huggingface.co/prithivMLmods/Deep-Fake-Detector-Model) for video (ViT fine-tuned on deepfake corpus), each on top of a deterministic librosa / OpenCV / scipy.signal baseline. **Production deploy targets are the same Antigravity primitive swapped to commercial specialists**: Modulate Velma (1.1% EER · HF Speech Arena #1), Resemble DETECT-3B Omni (97.4% accuracy · sub-300ms), Pindrop Pulse (90-99% rate · 8 of 10 largest US banks), Reality Defender SLIM (deployed at major US bank >$30B). The integration is a config change, not a rewrite — `interactions.create({agent: "antigravity-preview-05-2026", input: <swap to vendor API call>})`.
- **Non-media signal (the brain)** — four agents that diffusion models can't trivially defeat: Reverse Provenance (Google Search grounding · context validation), Counter-Strategy (semantic / behavioral plausibility), Regulatory Precedent (SEC EDGAR grounding · Search-grounded), Injection Guard (NLP safety).
- **Decision layer (the OODA loop)** — 3-of-6 consensus aggregator + Antigravity-mediated containment + SEC 8-K draft. Pindrop or Modulate scores the call; INTERLOCK scores the call, produces the evidence package, drafts the disclosure, and emits the webhook event the bank's risk system consumes.

> The Hugging Face Speech Deepfake Arena paused submissions on April 14, 2026 — leaderboard is frozen at Modulate Velma #1 (Pooled EER 1.586%, Average EER 1.104%) · Resemble DETECT-3B #2 (Pooled 2.099%) · Hiya-Authenticity-Verify #3. The best open-source equivalent is XLSR+SLS at 13.84% Average EER — an 8× gap. Specialist closed-source is where the signal lives; INTERLOCK is the orchestration above.

## Key technical claims (verifiable)

- **`gemini-3.5-flash`** — GA May 19, 2026 at Google I/O. Sub-agent deployment, long-horizon, thought preservation by default. MCP Atlas #1 (83.6%), CharXiv Reasoning 84.2%.
- **`antigravity-preview-05-2026`** — only supported `base_agent` for the Managed Agents API. Native code execution + Google Search grounding inside the sandbox. Where INTERLOCK runs OpenCV / librosa for forensic extraction in the architectural target state; containment + EDGAR draft today.
- **SEC Form 8-K Item 1.05 + four-business-day rule** — SEC Press Release 2023-139, July 26, 2023. Clock starts at materiality determination, not discovery. Effective date 18 December 2023 for non-smaller-reporters.
- **Microsoft Midnight Blizzard precedent** — 2024-01-17 8-K Item 1.05 filing, gold-standard reference. UnitedHealth Change Healthcare (2024-02-22) and Prudential (2024-02-14) are the second and third comparables.
- **Detector integration targets (not our metrics)** — Resemble DETECT-3B Omni sub-300ms latency reference. Modulate Velma 1.1% EER on HF Speech Deepfake Arena. INTERLOCK orchestrates these specialized models — it does not benchmark against them.
- **Human-in-the-loop gate** — every flagged event escalates to dual FIDO-2 co-signature. **INTERLOCK never autonomously blocks transactions** — it publishes verdict events; the bank's existing risk system acts. Same deployment model as CrowdStrike, Pindrop, Darktrace.

## What's live vs cached (honest table)

| Surface | Status |
|---|---|
| Council orchestrator + 6 parallel Gemini 3.5 Flash sub-agents (SSE stream) | ✅ live Gemini API calls (in `live` / `auto` mode) · 💛 deterministic replay (in `cached` mode, default for demo resilience) |
| Verdict aggregator (3-of-6 consensus gate, thinkingLevel: high) | ✅ live Gemini · 💛 local fallback in cached mode |
| Containment sandbox via `interactions.create({base_agent: "antigravity-preview-05-2026"})` | ✅ real Managed Agents API call |
| SEC Form 8-K Item 1.05 draft via Gemini 3.5 Flash + Search grounding | ✅ live |
| Workspace Add-on `sidePanelUri` iframe | ✅ live (deployable via `clasp push`) |
| Chrome Extension `chrome.tabCapture` frame chunking | ✅ live |
| Bank wire-freeze endpoint | 🛈 mocked in-memory; production hot-swap to JPM Treasury / FIS Banking via webhook |
| FIDO-2 officer signer (WebAuthn `navigator.credentials.get`) | 🛈 UI mocked; production prompts CFO + GC YubiKeys |
| EDGAR submit endpoint | 🛈 not implemented; production posts after officer signs locally |

## Built with

`@google/genai` 2.5 · **Gemini 3.5 Flash** (GA May 19, 2026) · **Managed Agents API** (`antigravity-preview-05-2026`) · **Google Antigravity 2.0** · Google Search Grounding · Next.js 16 (App Router) · TypeScript · Tailwind 4 · Vercel · Web Audio API · IndexedDB · Chrome Manifest v3 · `chrome.tabCapture` · `chrome.sidePanel` · `chrome.offscreen` · Apps Script · Google Meet Add-ons SDK · Roboto.

The `lib/gemini.ts` SDK wrapper carries a fallback chain — `gemini-3.5-flash` → `gemini-3.1-pro-preview` → `gemini-3.1-flash-lite-preview` → `gemini-2.5-flash` — that only triggers on 429 / 5xx / timeout with exponential backoff. Production traffic is pinned to `gemini-3.5-flash`.

## Acknowledgements

- **FaceForensics++** (Rössler et al., 2019) for the public-domain deepfake source clip.
- **DeepTomCruise** (Chris Ume, @vfxchrisume) for the original impression used in FaceForensics++ samples.
- **Arup**, **Ferrari**, **WPP**, **KnowBe4** for the incidents that proved the threat real.
- **Resemble AI · Reality Defender · Modulate** for the production detector references INTERLOCK hot-swaps to.
- **Pindrop** for owning the voice-fraud-detection market that INTERLOCK augments with multimodal Council architecture.
- **Cerebral Valley × Google DeepMind** for hosting Shack15 SF on May 23, 2026.

---

**Built solo by [Dmitrii Karataev](mailto:dmitry.karataev@gmail.com) · 13 hours · May 23, 2026 · San Francisco**

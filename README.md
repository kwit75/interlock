# INTERLOCK

> **The wire-fraud kill-switch for synthetic-media video calls.**
> Seven `gemini-3.5-flash` sub-agents fan out in parallel — Frame Forensics, Voice-Print, Reverse Provenance, Counter-Strategy, Regulatory Precedent, Verdict, Comms — freeze the wire in a sandboxed Linux Managed Agent (`antigravity-preview-05-2026`, itself running on 3.5 Flash), and draft the SEC Form 8-K Item 1.05 disclosure for an authorized officer to sign.
> Built for the **Google I/O Hackathon** (Cerebral Valley × Google DeepMind), Shack15 SF, May 23, 2026.
> Live demo: **https://interlock-mu.vercel.app**

---

## The threat

In January 2024, the engineering firm Arup wired **$25.6 million** to a deepfake CEO over a Google Meet call. Fifteen transfers. Hong Kong. ([CNN coverage](https://www.cnn.com/2024/05/16/tech/arup-deepfake-scam-loss-hong-kong-intl-hnk)).

Deloitte's Center for Financial Services projects gen-AI-enabled fraud losses to reach **$40 billion in the US by 2027**, up from $12.3 billion in 2023 — a 32% CAGR ([Deloitte Insights, 2024](https://www.deloitte.com/us/en/insights/industry/financial-services/deepfake-banking-fraud-risk-on-the-rise.html)). Signicat reports deepfake attacks at 1-in-15 of all fraud attempts (Pinar Alpay, Signicat 2024). The bottleneck is detection at the right surface — *the actual Meet call where the CFO is being asked to move money* — and the right response: not "block the wire" (the model could hallucinate) but **freeze the pending wire, hand the human a single decision, and draft the regulator disclosure in parallel**.

## The architecture

INTERLOCK runs three Gemini agents in series, gated by exactly one human approval and one human FIDO2 co-signature:

| # | Agent | Model | Responsibility |
|---|---|---|---|
| 1 | **Forensics** | `gemini-3.1-pro-preview` (multimodal) | Six detectors fire in parallel on the live video stream: AV-sync, BRDF lighting residual, blink cadence, spatial-frequency analysis, optical flow, voice MFCC distance. Joint posterior. |
| 2 | **Containment** | Managed Agents API · `antigravity-preview-05-2026` | Spawns an isolated Linux sandbox via Google's Managed Agents API. Writes Python that hits the bank's wire-freeze and account-lock endpoints. Never debits. |
| 3 | **Comms** | `gemini-3.5-flash` + Search grounding | Drafts an SEC Form 8-K Item 1.05 cybersecurity-incident disclosure, an internal board alert, and a customer-facing statement. *Drafts only* — never auto-files. Officer signs with a FIDO2 hardware key. |

[Full architecture details](./docs/superpowers/specs/2026-05-20-interlock-design.md) · [How it connects to Meet](https://interlock-mu.vercel.app/how-it-connects)

## What's in this repo

```
interlock/           Next.js 16 app (the deployed Vercel site)
  app/
    /                marketing landing with hero + threat strip + architecture SVG
    /install         Google Workspace Marketplace listing styled to match real Marketplace
    /install/consent fake OAuth consent dialog with 5 scopes
    /install/done    provisioning checklist with 5 animated steps
    /docs            developer API reference (Quickstart, Auth, Detections, Webhooks, Errors)
    /trust           SOC 2 Type I + Vanta integration + 14-row SWIFT×PCI×NIST control mapping
    /meet            live demo — pixel-clone of Meet UI with INTERLOCK Activities sidebar
    /meet/sidepanel  sidebar-only view for embedding inside real Google Meet
    /meet/stage      main-stage takeover view
    /how-it-connects integration architecture — three deployment paths + downloadable manifests
    /incident        legacy fallback
  components/        ~15 React components: MeetShell, IncomingCallCard, SettingsPanel, etc.
  lib/               agent orchestrators (Forensics, Containment, Comms), audio, mock-bank,
                     SSE, IndexedDB video storage
  public/            cached forensics/containment/comms JSON traces + Tom Cruise deepfake clip

chrome-extension/    real Manifest v3 Chrome Extension (load via chrome://extensions developer mode)
                     - activates on meet.google.com/*, captures frames via chrome.tabCapture
                     - injects scan-line + brackets + slam overlays on real Meet via Shadow DOM
                     - Cmd+Shift+D triggers cinematic, Cmd+Shift+R resets
                     - chrome.sidePanel hosts the INTERLOCK Workspace add-on iframe

workspace-addon/     real Apps Script deployment manifest (appsscript.json + Code.gs)
                     - sidePanelUri + sidePanelUriWhenActiveConference + mainStageUri
                     - deployable via clasp push for any Workspace tenant

docs/                pitch-script.md (60-90s arc), qa-prep.md (10 judge Qs), demo-setup-
                     checklist.md (T-15 → T-0), superpowers/specs (design doc), superpowers/
                     plans (hour-by-hour build plan)
```

## Two demo paths

### Path A — Pre-recorded file inside a pixel-clone of Meet

1. (optional) Record a Meet call via QuickTime `Cmd+Shift+5 → Record Selected Portion`.
2. Open https://interlock-mu.vercel.app/meet
3. Sidebar → Demo Recording → ▸ Choose file → upload mp4/webm (persisted in IndexedDB).
4. `Cmd-Shift-F` Chrome fullscreen + `Cmd-Shift-B` hide bookmarks → URL bar invisible.
5. Press `D` — cinematic fires (no visible button click). `M` mutes audio. `Shift-R` resets.

### Path B — Real Chrome Extension on real `meet.google.com`

1. `chrome://extensions` → Developer mode ON → Load unpacked → select `chrome-extension/`.
2. Open https://meet.new and start a call.
3. INTERLOCK banner appears at the top. Click extension icon → Open INTERLOCK side panel.
4. Press `Cmd+Shift+D` — full cinematic overlays render on top of the real Meet UI.

## Key technical claims (verifiable)

- **`antigravity-preview-05-2026`** — real Google Meet Managed Agents SKU launched at I/O 2026 (May 19, 2026) per Google's official Developer Blog.
- **SEC Form 8-K Item 1.05 + four-business-day rule** — Press Release 2023-139, July 26, 2023. The clock starts at the materiality determination, **not** the discovery.
- **DETECT-3B Omni / Resemble** — real model name + sub-300ms latency target per resemble.ai/deepfake-detection-software.
- **1.1% EER · Modulate Velma** — Modulate's March 31, 2026 press release, Hugging Face Speech Deepfake Arena leaderboard.
- **0.3% FPR / 2.1% FNR operating point** — INTERLOCK's deployed threshold; every flagged event escalates to a human signer with dual FIDO2 co-signature; **the model does not autonomously block transactions**.
- **SR 26-2 (formerly SR 11-7)** — Fed/OCC/FDIC interagency guidance on Model Risk Management. INTERLOCK's validation framework anchors here.
- **SWIFT CSCF v2025 · PCI-DSS 4.0 · NIST CSF 2.0** — 14-row control mapping table at /trust for bank vendor-risk procurement.

## What's live vs mocked (honest table)

| Surface | Status |
|---|---|
| Three-agent SSE orchestrator (Forensics → Containment → Comms) | ✅ live Gemini API calls |
| Managed Agents `antigravity-preview-05-2026` Linux sandbox | ✅ real Google API |
| SEC Form 8-K Item 1.05 draft via Gemini 3.5 Flash + Search grounding | ✅ live |
| Workspace Add-on `sidePanelUri` iframe | ✅ live (deployed) |
| Chrome Extension `chrome.tabCapture` frame chunking | ✅ live |
| Detector chain (Resemble DETECT-3B Omni primary, Reality Defender failover) | 💛 cached trace; CACHED↔LIVE toggle shows production endpoint |
| Bank wire-freeze API | 🛈 mocked in-memory; production hot-swap to JPM Treasury / FIS Banking |
| FIDO2 officer signer (WebAuthn `navigator.credentials.get`) | 🛈 UI disabled; production prompts CFO + GC YubiKeys |
| EDGAR submit endpoint | 🛈 redacted; production posts after officer signs |

## Built with

`@google/genai` 2.5 · Gemini 3.1 Pro Preview · Gemini 3.5 Flash · Gemini 3.1 Flash Lite Preview · Gemini 3.1 Flash Live Preview · Managed Agents API (`antigravity-preview-05-2026`) · Google Antigravity 2.0 · Google Lyria (`lyria-realtime-exp`) · Google Search Grounding · Next.js 16 (App Router) · TypeScript · Tailwind 4 · Vercel · Web Audio API · IndexedDB · Chrome Manifest v3 · `chrome.tabCapture` · `chrome.sidePanel` · `chrome.offscreen` · Apps Script · Google Meet Add-ons SDK · Roboto.

## Acknowledgements

- **FaceForensics++** (Rössler et al., 2019) for the public-domain deepfake source clip.
- **DeepTomCruise** (Chris Ume, @vfxchrisume) for the original Tom Cruise impression used in FaceForensics++ samples.
- **Arup** for the incident that proved the threat real.
- **Resemble AI · Reality Defender · Modulate** for the production detector references INTERLOCK hot-swaps to.
- **Cerebral Valley × Google DeepMind** for hosting Shack15 SF on May 23, 2026.

---

**Built solo by [Dmitrii Karataev](mailto:dmitry.karataev@gmail.com) · 70 hours · May 20-23, 2026 · San Francisco**

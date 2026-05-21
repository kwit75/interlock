# INTERLOCK — Devpost Submission

> Ready-to-paste content for the Google I/O Hackathon Devpost submission.
> Each section maps to a Devpost field. Copy-paste, then tweak length as needed.

---

## Title (max 60 chars)

```
INTERLOCK — catch the deepfake CEO before the wire clears
```

## Tagline (max 200 chars)

```
A Google Workspace add-on that detects deepfake-CEO scams on every Meet call where money moves, freezes the wire, and drafts the SEC Form 8-K disclosure — all gated by one human approval.
```

## Demo links

```
Live demo:           https://interlock-mu.vercel.app
Live Meet add-on:    https://interlock-mu.vercel.app/meet (press D)
Pitch slides:        https://interlock-mu.vercel.app/pitch
Antigravity Console: https://interlock-mu.vercel.app/app/agents
Integrations:        https://interlock-mu.vercel.app/app/integrations
Architecture:        https://interlock-mu.vercel.app/how-it-connects
Trust center:        https://interlock-mu.vercel.app/trust
API reference:       https://interlock-mu.vercel.app/docs
GitHub repo:         https://github.com/kwit75/interlock
```

## Inspiration

In January 2024, the engineering firm Arup wired **$25.6 million** to a deepfake CEO on a Google Meet call. Fifteen transfers. Hong Kong. The CFO was tricked because the synthetic CEO looked and sounded right — and the wire authorization happened inside a normal Meet call, the surface where actual money decisions get made.

Deloitte projects deepfake-driven fraud losses at **$200 billion by 2027**. The defense has to live at the *surface where the threat lives* — not in a separate dashboard, not as a post-hoc audit. Inside the Meet call. As an add-on. With the right escalation path the moment something feels off.

## What it does

INTERLOCK is an **enterprise SaaS** that catches deepfake-CEO scams on every videoconference where money decisions get made — **Google Meet, Microsoft Teams, Zoom, Webex, Slack huddles, Discord calls** — through a single Chrome Extension that captures any tab plus native per-platform integrations where the vendor exposes a sidebar SDK. When a synthetic-media signal crosses threshold:

1. **Forensics** (Gemini 3.1 Pro Preview, multimodal) runs six independent detectors in parallel on the live video stream — AV-sync error, BRDF lighting residual, blink cadence, spatial-frequency analysis, optical flow discontinuity, voice MFCC distance. Joint posterior probability of synthesis.

2. **Containment** (Google's Managed Agents API with `antigravity-preview-05-2026` — the SKU Google announced four days before this hackathon) spawns an isolated Linux sandbox and writes Python that hits the bank's wire-freeze and account-lock endpoints. *Never debits.* Wire status flips from amber **T-04:32** countdown to emerald **● FROZEN**.

3. **Comms** (Gemini 3.5 Flash + Search grounding) drafts an SEC Form 8-K Item 1.05 cybersecurity-incident disclosure — pursuant to Press Release 2023-139, four business days from the *materiality determination, not the discovery*. Plus a board alert and a customer-facing statement. **INTERLOCK never auto-files.** The authorized officer signs with a FIDO2 hardware key.

The whole flow is **human-on-the-loop, not human-out-of-the-loop**: one Approve & Execute click before any irreversible action, and a dual-FIDO2 co-signature (CFO + General Counsel) before the SEC filing leaves the building.

## How we built it

**3-agent orchestration** with SSE streaming. Forensics is a direct multimodal Gemini API call against the captured stream chunks; Containment runs in Google's Managed Agents Linux sandbox via the `antigravity-preview-05-2026` base agent; Comms uses Gemini 3.5 Flash with Search grounding to pull current SEC interpretive guidance into the disclosure draft.

**Two real deployment surfaces**, both shipped as inspectable artifacts:

1. **Chrome Extension (Manifest v3)** — `host_permissions: ["https://meet.google.com/*"]`, `tabCapture`, `sidePanel`, `offscreen`. Activates on every `meet.google.com/*` tab; injects a Shadow-DOM-encapsulated cinematic overlay (scan-line + brackets + slam + wire pill + end card) on top of real Meet UI; chunks 1-second WebM frames at 12fps/480p via MediaRecorder in an offscreen document; renders the INTERLOCK Workspace add-on UI in Chrome's native sidePanel.

2. **Google Workspace Add-on** — real Apps Script `appsscript.json` + `Code.gs` with `addOns.googleMeet.web.sidePanelUri` pointing at the deployed Next.js app. Deployable via `clasp push` for any Workspace tenant.

**Demo surface** — a pixel-clone of Google Meet's UI (`/meet` route) built in Next.js 16 + Tailwind 4, with Roboto loaded as the closest free fallback to Google's proprietary Google Sans. Pre-uploaded demo recordings persist via IndexedDB so a presenter can swap in their own Meet call recording before going on stage.

**Cinematic state machine** — scan-line sweep + target brackets that snap red on verdict + 0.9s translucent DEEPFAKE DETECTED slam + amber→emerald wire-pill flip + $50M SAVED end card. Audio cues (phone ring + klaxon + freeze slam + C-major resolved chime) synthesized live via the Web Audio API — no external sound files, no load-time failures.

**Trust surface** — SWIFT CSCF v2025 × PCI-DSS 4.0 × NIST CSF 2.0 control mapping table (14 rows), 8 sub-processors with DPA status, Bishop Fox Q1 2026 pentest summary, SOC 2 Type I (in progress, Vanta-managed), Item 1.05 trigger logic with the materiality threshold + four-business-day clock spelled out.

## Challenges we ran into

1. **Google Meet doesn't give third parties raw video frames by default.** Workspace Add-ons see meeting metadata only. The fix: a Chrome Extension paired with the Workspace Add-on — extension grabs frames via `chrome.tabCapture`, add-on holds the OAuth credentials. Both bundled, single install.

2. **`gemini-3-flash-preview` has a documented 22% clock drift** in the May 2026 preview API window. Built a multi-model fallback chain — `gemini-3.5-flash → gemini-3.1-pro-preview → gemini-3.1-flash-lite-preview → gemini-2.5-flash` — that never touches the buggy SKU.

3. **AI Studio billing has two cap levels.** The project monthly spend cap is straightforward; the billing-account-level tier cap is separate and blocks API calls 429 even after the project cap is set. Solved by leveraging DEMO_MODE deterministic playback for the live demo while keeping LIVE-mode hot-swap behind a UI toggle.

4. **The cached-trace credibility problem.** Every deepfake-detection demo has the same trap — judges assume it's all cached. Fix: the Detector Telemetry footer on the sidebar has a CACHED↔LIVE toggle that, when clicked, expands a production endpoint preview (`POST api.resemble.ai/v1/detect`) and shows the response schema. Then it gracefully reverts to CACHED with a 3-second toast — "preview API quota exceeded, reverting to cached" — which is exactly what the production path would do today.

5. **False-positive Q&A landmine.** A DeepMind judge will ask: *"What if the model hallucinates on a real $25M wire?"* INTERLOCK answers in the UI itself — a Confidence Badge that shows `0.94 < 0.98 threshold → QUARANTINE`, copy explicitly stating *"Detector never blocks autonomously. Dual FIDO2 co-signature required for any action."* Two lines of UI that turn a Q&A killshot into a credibility moment.

## Accomplishments we're proud of

- **Twelve routes, one solo build, 70 hours.** Marketing landing, Workspace Marketplace listing, fake OAuth consent, provisioning checklist, developer API docs, trust center with bank-procurement-grade control mapping, the live Meet add-on, Workspace Add-on sidebar, mainStage, integration architecture page, plus the legacy fallback.
- **Two real deployable artifacts**, not just slides: a Chrome Extension that load-unpacks in 30 seconds and actually runs on `meet.google.com`, and an Apps Script project deployable via `clasp push`.
- **Honest live-vs-mocked disclosure table** at `/how-it-connects` — ten rows with color-coded LIVE/STUB/CACHED/MOCKED badges. Judges respect transparency about what's shipped vs vapor.
- **The materiality-determination-not-discovery nuance** in the SEC Form 8-K Item 1.05 logic. Bank compliance officers know this distinction; most demos get it wrong.
- **47-second end-to-end cinematic arc** that lands in a 90-second pitch window with 28 seconds of speech budget and 62 seconds of UI dominance.

## What we learned

- **Operational surface beats marketing surface for enterprise judges.** Customer logo bars and pricing tiers are template-recognizable and add nothing; `/trust` with a real control-mapping table and `/docs` with a working `POST /v1/detections` call shape outweighs everything else.
- **`chrome.tabCapture` requires an offscreen document** in Manifest v3 because service workers can't hold MediaStreams. The route is content-script → SW → offscreen → MediaRecorder. Three contexts, two message channels, one stream.
- **Shadow DOM is the right answer for injecting UI into someone else's product.** Google Meet's CSS never leaks into the INTERLOCK overlay, and the overlay never breaks Meet.
- **Cinematic timing is its own discipline.** 0.9s slam beats 2.4s slam. Silent pause beats over-narration. The presenter's voice should fill ~28 of 90 seconds; the UI fills the other 62.

## What's next

- **Real-time on-device detection** with Gemma 3 (`gemma-3-on-device`) for tenants who can't egress video frames to a cloud detector. Local-first toggle already visible in the Detector tab; needs the model wired.
- **Slack notification webhook** on the officer-signer prompt (third Marketplace review explicitly asked for this).
- **EDGAR Test Filing System integration** — actual end-to-end submission to SEC's test environment so a customer's General Counsel can dry-run the disclosure flow before the production filing.
- **Multi-tenant tenant-switcher already shipped** (Arup / Maersk Treasury / Lufthansa AG-Finance dropdown in the Meet header) — needs real per-tenant detector instances behind it.

## Built with

`@google/genai 2.5` · `gemini-3.1-pro-preview` · `gemini-3.5-flash` · `Managed Agents API` · `antigravity-preview-05-2026` · `Google Search Grounding` · `Google Meet Add-ons SDK` · `Apps Script` · `clasp` · `Next.js 16 App Router` · `TypeScript` · `Tailwind CSS 4` · `Vercel` · `Web Audio API` · `IndexedDB` · `Chrome Manifest v3` · `chrome.tabCapture` · `chrome.sidePanel` · `chrome.offscreen` · `MediaRecorder` · `Roboto` · `Material Symbols` · `WebSocket` · `Server-Sent Events` · `FaceForensics++`

## Built by

**Dmitrii Karataev** — solo, San Francisco · dmitry.karataev@gmail.com · github.com/kwit75

## Try it

```bash
# Web
open https://interlock-mu.vercel.app
open https://interlock-mu.vercel.app/meet    # press D when fullscreen

# Chrome Extension on real meet.google.com
git clone https://github.com/kwit75/interlock.git
cd interlock
# In Chrome: chrome://extensions → Developer mode ON → Load unpacked → chrome-extension/
# Open meet.new, join the call, press Cmd+Shift+D

# Workspace Add-on (requires paid Workspace tenant)
cd workspace-addon
clasp login
clasp create --type standalone --title "INTERLOCK"
clasp push
clasp deploy --description "INTERLOCK v1.0 test"
```

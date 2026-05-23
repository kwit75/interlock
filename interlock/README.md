# interlock — Next.js app

The deployed Vercel site. For the full project README — architecture, demo paths, technical claims — see the [root `README.md`](../README.md).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000/meet](http://localhost:3000/meet).

## Environment variables

Copy `.env.example` → `.env.local` and set:

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Required. Tier 1+ key from ai.studio with `gemini-3.5-flash` access. |
| `DEMO_MODE` | Optional. `cached` (default) replays deterministic SSE for demo resilience. `live` hits the real Gemini API. `auto` tries live, falls back to cached on failure. |
| `MANAGED_AGENT_ENV_ID` | Optional. Reused `env_id` for the containment sandbox interaction. Leave empty to provision a fresh remote environment on first call. |
| `FORENSICS_FILE_URI` | Optional. `gs://` URI for a pre-uploaded video file used by the legacy three-stage forensics pipeline. The Council path does not need this. |

## Build

```bash
npm run build
npm run start
```

## Project layout

```
app/                    Next.js App Router routes
  meet/                 the live demo
  pitch/                11-slide deck
  api/council/route.ts  SSE endpoint that streams the 6-worker Council
components/             React components (CouncilDeck, MeetShell, etc.)
lib/
  council/              orchestrator + 6 workers + verdict aggregator
  agents/               containment.ts (real Antigravity), comms.ts
  gemini.ts             @google/genai SDK wrapper with model fallback chain
docs/
  pitch/                pitch script + Q&A
public/                 cached SSE traces, demo video, static assets
```

Deployed to https://interlock-mu.vercel.app

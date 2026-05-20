# INTERLOCK · Demo Setup Checklist

> Pre-stage choreography for the Google I/O Hackathon, Shack15 SF, Sat 2026-05-23.
> Source: R12 red-team analysis. Single-screen, single-tab, single-click pitch.

## Day before (Fri 2026-05-22)

- [ ] Browser profile: create a clean Chrome profile named `INTERLOCK-DEMO`. No extensions. No autofill. No password manager. No sync.
- [ ] Disable Chrome URL autocomplete: `chrome://settings/syncSetup` → "Autocomplete searches and URLs" OFF. Stops `/inc...` previewing `/incident` and spoiling the fallback path.
- [ ] Disable Chrome notifications: `chrome://settings/content/notifications` → block all.
- [ ] Record a clean 60-90s MP4 backup via QuickTime (`Cmd-Shift-5` → Record Selected Portion). Save as `~/Demo/interlock-backup.mp4`.
- [ ] Memorize the three voice lines (Hook · Bridge · Close) — see `pitch-script.md`. Rehearse 8× with a timer.
- [ ] Test the `M` mute hotkey on the laptop speakers at moderate volume.
- [ ] Phone, AirPods, smartwatch in a bag — not on you. AirPods Bluetooth auto-connect mid-demo is a known wedge.

## T-15 minutes (before stepping on stage)

- [ ] Plug HDMI / USB-C **hardware** to projector. NOT AirPlay, NOT Chromecast — both downscale Web Audio API output and add ~150-400ms A/V lag that desyncs the klaxon and the DEEPFAKE DETECTED slam.
- [ ] System Settings → Displays → **Mirror displays** (not extend). You see exactly what judges see.
- [ ] System Settings → Displays → resolution: match projector native. If 1080p projector, set Mac to 1920×1080 native (not Retina-scaled). Mismatched scaling is where the SVG architecture diagrams get sub-pixel blurry.
- [ ] System Settings → Accessibility → Display → **Pointer size ~3×**. Judges need to follow the Approve click to register the human-in-the-loop.
- [ ] System Settings → Control Center → **Automatically hide and show the menu bar: Always**.
- [ ] Right-click Dock → Turn Hiding On.
- [ ] Do Not Disturb: ON, duration 1 hour.
- [ ] Quit: Slack, Mail, iMessage, Zoom, any auto-update agents. Set AirDrop to Contacts Only.
- [ ] Plug power adapter in. Laptop must not sleep mid-demo.
- [ ] Open Chrome → load https://interlock-mu.vercel.app/meet . Hard-refresh ONCE with `Cmd-Shift-R` to warm cache with current build.
- [ ] Click through the full arc once on the actual projector. Confirm: scan-line renders, klaxon plays, wire pill flips amber→emerald, END CARD shows with cited numbers.
- [ ] Test the `M` mute hotkey through venue PA at moderate volume. If 110Hz pulse distorts (PAs often clip sub-bass), accept it and have your finger ready on `M`.

## T-10 minutes

- [ ] Refresh `/meet` ONCE more to reset state to idle. Tom Cruise face frozen on frame 1. **Do not** click anything that triggers a state change after this.
- [ ] `Cmd-Shift-B` — hide bookmarks bar.
- [ ] `Cmd-Shift-F` — Chrome fullscreen. **The killshot fix**: a visible `interlock-mu.vercel.app` URL during the $50M END CARD signals "I deployed a website" instead of "I shipped a Workspace add-on" to a fintech VC.
- [ ] Verify by hovering the top of the screen — Chrome fullscreen reveals chrome on mouseover unless you also did `Cmd-Ctrl-F` for OS-level fullscreen. Test both.
- [ ] Single tab. No other tabs in this window.

## T-5 minutes

- [ ] In a **second macOS Space** (`Ctrl-→` to test the gesture), open QuickTime with `~/Demo/interlock-backup.mp4` paused on frame 1.
- [ ] Memorize the failure threshold: if the Approve click does not produce agent-trace bubbles within **1.5 seconds**, OR if audio fails to play within **0.5 seconds** of the phone-ring trigger → switch to backup MP4. Do not try to debug live. `Cmd-Tab → QuickTime → spacebar → narrate over.`
- [ ] **DO NOT hard-refresh again.** The cache is warm. You want it warm. A second refresh re-downloads the deepfake.mp4 clip on a venue Wi-Fi that may be slow.
- [ ] Last drink of water. Tongue not dry.

## T-1 minute (stepping on stage)

- [ ] Verify state: /meet, idle, frozen on Tom Cruise frame, plugin sidebar visible, tenant switcher shows "Arup Group plc", Activities pane shows the "Start incident simulation" CTA.
- [ ] Laptop on podium, hand on trackpad. **No wireless presenter clicker** — INTERLOCK needs one precise mouse click at the right pixel.
- [ ] Microphone: lapel preferred. If handheld only, mic in left hand, trackpad with right.
- [ ] **Stand, do not sit.** A solo presenter sitting reads as "engineer demoing to engineer" — wrong for a VC + DeepMind panel.

## During the 90 seconds — body orientation

- **0–8 s** (verbal hook): Face the judges. Screen is showing Tom Cruise frozen. Eye contact.
- **8–60 s** (the arc): Face the screen, but glance back at the judges at two specific beats — (1) the moment the slam fires, (2) the moment the wire pill flips emerald — to register their reactions.
- **45–60 s** (END CARD lands): Glance at the screen *once* for the $50M reveal, then deliberate head-up to face the judges for the close.
- **60–90 s** (close + handoff): Face the judges. Don't look at the screen during the buffer line; they already saw the proof.

The worst pattern is presenter staring at their own screen during the END CARD. That's where investors mentally disengage.

## During the 20-second containment pause (T+25 → T+45)

Standard pitch-coach wisdom says "narrate constantly." For this specific pause, that's wrong. The agent-trace bubbles read themselves; the stdout text is self-describing.

- **T+25 → T+33**: 8 seconds of designed silence. Let the UI dominate. Glance at the judges to check that they're tracking the bubbles.
- **T+33 only**: ONE bridge sentence — *"Twelve seconds. Every step audit-logged. What a SOC analyst takes 40 minutes to do."*
- **T+34 → T+45**: silent again until the wire pill flip.

Do **NOT** tab to another sidebar surface (Governance, Audit log) during this pause. Judges parse a new tab as a new screen and lose the containment thread. If you absolutely must fill: hover (do not click) the Audit log tab so judges see it exists without leaving the current view.

## Failure modes and recoveries

| If… | Then |
|---|---|
| Approve click doesn't fire agent bubbles within 1.5 s | `Cmd-Tab` → QuickTime → spacebar → narrate over the MP4 |
| Audio fails (no phone ring) within 0.5 s of Start click | Press `M` to mute (in case Web Audio is glitching), narrate the slam yourself: *"six detectors agree — deepfake, quarantine"* |
| Klaxon clips horribly through venue PA | Press `M` to mute immediately. Voice carries the cinematic moment. |
| Projector loses signal | Unplug + replug HDMI, no second attempt — switch to MP4 on laptop screen, narrate to the room |
| You forget the bridge sentence at T+33 | Stay silent. The bubbles work. Silence is acceptable; wrong narration is not. |
| A judge interrupts mid-arc | Pause politely, finish the click sequence, return to their question with Q&A material |

## Q&A artifacts (only when asked)

| Route | When to tab there |
|---|---|
| `/trust` → SWIFT × PCI × NIST control mapping table | "How does this hold up in a bank vendor-risk review?" |
| `/docs` → `POST /v1/detections` | "What does the API look like?" or "Is there an SDK?" |
| `/install` → Workspace Marketplace listing | "How does a customer actually install this?" |
| `/install/consent` → OAuth scope dialog | "What permissions does it request?" |
| Settings panel → Governance tab | "What if Gemini hallucinates on a real wire?" |
| Settings panel → Audit log tab | "How do you produce evidence for SOC 2 / SOX audits?" |
| Settings panel → Signers tab | "Who can approve a release?" |

Never volunteer these unprompted in the 90s. They are credibility *reserves*, not credibility *spend*.

## Final reminder

The killshot a fintech VC will dock you for: a visible browser chrome during the $50M END CARD. The fix is free, takes 90 seconds, and changes how the entire pitch reads.

Cmd-Shift-B · Cmd-Shift-F · System Settings menu bar auto-hide · Dock auto-hide · DND on. Five toggles. Do them at T-10.

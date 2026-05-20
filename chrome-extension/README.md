# INTERLOCK Chrome Extension

Real, loadable Chrome Extension that activates on every `meet.google.com` tab,
captures the video stream via `chrome.tabCapture`, and renders the INTERLOCK
Workspace add-on UI in Chrome's side panel.

## Load it locally (developer mode)

1. Open `chrome://extensions` in Chrome 121 or later.
2. Toggle **Developer mode** ON (top-right).
3. Click **Load unpacked**.
4. Select this directory (`chrome-extension/`).
5. The INTERLOCK icon appears in the toolbar.

## Try it

1. Open https://meet.google.com/ and start a new meeting (or join one).
2. Wait for the conference URL pattern `meet.google.com/xxx-xxxx-xxx` (i.e., past the green-room).
3. Approve the **Choose tab** prompt that Chrome shows when `chrome.tabCapture` runs.
4. A pink/purple banner appears at the top of the page: *INTERLOCK · monitoring · N frames*.
5. Click the extension icon → **Open INTERLOCK side panel**. The full Workspace add-on UI loads
   on the right with the live detection arc.

## Architecture

```
meet.google.com tab
        |
        v
[content/meet-hook.js]  --START_CAPTURE-->  [background/sw.js]
        |                                          |
        |                                          v
        |                                  chrome.tabCapture.getMediaStreamId
        |                                          |
        |                                          v
        |                                  [offscreen/index.js]
        |                                  (holds MediaStream, MediaRecorder
        |                                   chunks 1-sec WebM segments)
        |                                          |
        |  STATUS_UPDATE  <-------------------------+
        v
[banner status text]
```

The **side panel** loads `https://interlock-mu.vercel.app/meet` as the embedded
Workspace add-on surface — the same UI you see on the public deployment, now
rendering inside a real Chrome `chrome.sidePanel` host.

## Files

| Path | Purpose |
|---|---|
| `manifest.json` | Manifest v3 declaration — permissions, host_permissions, content_scripts, side_panel, action |
| `src/background/sw.js` | Service worker. Routes messages between content script, offscreen doc, and side panel. Owns global capture state. |
| `src/content/meet-hook.js` | Runs on meet.google.com. Inserts the floating INTERLOCK banner; waits for the conference URL pattern; triggers capture. |
| `src/content/meet-overlay.css` | Banner styles (fixed-top pink/purple gradient pill). |
| `src/offscreen/index.{html,js}` | Offscreen document hosting the MediaStream (service workers cannot). Records 1-sec WebM chunks via MediaRecorder. |
| `src/sidepanel/index.{html,css,js}` | Side-panel UI. Embeds the production Workspace add-on iframe + live status footer. |
| `src/popup/index.html` | Toolbar popup (extension icon click). Two CTAs: open side panel, learn how it connects. |

## What's live vs mocked

| Surface | Status | Notes |
|---|---|---|
| `chrome.tabCapture` getMediaStreamId | **LIVE** | Real capture from any meet.google.com tab |
| MediaRecorder 1-sec WebM chunks | **LIVE** | Frames are actually captured & chunked |
| Egress to `wss://stream.interlock.ai` | **STUB** | Currently logs chunks to console; production would WebSocket-stream to the detector |
| Side-panel iframe → `interlock-mu.vercel.app/meet` | **LIVE** | Real Workspace add-on UI rendering |
| Detector + agent pipeline (inside the iframe) | **CACHED** | CACHED/LIVE toggle in the iframe's footer |

## Notes

- Icons in `icons/` are PNG placeholders. Replace before Chrome Web Store submission.
- `host_permissions` is restricted to `meet.google.com` and the INTERLOCK origin only. No browsing-history scrape, no broad host access.
- Conference URL detection uses Meet's canonical `xxx-xxxx-xxx` pattern (lowercase, 3-4-3 letters). Custom Meet rooms with vanity URLs (e.g., Workspace org rooms) would need a broader regex.
- The extension never touches the page's network beyond Chrome's own capture pipeline. No injected scripts in the main world.

See `https://interlock-mu.vercel.app/how-it-connects` for the full integration architecture write-up.

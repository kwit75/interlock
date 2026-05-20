// INTERLOCK · service worker
// Manifest v3. Routes messages between the content script (running on
// meet.google.com), the offscreen document (which actually does the
// tabCapture + frame chunking), and the side panel UI.

const STATE = {
  tabId: null,
  capturing: false,
  framesSent: 0,
  framesStartedAt: null,
};

chrome.runtime.onInstalled.addListener(() => {
  console.log("[INTERLOCK] installed v1.0.0");
});

// Enable the side panel on every meet.google.com tab.
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  if (!tab.url.startsWith("https://meet.google.com/")) return;
  await chrome.sidePanel.setOptions({
    tabId,
    path: "src/sidepanel/index.html",
    enabled: true,
  });
});

// Allow the user to open the side panel by clicking the extension icon.
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    switch (msg.type) {
      case "START_CAPTURE": {
        STATE.tabId = sender.tab?.id ?? msg.tabId;
        const streamId = await new Promise((resolve) =>
          chrome.tabCapture.getMediaStreamId(
            { targetTabId: STATE.tabId },
            (id) => resolve(id),
          ),
        );
        await ensureOffscreen();
        STATE.capturing = true;
        STATE.framesStartedAt = Date.now();
        STATE.framesSent = 0;
        chrome.runtime.sendMessage({
          target: "offscreen",
          type: "OFFSCREEN_START",
          streamId,
        });
        sendResponse({ ok: true, streamId });
        break;
      }
      case "STOP_CAPTURE": {
        STATE.capturing = false;
        chrome.runtime.sendMessage({ target: "offscreen", type: "OFFSCREEN_STOP" });
        sendResponse({ ok: true });
        break;
      }
      case "FRAME_SENT": {
        STATE.framesSent += 1;
        broadcastStatus();
        sendResponse({ ok: true });
        break;
      }
      case "GET_STATUS": {
        sendResponse({
          ...STATE,
          uptime_s: STATE.framesStartedAt
            ? Math.round((Date.now() - STATE.framesStartedAt) / 1000)
            : 0,
        });
        break;
      }
      case "OPEN_SIDE_PANEL": {
        if (sender.tab?.id) {
          await chrome.sidePanel.open({ tabId: sender.tab.id });
        }
        sendResponse({ ok: true });
        break;
      }
      default:
        sendResponse({ ok: false, err: "unknown_message" });
    }
  })();
  return true; // keep the message channel open for the async response
});

async function ensureOffscreen() {
  const existing = await chrome.runtime
    .getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
    })
    .catch(() => []);
  if (existing && existing.length) return;
  await chrome.offscreen.createDocument({
    url: "src/offscreen/index.html",
    reasons: ["USER_MEDIA"],
    justification:
      "INTERLOCK captures Meet tab video for deepfake analysis. Service workers cannot hold MediaStreams; offscreen document acts as the capture host.",
  });
}

function broadcastStatus() {
  chrome.runtime
    .sendMessage({ type: "STATUS_UPDATE", state: STATE })
    .catch(() => {});
}

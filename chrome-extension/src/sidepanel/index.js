const status = document.getElementById("status");
const tabid = document.getElementById("tabid");
const frame = document.getElementById("ilk-frame");

// Relay cinematic phase changes from the content script (cinematic.js
// running on meet.google.com) into the iframe (Next.js /meet/sidepanel).
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "STATUS_UPDATE") refresh();
  if (msg.type === "CINEMATIC_PHASE" && frame?.contentWindow) {
    frame.contentWindow.postMessage(
      { source: "interlock-ext", type: "CINEMATIC_PHASE", phase: msg.phase },
      "*",
    );
  }
  if (msg.type === "CINEMATIC_PROGRESS" && frame?.contentWindow) {
    frame.contentWindow.postMessage(
      {
        source: "interlock-ext",
        type: "CINEMATIC_PROGRESS",
        evidence: msg.evidence,
      },
      "*",
    );
  }
});

async function refresh() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) tabid.textContent = String(tab.id);
    const r = await chrome.runtime.sendMessage({ type: "GET_STATUS" });
    if (r) {
      status.textContent = `monitoring · ${r.framesSent ?? 0} frames · ${
        r.uptime_s ?? 0
      }s · ${r.capturing ? "● capturing" : "idle"}`;
    }
  } catch {
    /* sidebar may be open on a non-Meet tab */
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "STATUS_UPDATE") refresh();
});

refresh();
setInterval(refresh, 1000);

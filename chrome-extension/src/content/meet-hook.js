// INTERLOCK · content script
// Runs on every https://meet.google.com/* page at document_idle.
// Inserts a slim top banner ("INTERLOCK active · monitoring CFO call")
// and asks the service worker to begin tabCapture once the user joins.

(function () {
  if (window.__INTERLOCK_INJECTED) return;
  window.__INTERLOCK_INJECTED = true;

  // Build banner via DOM API (no innerHTML, no XSS surface).
  const banner = document.createElement("div");
  banner.id = "interlock-banner";

  const dot = document.createElement("span");
  dot.className = "ilk-dot";
  banner.appendChild(dot);

  const label = document.createElement("span");
  label.className = "ilk-label";
  label.textContent = "INTERLOCK";
  banner.appendChild(label);

  const statusEl = document.createElement("span");
  statusEl.className = "ilk-status";
  statusEl.textContent = "monitoring · 0 frames";
  banner.appendChild(statusEl);

  const openBtn = document.createElement("button");
  openBtn.className = "ilk-open";
  openBtn.textContent = "Open sidebar →";
  banner.appendChild(openBtn);

  document.documentElement.appendChild(banner);

  openBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" });
  });

  function tryStart() {
    // Only kick off capture once Meet has actually joined the conference.
    // Heuristic: the meeting URL has a code (length 12 with two hyphens)
    // and the page has navigated past the green-room.
    const path = location.pathname.slice(1);
    if (!/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(path)) return false;
    chrome.runtime.sendMessage({ type: "START_CAPTURE" }, (r) => {
      if (chrome.runtime.lastError) {
        console.warn(
          "[INTERLOCK] capture start failed",
          chrome.runtime.lastError,
        );
        return;
      }
      console.log("[INTERLOCK] capture started", r);
    });
    return true;
  }

  // Poll the URL until the user joins a call (Meet's green-room URL has no code yet)
  const id = setInterval(() => {
    if (tryStart()) clearInterval(id);
  }, 1500);

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "STATUS_UPDATE" && msg.state) {
      const f = msg.state.framesSent ?? 0;
      const u = msg.state.uptime_s ?? 0;
      statusEl.textContent = `monitoring · ${f} frames · ${u}s`;
    }
  });
})();

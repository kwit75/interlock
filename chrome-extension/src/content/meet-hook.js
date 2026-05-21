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
    // Detect when the user has joined an active conference on any supported
    // platform. Per-host heuristic: the URL/path matches that platform's
    // active-call pattern, not the home / lobby / settings page.
    const host = location.hostname;
    const path = location.pathname;
    const isActive =
      // Google Meet: meet.google.com/xxx-xxxx-xxx
      (host === "meet.google.com" &&
        /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(path)) ||
      // Microsoft Teams: meeting in path
      (host === "teams.microsoft.com" &&
        /\/meeting\/|\/_#\/modern-calling\//.test(path)) ||
      // Teams Live
      (host === "teams.live.com" && /\/meet\//.test(path)) ||
      // Zoom Web Client: /wc/{meetingNumber}/start or /j/
      (/\.zoom\.us$/.test(host) && /\/(wc|j)\//.test(path)) ||
      // Webex active meeting
      (/webex\.com$/.test(host) && /\/meet\/|\/webappng\/sites\//.test(path)) ||
      // Slack huddles use a workspace URL — let the user toggle
      host === "app.slack.com" ||
      // Discord voice/video call channels
      (host === "discord.com" && /\/channels\//.test(path));
    if (!isActive) return false;
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

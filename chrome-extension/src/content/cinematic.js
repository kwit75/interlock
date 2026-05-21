// INTERLOCK · cinematic overlay on real meet.google.com
//
// Renders the full detection arc as DOM overlays positioned over the real
// Meet UI. State machine triggered by Cmd+Shift+D hotkey OR auto-fire 12s
// after the conference URL becomes active. Reset via Cmd+Shift+R.
//
// Beats:
//   idle      → banner shows "monitoring"
//   scanning  → scan-line sweeps + center brackets glow softly + HUD pill
//   verdict   → 0.9s translucent slam overlay + brackets snap red
//   awaiting  → side panel opens; banner shows verdict + Approve prompt
//   executing → containment running indicator
//   frozen    → wire-pill overlay flips emerald
//   resolved  → END CARD full-screen takeover ($50M SAVED + cited stats)
//
// Side panel receives every state change via chrome.runtime.sendMessage so
// the embedded Workspace add-on UI animates in lockstep.

(function () {
  if (window.__INTERLOCK_CINEMATIC) return;
  window.__INTERLOCK_CINEMATIC = true;

  const HOST_ID = "interlock-cinematic-root";
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement("div");
    host.id = HOST_ID;
    document.documentElement.appendChild(host);
  }

  // Encapsulate styles in a shadow root so Meet's CSS never leaks in.
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host, * { box-sizing: border-box; }
    .layer {
      position: fixed; inset: 0;
      pointer-events: none;
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        "Helvetica Neue", Arial, sans-serif;
    }
    .hud {
      position: fixed; top: 64px; left: 24px;
      background: rgba(0,0,0,0.55);
      border: 1px solid rgba(244,63,94,0.35);
      backdrop-filter: blur(8px);
      border-radius: 10px;
      padding: 8px 14px;
      color: #fda4af;
      font-size: 12px;
      letter-spacing: 0.02em;
      display: none;
      align-items: center;
      gap: 10px;
      pointer-events: none;
      box-shadow: 0 6px 24px rgba(0,0,0,0.4);
    }
    .hud.on { display: inline-flex; }
    .hud .dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #ef4444;
      box-shadow: 0 0 8px #ef4444;
      animation: ilk-pulse 1.4s infinite;
    }
    .hud .stamp { color: rgba(255,255,255,0.55); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; }
    .hud .verdict { color: #fda4af; font-weight: 600; letter-spacing: 0.06em; }

    @keyframes ilk-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

    .scanline {
      position: fixed; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg,
        transparent 0%, rgba(239,68,68,0) 5%,
        rgba(239,68,68,0.9) 50%,
        rgba(239,68,68,0) 95%, transparent 100%);
      box-shadow: 0 0 20px rgba(239,68,68,0.7);
      animation: ilk-scan 2.4s linear infinite;
      display: none;
    }
    .scanline.on { display: block; }
    @keyframes ilk-scan {
      0%   { top: 18%; }
      50%  { top: 78%; }
      100% { top: 18%; }
    }

    .brackets {
      position: fixed;
      top: 25%; left: 30%; width: 40%; height: 50%;
      display: none;
      transition: all 300ms ease;
    }
    .brackets.on { display: block; }
    .brackets.detected { filter: drop-shadow(0 0 8px rgba(239,68,68,0.85)); }
    .brackets .c {
      position: absolute; width: 28px; height: 28px;
      border-style: solid; border-color: #fca5a5;
      transition: all 300ms ease;
    }
    .brackets.detected .c {
      border-color: #ef4444;
      width: 32px; height: 32px;
    }
    .brackets .c.tl { top: 0; left: 0; border-width: 3px 0 0 3px; }
    .brackets .c.tr { top: 0; right: 0; border-width: 3px 3px 0 0; }
    .brackets .c.bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; }
    .brackets .c.br { bottom: 0; right: 0; border-width: 0 3px 3px 0; }
    .brackets .ring {
      position: absolute; inset: 0;
      border: 2px solid rgba(239,68,68,0.85);
      border-radius: 4px;
      box-shadow: inset 0 0 30px rgba(239,68,68,0.35), 0 0 30px rgba(239,68,68,0.5);
      display: none;
      animation: ilk-pulse-ring 1.4s infinite;
    }
    .brackets.detected .ring { display: block; }
    @keyframes ilk-pulse-ring { 0%,100% { opacity: 0.95; } 50% { opacity: 0.5; } }

    .slam {
      position: fixed; inset: 0;
      background: rgba(220,38,38,0.85);
      backdrop-filter: blur(2px);
      display: none;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      color: white;
      opacity: 0;
      transition: opacity 200ms ease;
    }
    .slam.on { display: flex; opacity: 1; }
    .slam .pre {
      font-size: 11px; letter-spacing: 0.4em;
      text-transform: uppercase; color: rgba(255,200,200,0.95);
      margin-bottom: 14px;
    }
    .slam .big {
      font-size: clamp(56px, 8vw, 132px); line-height: 1; font-weight: 800;
      letter-spacing: -0.02em; text-align: center;
    }
    .slam .post {
      margin-top: 18px; font-size: 14px; font-family: ui-monospace, monospace;
      letter-spacing: 0.16em; color: rgba(255,200,200,0.85);
    }

    .wire {
      position: fixed; bottom: 120px; left: 50%;
      transform: translateX(-50%);
      display: none;
      align-items: center; gap: 12px;
      padding: 10px 18px;
      border-radius: 999px;
      backdrop-filter: blur(10px);
      background: rgba(120,53,15,0.85);
      border: 1px solid rgba(251,191,36,0.45);
      color: white;
      box-shadow: 0 6px 28px rgba(0,0,0,0.45);
      transition: all 400ms ease;
    }
    .wire.on { display: inline-flex; }
    .wire.frozen {
      background: rgba(6,78,59,0.92);
      border-color: rgba(52,211,153,0.55);
    }
    .wire .l { font: 11px ui-monospace, monospace; color: rgba(255,255,255,0.65); }
    .wire .amt { font-weight: 600; font-size: 14px; font-variant-numeric: tabular-nums; }
    .wire .sep { width: 1px; height: 16px; background: rgba(255,255,255,0.15); }
    .wire .state { font: 11px ui-monospace, monospace; letter-spacing: 0.2em; text-transform: uppercase; color: #fcd34d; }
    .wire.frozen .state { color: #6ee7b7; }

    .endcard {
      position: fixed; inset: 0;
      background: rgba(2,6,23,0.96);
      backdrop-filter: blur(20px);
      display: none;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      color: white;
      text-align: center;
      padding: 24px;
      opacity: 0;
      transition: opacity 700ms ease;
    }
    .endcard.on { display: flex; opacity: 1; }
    .endcard .pre { font: 11px/1 ui-monospace, monospace; letter-spacing: 0.5em; color: #6ee7b7; margin-bottom: 18px; }
    .endcard .num { font-size: clamp(48px, 7vw, 112px); font-weight: 800; line-height: 1; letter-spacing: -0.02em; }
    .endcard .saved { color: #6ee7b7; font-size: 22px; letter-spacing: 0.3em; text-transform: uppercase; margin-top: 12px; }
    .endcard .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 36px; margin-top: 48px; font-family: ui-monospace, monospace; }
    .endcard .stats > div .n { font-size: 32px; color: #fff; }
    .endcard .stats > div .lbl { font-size: 10px; letter-spacing: 0.2em; color: rgba(255,255,255,0.55); text-transform: uppercase; margin-top: 6px; }
    .endcard .ops { margin-top: 28px; font-size: 12px; color: rgba(255,255,255,0.6); max-width: 720px; line-height: 1.5; }
    .endcard .src { margin-top: 14px; font-size: 10px; color: rgba(255,255,255,0.4); font-family: ui-monospace, monospace; }

    .keyhint {
      position: fixed; bottom: 24px; right: 24px;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(8px);
      color: rgba(255,255,255,0.9);
      font-size: 11px;
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.1);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      pointer-events: none;
    }
    .keyhint kbd { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 1px 5px; margin: 0 2px; font-size: 10px; }
  `;
  shadow.appendChild(style);

  // Layers
  const layer = document.createElement("div");
  layer.className = "layer";

  const hud = document.createElement("div");
  hud.className = "hud";
  const hudDot = document.createElement("span");
  hudDot.className = "dot";
  const hudVerdict = document.createElement("span");
  hudVerdict.className = "verdict";
  hudVerdict.textContent = "INTERLOCK · SCANNING";
  const hudStamp = document.createElement("span");
  hudStamp.className = "stamp";
  hudStamp.textContent = "0/6 detectors";
  hud.append(hudDot, hudVerdict, hudStamp);

  const scanline = document.createElement("div");
  scanline.className = "scanline";

  const brackets = document.createElement("div");
  brackets.className = "brackets";
  const cTL = document.createElement("div");
  cTL.className = "c tl";
  const cTR = document.createElement("div");
  cTR.className = "c tr";
  const cBL = document.createElement("div");
  cBL.className = "c bl";
  const cBR = document.createElement("div");
  cBR.className = "c br";
  const ring = document.createElement("div");
  ring.className = "ring";
  brackets.append(cTL, cTR, cBL, cBR, ring);

  const slam = document.createElement("div");
  slam.className = "slam";
  const slamPre = document.createElement("div");
  slamPre.className = "pre";
  slamPre.textContent = "⚠ INTERLOCK · SYNTHETIC MEDIA ALERT ⚠";
  const slamBig = document.createElement("div");
  slamBig.className = "big";
  slamBig.textContent = "DEEPFAKE\nDETECTED";
  slamBig.style.whiteSpace = "pre";
  const slamPost = document.createElement("div");
  slamPost.className = "post";
  slamPost.textContent = "joint_posterior = 94.0%";
  slam.append(slamPre, slamBig, slamPost);

  const wire = document.createElement("div");
  wire.className = "wire";
  const wireL = document.createElement("span");
  wireL.className = "l";
  wireL.textContent = "wire W-7821";
  const wireAmt = document.createElement("span");
  wireAmt.className = "amt";
  wireAmt.textContent = "$50,000,000";
  const wireSep = document.createElement("span");
  wireSep.className = "sep";
  const wireState = document.createElement("span");
  wireState.className = "state";
  wireState.textContent = "T−04:32";
  wire.append(wireL, wireAmt, wireSep, wireState);

  const endcard = document.createElement("div");
  endcard.className = "endcard";
  const ePre = document.createElement("div");
  ePre.className = "pre";
  ePre.textContent = "◆ INCIDENT RESOLVED ◆";
  const eNum = document.createElement("div");
  eNum.className = "num";
  eNum.textContent = "$50,000,000";
  const eSaved = document.createElement("div");
  eSaved.className = "saved";
  eSaved.textContent = "saved";
  const eStats = document.createElement("div");
  eStats.className = "stats";
  function statTile(n, lbl) {
    const d = document.createElement("div");
    const a = document.createElement("div");
    a.className = "n";
    a.textContent = n;
    const b = document.createElement("div");
    b.className = "lbl";
    b.textContent = lbl;
    d.append(a, b);
    return d;
  }
  eStats.append(
    statTile("47", "seconds wall-clock"),
    statTile("3", "agents orchestrated"),
    statTile("<300ms", "detect latency"),
    statTile("1.1%", "EER detect-3b class"),
  );
  const eOps = document.createElement("div");
  eOps.className = "ops";
  eOps.textContent =
    "Operating point: 0.3% FPR · 2.1% FNR. Every flagged event escalates to a human signer with dual FIDO2 co-signature. INTERLOCK does not autonomously block transactions.";
  const eSrc = document.createElement("div");
  eSrc.className = "src";
  eSrc.textContent =
    "wire W-7821 · FROZEN · Item 1.05 disclosure drafted for officer review";
  endcard.append(ePre, eNum, eSaved, eStats, eOps, eSrc);

  const keyhint = document.createElement("div");
  keyhint.className = "keyhint";
  const kbd1 = document.createElement("kbd");
  kbd1.textContent = "⌘⇧D";
  const kbd2 = document.createElement("kbd");
  kbd2.textContent = "⌘⇧R";
  keyhint.append("trigger ", kbd1, " · reset ", kbd2);

  layer.append(hud, scanline, brackets, slam, wire, endcard, keyhint);
  shadow.appendChild(layer);

  // --- State machine ---
  const setOn = (el, on) => el.classList.toggle("on", !!on);

  function setPhase(p) {
    state.phase = p;
    chrome.runtime
      .sendMessage({ type: "CINEMATIC_PHASE", phase: p })
      .catch(() => {});
  }

  const state = { phase: "idle", evidenceCount: 0, verdict: null };

  function reset() {
    [hud, scanline, brackets, slam, wire, endcard].forEach((el) =>
      setOn(el, false),
    );
    brackets.classList.remove("detected");
    wire.classList.remove("frozen");
    wireState.textContent = "T−04:32";
    hudVerdict.textContent = "INTERLOCK · SCANNING";
    hudStamp.textContent = "0/6 detectors";
    state.evidenceCount = 0;
    state.verdict = null;
    setPhase("idle");
  }

  async function fire() {
    if (state.phase !== "idle" && state.phase !== "resolved") return;
    reset();

    // Beat 1 — scanning starts
    setPhase("scanning");
    setOn(hud, true);
    setOn(scanline, true);
    setOn(brackets, true);

    // Open side panel (auto)
    chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" }).catch(() => {});

    // Detectors count up
    for (let i = 1; i <= 6; i++) {
      await sleep(420);
      state.evidenceCount = i;
      hudStamp.textContent = `${i}/6 detectors`;
      chrome.runtime
        .sendMessage({ type: "CINEMATIC_PROGRESS", evidence: i })
        .catch(() => {});
    }

    // Beat 2 — verdict + slam
    await sleep(220);
    state.verdict = "SYNTHETIC";
    hudVerdict.textContent = "INTERLOCK · SYNTHETIC";
    hudStamp.textContent = "6/6 detectors";
    brackets.classList.add("detected");
    setPhase("verdict");

    setOn(slam, true);
    chrome.runtime.sendMessage({ type: "PLAY_SOUND", id: "slam" }).catch(() => {});
    await sleep(900);
    setOn(slam, false);

    // Beat 3 — wire pill appears amber, side panel awaits approve
    setOn(wire, true);
    setPhase("awaiting_approval");

    // Countdown for ~6 seconds while operator decides; then auto-approve
    let t = 272;
    const timer = setInterval(() => {
      t = Math.max(0, t - 1);
      const m = Math.floor(t / 60)
        .toString()
        .padStart(2, "0");
      const s = (t % 60).toString().padStart(2, "0");
      wireState.textContent = `T−${m}:${s}`;
    }, 1000);

    await sleep(4500);

    // Beat 4 — executing (containment)
    clearInterval(timer);
    setPhase("executing");
    await sleep(2200);

    // Beat 5 — frozen
    wire.classList.add("frozen");
    wireState.textContent = "● Frozen";
    setPhase("frozen");
    chrome.runtime.sendMessage({ type: "PLAY_SOUND", id: "freeze" }).catch(() => {});

    await sleep(1800);

    // Beat 6 — end card
    setOn(endcard, true);
    setPhase("resolved");
    chrome.runtime.sendMessage({ type: "PLAY_SOUND", id: "chime" }).catch(() => {});
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // --- Audio (Web Audio API in the page world; no external files) ---
  let audioCtx = null;
  function ctx() {
    if (audioCtx) return audioCtx;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return audioCtx;
    } catch {
      return null;
    }
  }
  function tone(freq, durMs, opts = {}) {
    const c = ctx();
    if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = opts.type || "sine";
    osc.frequency.setValueAtTime(freq, c.currentTime);
    const peak = opts.gain ?? 0.18;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(peak, c.currentTime + 0.01);
    g.gain.linearRampToValueAtTime(0, c.currentTime + durMs / 1000);
    osc.connect(g).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + durMs / 1000 + 0.05);
  }
  function playSlam() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        tone(800, 180, { type: "square", gain: 0.22 });
        setTimeout(() => tone(600, 120, { type: "square", gain: 0.18 }), 200);
      }, i * 380);
    }
  }
  function playFreeze() {
    const c = ctx();
    if (!c) return;
    tone(60, 350, { type: "square", gain: 0.34 });
    tone(120, 350, { type: "sine", gain: 0.22 });
    try {
      const buf = c.createBuffer(1, c.sampleRate * 0.15, c.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < ch.length; i++) {
        ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length) * 0.18;
      }
      const src = c.createBufferSource();
      src.buffer = buf;
      src.connect(c.destination);
      src.start();
    } catch {
      /* ignore */
    }
  }
  function playChime() {
    [523.25, 659.25, 783.99].forEach((f, i) => {
      setTimeout(() => tone(f, 320, { type: "sine", gain: 0.15 }), i * 110);
    });
  }
  // Routed by sendMessage from the state machine.
  const SOUNDS = { slam: playSlam, freeze: playFreeze, chime: playChime };

  // Override the chrome.runtime PLAY_SOUND dispatcher to play locally.
  const originalSend = chrome.runtime.sendMessage.bind(chrome.runtime);
  chrome.runtime.sendMessage = (msg, ...rest) => {
    if (msg && msg.type === "PLAY_SOUND" && SOUNDS[msg.id]) {
      try {
        SOUNDS[msg.id]();
      } catch {}
    }
    return originalSend(msg, ...rest);
  };

  // Hotkeys
  window.addEventListener("keydown", (e) => {
    if (!e.metaKey || !e.shiftKey) return;
    if (e.key === "D" || e.key === "d") {
      e.preventDefault();
      fire();
    } else if (e.key === "R" || e.key === "r") {
      e.preventDefault();
      reset();
    }
  });

  // Auto-fire: 12 seconds after a conference URL on any supported platform.
  let autoFireScheduled = false;
  function checkAutoFire() {
    const host = location.hostname;
    const path = location.pathname;
    const onActiveCall =
      (host === "meet.google.com" &&
        /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(path)) ||
      (host === "teams.microsoft.com" &&
        /\/meeting\/|\/_#\/modern-calling\//.test(path)) ||
      (host === "teams.live.com" && /\/meet\//.test(path)) ||
      (/\.zoom\.us$/.test(host) && /\/(wc|j)\//.test(path)) ||
      (/webex\.com$/.test(host) && /\/meet\/|\/webappng\/sites\//.test(path)) ||
      host === "app.slack.com" ||
      (host === "discord.com" && /\/channels\//.test(path));
    if (!onActiveCall) return;
    if (autoFireScheduled) return;
    autoFireScheduled = true;
    setTimeout(() => {
      if (state.phase === "idle") fire();
    }, 12_000);
  }
  setInterval(checkAutoFire, 1500);
  checkAutoFire();

  // Allow SW / sidepanel to trigger remotely
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "TRIGGER_CINEMATIC") fire();
    else if (msg.type === "RESET_CINEMATIC") reset();
  });

  console.log("[INTERLOCK] cinematic ready. Press ⌘⇧D to fire, ⌘⇧R to reset.");
})();

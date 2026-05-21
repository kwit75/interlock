/**
 * Synthesized audio cues via Web Audio API — no external files required.
 * Each function creates a brief sound effect and resolves when finished.
 */

let cachedCtx: AudioContext | null = null;
let muted = false;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (muted) return null;
  if (cachedCtx) return cachedCtx;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    cachedCtx = new AC();
    return cachedCtx;
  } catch {
    return null;
  }
}

/**
 * Hard-mute all Web Audio output. Returns the new muted state.
 * Bound to the `M` key in /meet so a noisy venue PA can be silenced fast.
 */
export function toggleAudioMute(): boolean {
  muted = !muted;
  if (muted) {
    try {
      cachedCtx?.suspend();
    } catch {
      /* ignore */
    }
  } else {
    try {
      cachedCtx?.resume();
    } catch {
      /* ignore */
    }
  }
  return muted;
}

export function isAudioMuted(): boolean {
  return muted;
}

function tone(
  freq: number,
  durMs: number,
  opts: { type?: OscillatorType; gain?: number; attack?: number; release?: number } = {},
) {
  const c = ctx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(freq, c.currentTime);
  const attack = opts.attack ?? 0.01;
  const release = opts.release ?? 0.05;
  const peak = opts.gain ?? 0.18;
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(peak, c.currentTime + attack);
  g.gain.linearRampToValueAtTime(
    0,
    c.currentTime + durMs / 1000 - release > 0 ? durMs / 1000 - release : durMs / 1000,
  );
  osc.connect(g).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + durMs / 1000 + 0.05);
}

export function playPhoneRing() {
  const c = ctx();
  if (!c) return;
  // Classic phone double-pulse (UK style: 400/450Hz alternating, 1s on)
  const pattern = [0, 100, 200, 300];
  pattern.forEach((delay) => {
    setTimeout(() => {
      tone(440, 100, { type: "sine", gain: 0.12 });
      tone(480, 100, { type: "sine", gain: 0.10 });
    }, delay);
  });
}

export function playDeepfakeAlarm() {
  const c = ctx();
  if (!c) return;
  // Klaxon: 800Hz square wave with rapid amplitude pulses
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      tone(800, 180, { type: "square", gain: 0.22 });
      setTimeout(() => tone(600, 120, { type: "square", gain: 0.18 }), 200);
    }, i * 380);
  }
}

export function playFreezeSlam() {
  const c = ctx();
  if (!c) return;
  // Deep impact: 60Hz square + 120Hz sine + brief noise burst
  tone(60, 350, { type: "square", gain: 0.34, attack: 0.005, release: 0.15 });
  tone(120, 350, { type: "sine", gain: 0.22, attack: 0.005, release: 0.15 });
  // Noise burst
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

export function playResolvedChime() {
  const c = ctx();
  if (!c) return;
  // Major ascending triad: C5 E5 G5
  [523.25, 659.25, 783.99].forEach((f, i) => {
    setTimeout(() => tone(f, 320, { type: "sine", gain: 0.15 }), i * 110);
  });
}

let ambientPlaying = false;
let ambientStop: (() => void) | null = null;

export function startAmbientPulse() {
  if (ambientPlaying) return;
  const c = ctx();
  if (!c) return;
  ambientPlaying = true;
  let interval: ReturnType<typeof setInterval> | null = null;
  // Slow low-frequency pulse every 1.4s
  const pulse = () => {
    if (!ambientPlaying) return;
    tone(110, 220, { type: "sine", gain: 0.04, attack: 0.05, release: 0.1 });
  };
  pulse();
  interval = setInterval(pulse, 1400);
  ambientStop = () => {
    ambientPlaying = false;
    if (interval) clearInterval(interval);
  };
}

export function stopAmbientPulse() {
  if (ambientStop) ambientStop();
  ambientStop = null;
}

/**
 * Anxious opening drone — used by the OpeningHook (act 1).
 *
 * Low 55Hz sine drone (dread) +
 * 40Hz square heartbeat every 1.1s (rising rate) +
 * dissonant 1200Hz minor-second whine that ramps in over 10s +
 * faint white noise hiss.
 *
 * Returns a stop() function. Audio respects the global mute state.
 */
export function playAnxiousDrone(durationMs = 11_000): () => void {
  if (muted) return () => {};
  const c = ctx();
  if (!c) return () => {};

  const startTime = c.currentTime;
  const endTime = startTime + durationMs / 1000;

  // 1. Low drone
  const droneOsc = c.createOscillator();
  const droneGain = c.createGain();
  droneOsc.type = "sine";
  droneOsc.frequency.setValueAtTime(55, startTime);
  droneOsc.frequency.exponentialRampToValueAtTime(70, endTime); // creeps up
  droneGain.gain.setValueAtTime(0, startTime);
  droneGain.gain.linearRampToValueAtTime(0.18, startTime + 1.0);
  droneGain.gain.setValueAtTime(0.18, endTime - 0.3);
  droneGain.gain.linearRampToValueAtTime(0, endTime);
  droneOsc.connect(droneGain).connect(c.destination);
  droneOsc.start(startTime);
  droneOsc.stop(endTime + 0.1);

  // 2. Heartbeat pulse — accelerating
  let beat = 0;
  const heartbeatInterval = setInterval(() => {
    if (c.currentTime >= endTime) {
      clearInterval(heartbeatInterval);
      return;
    }
    // BPM rises from ~55 to ~110 over the duration
    const _progress = Math.min(1, (c.currentTime - startTime) / (durationMs / 1000));
    void _progress;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(38, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(28, c.currentTime + 0.2);
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.16, c.currentTime + 0.02);
    g.gain.linearRampToValueAtTime(0, c.currentTime + 0.22);
    osc.connect(g).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.3);
    beat += 1;
  }, 1100);
  // Heartbeat accelerates: re-schedule with shrinking interval
  let heartbeatBoost: ReturnType<typeof setTimeout> | null = setTimeout(
    function speedUp() {
      clearInterval(heartbeatInterval);
      let intervalMs = 900;
      const id2 = setInterval(() => {
        if (c.currentTime >= endTime) {
          clearInterval(id2);
          return;
        }
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(38, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(28, c.currentTime + 0.18);
        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(0.18, c.currentTime + 0.02);
        g.gain.linearRampToValueAtTime(0, c.currentTime + 0.2);
        osc.connect(g).connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + 0.28);
        intervalMs = Math.max(450, intervalMs - 30);
      }, intervalMs);
    },
    5500,
  );

  // 3. Dissonant whine that ramps in
  const whineOsc = c.createOscillator();
  const whineGain = c.createGain();
  whineOsc.type = "sawtooth";
  whineOsc.frequency.setValueAtTime(1175, startTime); // ~D6
  whineOsc.frequency.exponentialRampToValueAtTime(1240, endTime); // glissando minor-second up
  whineGain.gain.setValueAtTime(0, startTime);
  whineGain.gain.exponentialRampToValueAtTime(0.001, startTime + 3.0);
  whineGain.gain.exponentialRampToValueAtTime(0.04, endTime - 0.8);
  whineGain.gain.linearRampToValueAtTime(0, endTime);
  whineOsc.connect(whineGain).connect(c.destination);
  whineOsc.start(startTime);
  whineOsc.stop(endTime + 0.1);

  // 4. White noise hiss
  let noiseSource: AudioBufferSourceNode | null = null;
  try {
    const bufLen = c.sampleRate * Math.ceil(durationMs / 1000 + 0.5);
    const buf = c.createBuffer(1, bufLen, c.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) ch[i] = (Math.random() * 2 - 1) * 0.05;
    noiseSource = c.createBufferSource();
    noiseSource.buffer = buf;
    const noiseGain = c.createGain();
    noiseGain.gain.setValueAtTime(0, startTime);
    noiseGain.gain.linearRampToValueAtTime(0.6, startTime + 2.0);
    noiseGain.gain.linearRampToValueAtTime(0, endTime);
    noiseSource.connect(noiseGain).connect(c.destination);
    noiseSource.start(startTime);
    noiseSource.stop(endTime + 0.1);
  } catch {
    /* ignore */
  }

  return () => {
    try {
      clearInterval(heartbeatInterval);
      if (heartbeatBoost) clearTimeout(heartbeatBoost);
      heartbeatBoost = null;
      droneOsc.stop();
      whineOsc.stop();
      noiseSource?.stop();
    } catch {
      /* already stopped */
    }
  };
}

/**
 * Synthesized audio cues via Web Audio API — no external files required.
 * Each function creates a brief sound effect and resolves when finished.
 */

let cachedCtx: AudioContext | null = null;
let muted = false;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (muted) return null;
  if (!cachedCtx) {
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      cachedCtx = new AC();
    } catch {
      return null;
    }
  }
  // Chrome / Safari may create the context in "suspended" state until a user
  // gesture has happened. Resume on every call — by the time playAnxiousDrone
  // or playDeepfakeAlarm fires, a keypress or click has already occurred.
  if (cachedCtx.state === "suspended") {
    cachedCtx.resume().catch(() => {
      /* ignore */
    });
  }
  return cachedCtx;
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

/**
 * Per user feedback (2026-05-21): keep only the deepfake siren on the
 * detection moment. Phone ring, ambient pulse, freeze slam, and resolved
 * chime are stubbed to no-ops so the cinematic isn't cluttered with
 * clicks/grunts/thuds. Lyria-generated tracks (anxious + triumphant)
 * carry the emotional arc.
 */
export function playPhoneRing() {
  /* silent — see comment above */
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
  /* silent — Lyria triumphant track lands on END CARD instead */
}

export function playResolvedChime() {
  /* silent — Lyria triumphant track lands on END CARD instead */
}

let ambientPlaying = false;
let ambientStop: (() => void) | null = null;

export function startAmbientPulse() {
  /* silent — Lyria opening track carries the under-detection tension */
}

export function stopAmbientPulse() {
  /* no-op */
}

/**
 * Anxious opening drone — synth fallback for OpeningHook when Lyria's
 * anxious.wav fails to autoplay.
 *
 * Per user feedback (2026-05-21): NO heartbeat thud. The previous version
 * had an accelerating square-wave pulse every 1.1s — that's the boom-boom
 * the user wanted gone. Now: pure atmospheric drone + whine, no rhythm.
 *
 * Returns a stop() function. Audio respects the global mute state.
 */
export function playAnxiousDrone(durationMs = 11_000): () => void {
  if (muted) return () => {};
  const c = ctx();
  if (!c) return () => {};

  const startTime = c.currentTime;
  const endTime = startTime + durationMs / 1000;

  // 1. Sustained low drone — no rhythm
  const droneOsc = c.createOscillator();
  const droneGain = c.createGain();
  droneOsc.type = "sine";
  droneOsc.frequency.setValueAtTime(55, startTime);
  droneOsc.frequency.exponentialRampToValueAtTime(70, endTime);
  droneGain.gain.setValueAtTime(0, startTime);
  droneGain.gain.linearRampToValueAtTime(0.16, startTime + 2.0);
  droneGain.gain.setValueAtTime(0.16, endTime - 0.5);
  droneGain.gain.linearRampToValueAtTime(0, endTime);
  droneOsc.connect(droneGain).connect(c.destination);
  droneOsc.start(startTime);
  droneOsc.stop(endTime + 0.1);

  // 2. Dissonant whine that slowly ramps in — non-rhythmic
  const whineOsc = c.createOscillator();
  const whineGain = c.createGain();
  whineOsc.type = "sawtooth";
  whineOsc.frequency.setValueAtTime(1175, startTime);
  whineOsc.frequency.exponentialRampToValueAtTime(1240, endTime);
  whineGain.gain.setValueAtTime(0, startTime);
  whineGain.gain.exponentialRampToValueAtTime(0.001, startTime + 3.0);
  whineGain.gain.exponentialRampToValueAtTime(0.035, endTime - 0.8);
  whineGain.gain.linearRampToValueAtTime(0, endTime);
  whineOsc.connect(whineGain).connect(c.destination);
  whineOsc.start(startTime);
  whineOsc.stop(endTime + 0.1);

  return () => {
    try {
      droneOsc.stop();
      whineOsc.stop();
    } catch {
      /* already stopped */
    }
  };
}

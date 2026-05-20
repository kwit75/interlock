/**
 * Synthesized audio cues via Web Audio API — no external files required.
 * Each function creates a brief sound effect and resolves when finished.
 */

let cachedCtx: AudioContext | null = null;
function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
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

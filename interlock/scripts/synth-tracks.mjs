// Pure-math PCM synthesis of the demo's two atmospheric tracks.
// No API calls — runs offline, no quota, fully reproducible.
//
//   node scripts/synth-tracks.mjs
//
// Outputs:
//   public/music/anxious.wav     — 30s dark drone + dissonant whine (no rhythm)
//   public/music/triumphant.wav  — 30s warm C-major chord swell (no rhythm)
//
// Both tracks are loop-safe (fade in + fade out aligned for seamless wraparound).

import fs from "node:fs";
import path from "node:path";

const SR = 44100;
const BPS = 16;
const CH = 1;

function wavHeader(dataLen) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + dataLen, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(CH, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE((SR * CH * BPS) / 8, 28);
  h.writeUInt16LE((CH * BPS) / 8, 32);
  h.writeUInt16LE(BPS, 34);
  h.write("data", 36);
  h.writeUInt32LE(dataLen, 40);
  return h;
}

function writeWav(file, samples) {
  const dataBuf = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    dataBuf.writeInt16LE(Math.round(s * 32767), i * 2);
  }
  const header = wavHeader(dataBuf.length);
  fs.writeFileSync(file, Buffer.concat([header, dataBuf]));
  const sec = (samples.length / SR).toFixed(1);
  const kb = ((dataBuf.length + 44) / 1024).toFixed(1);
  console.log(`  ✓ ${file} · ${sec}s · ${kb} KB`);
}

function synthAnxious(seconds) {
  const n = seconds * SR;
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;

    // Low drone — slowly creeps 55Hz → 70Hz
    const droneF = 55 + 15 * (t / seconds);
    const drone = Math.sin(2 * Math.PI * droneF * t);

    // Sub-octave reinforcement for chest-rumble
    const sub = Math.sin(2 * Math.PI * (droneF / 2) * t) * 0.45;

    // Detuned partial for slight movement
    const partial = Math.sin(2 * Math.PI * (droneF * 1.503) * t) * 0.18;

    // Drone envelope: 2s fade in, sustain, 2s fade out — loop-safe
    let droneGain;
    if (t < 2) droneGain = t / 2;
    else if (t > seconds - 2) droneGain = (seconds - t) / 2;
    else droneGain = 1;
    droneGain *= 0.22;

    // Dissonant whine — ramps in after 5s, peaks around middle
    const whineF = 1175 + 65 * Math.sin((Math.PI * t) / seconds);
    const whinePhase = (whineF * t) % 1;
    const whine = 2 * whinePhase - 1; // sawtooth
    let whineGain;
    if (t < 4) whineGain = 0;
    else if (t > seconds - 3) whineGain = Math.max(0, (seconds - t) / 3) * 0.028;
    else whineGain = Math.min(0.028, ((t - 4) / 8) * 0.028);

    samples[i] = (drone + sub + partial) * droneGain * 0.5 + whine * whineGain;
  }
  return samples;
}

function synthTriumphant(seconds) {
  // C-major chord stack — warm strings feel via slight detune chorus
  // C3 130.81 · E3 164.81 · G3 196 · C4 261.63 · E4 329.63 · G4 392
  const voices = [
    [130.81, 1.0],
    [164.81, 0.9],
    [196.0, 0.9],
    [261.63, 0.7],
    [329.63, 0.5],
    [392.0, 0.35],
  ];
  const detune = 1.0042; // ~7 cents
  const n = seconds * SR;
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;

    let val = 0;
    for (const [f, w] of voices) {
      val += Math.sin(2 * Math.PI * f * t) * w;
      val += Math.sin(2 * Math.PI * f * detune * t) * w * 0.6;
    }
    // Normalize across voice count
    val /= voices.length * 1.5;

    // Slow shimmer — high-frequency tremolo for sparkle (very subtle)
    const shimmer =
      Math.sin(2 * Math.PI * 1568 * t) * 0.04 +
      Math.sin(2 * Math.PI * 2093 * t) * 0.025;

    // Envelope: 2.5s swell in, sustain, 3s swell out — loop-safe
    let env;
    if (t < 2.5) env = t / 2.5;
    else if (t > seconds - 3) env = Math.max(0, (seconds - t) / 3);
    else env = 1;

    samples[i] = (val + shimmer) * env * 0.28;
  }
  return samples;
}

const OUT_DIR = path.join(import.meta.dirname, "..", "public", "music");
fs.mkdirSync(OUT_DIR, { recursive: true });

console.log("Synthesizing anxious.wav (30s)…");
writeWav(path.join(OUT_DIR, "anxious.wav"), synthAnxious(30));

console.log("Synthesizing triumphant.wav (30s)…");
writeWav(path.join(OUT_DIR, "triumphant.wav"), synthTriumphant(30));

console.log("\n✓ done");

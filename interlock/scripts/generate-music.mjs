// Generates cinematic music via Google Lyria (lyria-realtime-exp).
// Saves WAV files into public/music/.
//
//   GEMINI_API_KEY=AIza... node scripts/generate-music.mjs

import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error("Set GEMINI_API_KEY env var first.");
  process.exit(1);
}

const OUT_DIR = path.join(import.meta.dirname, "..", "public", "music");
fs.mkdirSync(OUT_DIR, { recursive: true });

const ai = new GoogleGenAI({ apiKey: KEY, apiVersion: "v1alpha" });

const SAMPLE_RATE = 48000;
const CHANNELS = 2;
const BITS_PER_SAMPLE = 16;

function writeWav(filename, pcmBuffers) {
  const dataLen = pcmBuffers.reduce((s, b) => s + b.length, 0);
  if (dataLen === 0) {
    console.warn(`  ! no PCM data for ${filename}`);
    return false;
  }
  const byteRate = (SAMPLE_RATE * CHANNELS * BITS_PER_SAMPLE) / 8;
  const blockAlign = (CHANNELS * BITS_PER_SAMPLE) / 8;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLen, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(CHANNELS, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(BITS_PER_SAMPLE, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLen, 40);
  const out = Buffer.concat([header, ...pcmBuffers]);
  const file = path.join(OUT_DIR, filename);
  fs.writeFileSync(file, out);
  const sec = dataLen / byteRate;
  console.log(`✓ ${file} · ${(out.length / 1024).toFixed(1)} KB · ${sec.toFixed(1)}s`);
  return true;
}

async function captureTrack({ filename, prompts, durationS, config }) {
  console.log(`\n→ Generating "${filename}" — ${durationS}s · prompts:`);
  prompts.forEach((p) => console.log(`   · [${p.weight}] ${p.text}`));

  const chunks = [];
  let mimeType = null;
  let setupAck = false;
  let messageCount = 0;
  let errorMsg = null;

  const session = await ai.live.music.connect({
    model: "models/lyria-realtime-exp",
    callbacks: {
      onmessage: (msg) => {
        messageCount += 1;
        // Log first 3 messages structure for debugging
        if (messageCount <= 3) {
          console.log(`  · msg#${messageCount}:`, JSON.stringify(msg).slice(0, 240));
        }
        if (msg?.setupComplete !== undefined) {
          setupAck = true;
        }
        const audio = msg?.serverContent?.audioChunks;
        if (Array.isArray(audio)) {
          for (const c of audio) {
            if (!mimeType && c.mimeType) {
              mimeType = c.mimeType;
              console.log(`  · audio mime: ${mimeType}`);
            }
            if (c.data) chunks.push(Buffer.from(c.data, "base64"));
          }
        }
        if (msg?.filteredPrompt) {
          console.warn("  ! filtered prompt:", JSON.stringify(msg.filteredPrompt));
        }
      },
      onerror: (e) => {
        errorMsg = e?.message ?? String(e);
        console.warn("  ! error:", errorMsg);
      },
      onclose: (e) => {
        console.log(`  · session closed · code=${e?.code} reason=${e?.reason ?? "—"}`);
      },
    },
  });

  // Wait briefly for the WebSocket to fully open + receive setupComplete
  for (let i = 0; i < 50; i++) {
    if (setupAck) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  if (!setupAck) {
    console.log("  · setupAck never arrived, proceeding anyway");
  } else {
    console.log("  · setup ack received");
  }

  try {
    if (config) {
      await session.setMusicGenerationConfig({ musicGenerationConfig: config });
      console.log("  · config sent");
    }
    await session.setWeightedPrompts({ weightedPrompts: prompts });
    console.log("  · prompts sent");
    session.play();
    console.log("  · PLAY signaled");
  } catch (e) {
    console.error("  ! failed during setup:", e?.message ?? e);
  }

  const startMs = Date.now();
  const targetMs = durationS * 1000;
  while (Date.now() - startMs < targetMs) {
    await new Promise((r) => setTimeout(r, 500));
    const pcmBytes = chunks.reduce((s, b) => s + b.length, 0);
    process.stdout.write(
      `\r  · t=${((Date.now() - startMs) / 1000).toFixed(1)}s · chunks=${chunks.length} · ${(pcmBytes / 1024).toFixed(0)}KB`,
    );
  }
  console.log("");

  try {
    session.stop();
    await new Promise((r) => setTimeout(r, 600));
    session.close();
  } catch (e) {
    console.warn("  ! stop/close error:", e?.message ?? e);
  }

  console.log(`  · messages: ${messageCount} · chunks: ${chunks.length}`);
  if (errorMsg) console.log(`  · error: ${errorMsg}`);
  writeWav(filename, chunks);
}

(async () => {
  await captureTrack({
    filename: "anxious.wav",
    durationS: 28,
    prompts: [
      { text: "dark cinematic underscore tension", weight: 1.5 },
      { text: "ambient low drone bass pad sustained", weight: 1.4 },
      { text: "ethereal swelling pad", weight: 1.0 },
      { text: "dissonant high whine", weight: 0.7 },
    ],
    config: {
      temperature: 1.1,
      guidance: 4.0,
      bpm: 40,
      density: 0.22,
      brightness: 0.25,
    },
  });

  await captureTrack({
    filename: "triumphant.wav",
    durationS: 9,
    prompts: [
      { text: "triumphant cinematic resolution", weight: 1.5 },
      { text: "warm hopeful strings", weight: 1.2 },
      { text: "ascending major triad", weight: 1.0 },
      { text: "satisfying release", weight: 0.7 },
    ],
    config: {
      temperature: 1.0,
      guidance: 5.0,
      bpm: 72,
      density: 0.55,
      brightness: 0.8,
    },
  });

  console.log("\n✓ done");
  process.exit(0);
})().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});

// INTERLOCK · offscreen capture host
// Holds the MediaStream from chrome.tabCapture (service workers cannot),
// chunks it into 1-second WebM segments via MediaRecorder, and reports
// frame counts back to the SW.

let recorder = null;
let stream = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.target !== "offscreen") return;
  if (msg.type === "OFFSCREEN_START") void start(msg.streamId);
  else if (msg.type === "OFFSCREEN_STOP") stop();
});

async function start(streamId) {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
          maxWidth: 854,
          maxHeight: 480,
          maxFrameRate: 12,
        },
      },
    });
    recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 600_000,
    });
    let chunkCount = 0;
    recorder.ondataavailable = async (e) => {
      if (!e.data || e.data.size === 0) return;
      chunkCount += 1;
      // In production, this would be sent to wss://stream.interlock.ai
      // For the local demo, we just log + notify the SW.
      console.log(
        "[INTERLOCK offscreen] chunk",
        chunkCount,
        e.data.size,
        "bytes",
      );
      await chrome.runtime.sendMessage({ type: "FRAME_SENT" }).catch(() => {});
    };
    recorder.start(1000); // 1-second chunks
    console.log("[INTERLOCK offscreen] capture running");
  } catch (err) {
    console.error("[INTERLOCK offscreen] start failed", err);
  }
}

function stop() {
  try {
    if (recorder && recorder.state !== "inactive") recorder.stop();
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    recorder = null;
    console.log("[INTERLOCK offscreen] capture stopped");
  } catch {
    /* ignore */
  }
}

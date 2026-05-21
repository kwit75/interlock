/**
 * Extract a JPEG frame from a playing <video> element via an offscreen canvas.
 * Used by /meet to feed real frames to /api/detect.
 */

export type DetectResponse = {
  verdict: "SYNTHETIC" | "AUTHENTIC" | "INCONCLUSIVE";
  confidence: number;
  celebrity_match: string | null;
  synthesis_artifacts: string[];
  latency_ms: number;
  model: string;
};

let cachedCanvas: HTMLCanvasElement | null = null;
function canvas(): HTMLCanvasElement {
  if (cachedCanvas) return cachedCanvas;
  cachedCanvas = document.createElement("canvas");
  return cachedCanvas;
}

export function sampleFrameAsDataUrl(
  video: HTMLVideoElement,
  maxSize = 480,
): string | null {
  if (!video.videoWidth || !video.videoHeight) return null;
  const c = canvas();
  const aspect = video.videoWidth / video.videoHeight;
  const w = aspect >= 1 ? maxSize : Math.round(maxSize * aspect);
  const h = aspect >= 1 ? Math.round(maxSize / aspect) : maxSize;
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  try {
    ctx.drawImage(video, 0, 0, w, h);
    return c.toDataURL("image/jpeg", 0.78);
  } catch {
    // SecurityError on tainted canvas — won't happen with object URLs
    // or same-origin clips but guard anyway
    return null;
  }
}

export async function detectFrame(
  dataUrl: string,
  signal?: AbortSignal,
): Promise<DetectResponse> {
  const b64 = dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
  const r = await fetch("/api/detect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frame: b64 }),
    signal,
  });
  return (await r.json()) as DetectResponse;
}

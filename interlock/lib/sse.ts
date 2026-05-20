import type { SSEEvent } from "@/lib/types";

export function sseStream(): {
  stream: ReadableStream<Uint8Array>;
  send: (e: SSEEvent) => void;
  close: () => void;
} {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
    cancel() {
      // Client disconnected
    },
  });
  const encoder = new TextEncoder();
  const send = (e: SSEEvent) => {
    const payload = `data: ${JSON.stringify(e)}\n\n`;
    try {
      controller.enqueue(encoder.encode(payload));
    } catch {
      // Stream closed
    }
  };
  const close = () => {
    try {
      controller.close();
    } catch {
      // Already closed
    }
  };
  return { stream, send, close };
}

export function sseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

import { NextRequest } from "next/server";
import { sseManager } from "@/lib/sse/connection-manager";

export const runtime = "nodejs"; // Required for streaming
export const dynamic = "force-dynamic"; // Disable caching

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Create a TransformStream for SSE
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Create controller object for tracking
  const controller = {
    writer,
    lobbyCode: code,
    connectedAt: new Date(),
  };

  // Register connection
  sseManager.addConnection(code, controller);

  // Send initial connection event
  const connectMessage = `event: connected\ndata: ${JSON.stringify({ lobbyCode: code, timestamp: new Date().toISOString() })}\n\n`;
  writer.write(encoder.encode(connectMessage));

  // Handle client disconnect via AbortSignal
  request.signal.addEventListener("abort", () => {
    sseManager.removeConnection(code, controller);
    writer.close().catch(() => {});
  });

  // Heartbeat to keep connection alive (every 30 seconds)
  const heartbeatInterval = setInterval(() => {
    try {
      const heartbeat = `: heartbeat ${new Date().toISOString()}\n\n`;
      writer.write(encoder.encode(heartbeat));
    } catch {
      clearInterval(heartbeatInterval);
      sseManager.removeConnection(code, controller);
    }
  }, 30000);

  // Clean up on stream close
  readable.pipeTo(new WritableStream()).catch(() => {
    clearInterval(heartbeatInterval);
    sseManager.removeConnection(code, controller);
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

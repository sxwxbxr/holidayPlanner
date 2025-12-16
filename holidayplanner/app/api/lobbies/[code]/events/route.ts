import { NextRequest } from "next/server";
import { sseManager } from "@/lib/sse/connection-manager";

export const runtime = "nodejs"; // Required for streaming
export const dynamic = "force-dynamic"; // Disable caching

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const encoder = new TextEncoder();

  // Create a ReadableStream that we control
  const stream = new ReadableStream({
    start(controller) {
      // Create a writer wrapper for the connection manager
      const writerWrapper = {
        write: (data: Uint8Array) => {
          try {
            controller.enqueue(data);
          } catch {
            // Stream closed
          }
        },
      };

      // Create controller object for tracking
      const connectionController = {
        writer: writerWrapper as unknown as WritableStreamDefaultWriter<Uint8Array>,
        lobbyCode: code,
        connectedAt: new Date(),
      };

      // Register connection
      sseManager.addConnection(code, connectionController);

      // Send initial connection event
      const connectMessage = `event: connected\ndata: ${JSON.stringify({ lobbyCode: code, timestamp: new Date().toISOString() })}\n\n`;
      controller.enqueue(encoder.encode(connectMessage));

      // Heartbeat to keep connection alive (every 30 seconds)
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `: heartbeat ${new Date().toISOString()}\n\n`;
          controller.enqueue(encoder.encode(heartbeat));
        } catch {
          clearInterval(heartbeatInterval);
          sseManager.removeConnection(code, connectionController);
        }
      }, 30000);

      // Handle client disconnect via AbortSignal
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        sseManager.removeConnection(code, connectionController);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}

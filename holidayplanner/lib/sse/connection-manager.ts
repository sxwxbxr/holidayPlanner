// SSE Connection Manager
// In-memory connection tracking per lobby
// Maps lobbyCode -> Set of response controllers

type ConnectionController = {
  writer: WritableStreamDefaultWriter<Uint8Array>;
  lobbyCode: string;
  connectedAt: Date;
};

class SSEConnectionManager {
  private connections: Map<string, Set<ConnectionController>> = new Map();

  addConnection(lobbyCode: string, controller: ConnectionController): void {
    if (!this.connections.has(lobbyCode)) {
      this.connections.set(lobbyCode, new Set());
    }
    this.connections.get(lobbyCode)!.add(controller);
    console.log(`[SSE] Client connected to lobby ${lobbyCode}. Total connections: ${this.getConnectionCount(lobbyCode)}`);
  }

  removeConnection(lobbyCode: string, controller: ConnectionController): void {
    const lobbyConnections = this.connections.get(lobbyCode);
    if (lobbyConnections) {
      lobbyConnections.delete(controller);
      console.log(`[SSE] Client disconnected from lobby ${lobbyCode}. Remaining: ${lobbyConnections.size}`);
      if (lobbyConnections.size === 0) {
        this.connections.delete(lobbyCode);
      }
    }
  }

  broadcast(lobbyCode: string, event: { type: string; data?: unknown }): void {
    const lobbyConnections = this.connections.get(lobbyCode);
    if (!lobbyConnections || lobbyConnections.size === 0) {
      console.log(`[SSE] No clients connected to lobby ${lobbyCode}, skipping broadcast`);
      return;
    }

    const message = `event: ${event.type}\ndata: ${JSON.stringify(event.data || {})}\n\n`;
    const encoder = new TextEncoder();
    const encoded = encoder.encode(message);

    console.log(`[SSE] Broadcasting "${event.type}" to ${lobbyConnections.size} clients in lobby ${lobbyCode}`);

    const toRemove: ConnectionController[] = [];

    for (const controller of lobbyConnections) {
      try {
        controller.writer.write(encoded);
      } catch {
        // Connection closed, mark for removal
        toRemove.push(controller);
      }
    }

    // Clean up dead connections
    for (const controller of toRemove) {
      this.removeConnection(lobbyCode, controller);
    }
  }

  getConnectionCount(lobbyCode: string): number {
    return this.connections.get(lobbyCode)?.size || 0;
  }

  getTotalConnections(): number {
    let total = 0;
    for (const connections of this.connections.values()) {
      total += connections.size;
    }
    return total;
  }
}

// Singleton instance - persists across API route invocations in same process
export const sseManager = new SSEConnectionManager();

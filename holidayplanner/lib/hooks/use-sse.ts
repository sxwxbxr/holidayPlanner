"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export type SSEStatus = "connecting" | "connected" | "disconnected" | "error";

interface UseSSEOptions {
  onEvent?: (event: { type: string; data: unknown }) => void;
  onRefresh?: () => void;
}

export function useSSE(lobbyCode: string | null, options: UseSSEOptions = {}) {
  const { onEvent, onRefresh } = options;
  const [status, setStatus] = useState<SSEStatus>("disconnected");
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!lobbyCode) return;

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStatus("connecting");
    const eventSource = new EventSource(`/api/lobbies/${lobbyCode}/events`);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("connected", () => {
      setStatus("connected");
      // Clear any pending reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    // Listen for refresh events (triggered by CRUD operations)
    eventSource.addEventListener("refresh", (e) => {
      const data = JSON.parse(e.data);
      onEvent?.({ type: "refresh", data });
      onRefresh?.();
    });

    // Specific event types for time blocks
    eventSource.addEventListener("block-added", (e) => {
      const data = JSON.parse(e.data);
      onEvent?.({ type: "block-added", data });
      onRefresh?.();
    });

    eventSource.addEventListener("block-updated", (e) => {
      const data = JSON.parse(e.data);
      onEvent?.({ type: "block-updated", data });
      onRefresh?.();
    });

    eventSource.addEventListener("block-deleted", (e) => {
      const data = JSON.parse(e.data);
      onEvent?.({ type: "block-deleted", data });
      onRefresh?.();
    });

    // User events
    eventSource.addEventListener("user-joined", (e) => {
      const data = JSON.parse(e.data);
      onEvent?.({ type: "user-joined", data });
      onRefresh?.();
    });

    eventSource.addEventListener("user-left", (e) => {
      const data = JSON.parse(e.data);
      onEvent?.({ type: "user-left", data });
      onRefresh?.();
    });

    eventSource.onerror = () => {
      setStatus("error");
      eventSource.close();

      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
  }, [lobbyCode, onEvent, onRefresh]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { status, reconnect: connect, disconnect };
}

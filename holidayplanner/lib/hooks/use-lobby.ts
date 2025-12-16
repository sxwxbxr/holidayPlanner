"use client";

import useSWR from "swr";
import { useLobbyStore, useNotificationsStore } from "@/store";
import { useEffect, useCallback } from "react";
import { useSSE, type SSEStatus } from "./use-sse";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useLobby(lobbyCode: string | null) {
  const { setLobby } = useLobbyStore();
  const { addNotification } = useNotificationsStore();

  // Fetch lobby data (no polling - SSE handles updates)
  const { data, error, isLoading, mutate } = useSWR(
    lobbyCode ? `/api/lobbies/${lobbyCode}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // SSE connection for real-time updates
  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const { status: sseStatus } = useSSE(lobbyCode, {
    onRefresh: handleRefresh,
  });

  // Update store when data changes
  useEffect(() => {
    if (data && !data.error) {
      setLobby(data);
    } else if (data?.error) {
      addNotification("error", "Lobby not found");
    }
  }, [data, setLobby, addNotification]);

  const createLobby = async () => {
    try {
      const res = await fetch("/api/lobbies", {
        method: "POST",
      });
      const result = await res.json();
      return result.code;
    } catch (error) {
      addNotification("error", "Failed to create lobby");
      return null;
    }
  };

  const joinLobby = async (userId: string, name: string, color: string) => {
    if (!lobbyCode) return null;

    try {
      const res = await fetch(`/api/lobbies/${lobbyCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, name, color }),
      });
      const result = await res.json();
      mutate(); // Refresh data
      return result.userCode || null;
    } catch (error) {
      addNotification("error", "Failed to join lobby");
      return null;
    }
  };

  const linkDevice = async (userCode: string) => {
    if (!lobbyCode) return null;

    try {
      const res = await fetch(`/api/lobbies/${lobbyCode}/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCode }),
      });
      const result = await res.json();

      if (result.error) {
        addNotification("error", result.error);
        return null;
      }

      mutate(); // Refresh data
      return result.user;
    } catch (error) {
      addNotification("error", "Failed to link device");
      return null;
    }
  };

  const addBlock = async (block: {
    id: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    blockType?: string;
    isAllDay?: boolean;
    title?: string;
    description?: string;
  }): Promise<boolean> => {
    if (!lobbyCode) return false;

    // Create the new block object for optimistic update
    const newBlock = {
      id: block.id,
      userId: block.userId,
      startTime: block.startTime.toISOString(),
      endTime: block.endTime.toISOString(),
      blockType: block.blockType || "available",
      isAllDay: block.isAllDay || false,
      title: block.title,
      description: block.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Optimistically add the block to the UI immediately
      mutate(
        (currentData: typeof data) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            timeBlocks: [...currentData.timeBlocks, newBlock],
          };
        },
        false // Don't revalidate yet
      );

      const res = await fetch(`/api/lobbies/${lobbyCode}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBlock),
      });

      if (res.ok) {
        // Revalidate to ensure consistency with server
        mutate();
        return true;
      } else {
        // Revert optimistic update on failure
        mutate();
        const error = await res.json().catch(() => ({}));
        console.error("Failed to add time block:", error);
        addNotification("error", "Failed to add time block");
        return false;
      }
    } catch (error) {
      // Revert optimistic update on error
      mutate();
      console.error("Error adding time block:", error);
      addNotification("error", "Failed to add time block");
      return false;
    }
  };

  const updateBlock = async (
    blockId: string,
    updates: {
      startTime: Date;
      endTime: Date;
      blockType?: string;
      isAllDay?: boolean;
      title?: string;
      description?: string;
    }
  ): Promise<boolean> => {
    if (!lobbyCode) return false;

    try {
      // Convert dates to ISO strings for proper JSON serialization
      const payload = {
        ...updates,
        startTime: updates.startTime.toISOString(),
        endTime: updates.endTime.toISOString(),
      };

      const res = await fetch(`/api/lobbies/${lobbyCode}/blocks/${blockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        mutate(); // Refresh data (don't await to prevent blocking)
        return true;
      } else {
        const error = await res.json().catch(() => ({}));
        console.error("Failed to update time block:", error);
        addNotification("error", "Failed to update time block");
        return false;
      }
    } catch (error) {
      console.error("Error updating time block:", error);
      addNotification("error", "Failed to update time block");
      return false;
    }
  };

  const deleteBlock = async (blockId: string): Promise<boolean> => {
    if (!lobbyCode) return false;

    try {
      // Optimistically update the UI by removing the block immediately
      mutate(
        (currentData: typeof data) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            timeBlocks: currentData.timeBlocks.filter((b: { id: string }) => b.id !== blockId),
          };
        },
        false // Don't revalidate yet
      );

      const res = await fetch(`/api/lobbies/${lobbyCode}/blocks/${blockId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Revalidate to ensure consistency with server
        mutate();
        return true;
      } else {
        // Revert optimistic update on failure
        mutate();
        addNotification("error", "Failed to delete time block");
        return false;
      }
    } catch (error) {
      // Revert optimistic update on error
      mutate();
      addNotification("error", "Failed to delete time block");
      return false;
    }
  };

  const leaveLobby = async (userId: string) => {
    if (!lobbyCode) return;

    try {
      await fetch(`/api/lobbies/${lobbyCode}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      mutate(); // Refresh data
      return true;
    } catch (error) {
      addNotification("error", "Failed to leave lobby");
      return false;
    }
  };

  return {
    lobby: data,
    isLoading,
    error,
    sseStatus,
    createLobby,
    joinLobby,
    linkDevice,
    leaveLobby,
    addBlock,
    updateBlock,
    deleteBlock,
    refresh: mutate,
  };
}

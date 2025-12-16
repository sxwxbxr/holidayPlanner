"use client";

import useSWR from "swr";
import { useLobbyStore, useNotificationsStore } from "@/store";
import { useEffect } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useLobby(lobbyCode: string | null) {
  const { setLobby } = useLobbyStore();
  const { addNotification } = useNotificationsStore();

  // Poll every 3 seconds
  const { data, error, isLoading, mutate } = useSWR(
    lobbyCode ? `/api/lobbies/${lobbyCode}` : null,
    fetcher,
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

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
  }) => {
    if (!lobbyCode) return;

    try {
      const res = await fetch(`/api/lobbies/${lobbyCode}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(block),
      });
      if (res.ok) {
        await mutate(); // Refresh data immediately and wait for it
      }
    } catch (error) {
      addNotification("error", "Failed to add time block");
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
  ) => {
    if (!lobbyCode) return;

    try {
      const res = await fetch(`/api/lobbies/${lobbyCode}/blocks/${blockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await mutate(); // Refresh data immediately and wait for it
      }
    } catch (error) {
      addNotification("error", "Failed to update time block");
    }
  };

  const deleteBlock = async (blockId: string) => {
    if (!lobbyCode) return;

    try {
      const res = await fetch(`/api/lobbies/${lobbyCode}/blocks/${blockId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await mutate(); // Refresh data immediately and wait for it
      }
    } catch (error) {
      addNotification("error", "Failed to delete time block");
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

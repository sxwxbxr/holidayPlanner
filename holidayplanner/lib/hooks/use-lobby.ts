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
    if (!lobbyCode) return;

    try {
      await fetch(`/api/lobbies/${lobbyCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, name, color }),
      });
      mutate(); // Refresh data
    } catch (error) {
      addNotification("error", "Failed to join lobby");
    }
  };

  const addBlock = async (block: {
    id: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    title?: string;
    description?: string;
  }) => {
    if (!lobbyCode) return;

    try {
      await fetch(`/api/lobbies/${lobbyCode}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(block),
      });
      mutate(); // Refresh data immediately
    } catch (error) {
      addNotification("error", "Failed to add availability");
    }
  };

  const updateBlock = async (
    blockId: string,
    updates: {
      startTime: Date;
      endTime: Date;
      title?: string;
      description?: string;
    }
  ) => {
    if (!lobbyCode) return;

    try {
      await fetch(`/api/lobbies/${lobbyCode}/blocks/${blockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      mutate();
    } catch (error) {
      addNotification("error", "Failed to update availability");
    }
  };

  const deleteBlock = async (blockId: string) => {
    if (!lobbyCode) return;

    try {
      await fetch(`/api/lobbies/${lobbyCode}/blocks/${blockId}`, {
        method: "DELETE",
      });
      mutate();
    } catch (error) {
      addNotification("error", "Failed to delete availability");
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
    leaveLobby,
    addBlock,
    updateBlock,
    deleteBlock,
    refresh: mutate,
  };
}

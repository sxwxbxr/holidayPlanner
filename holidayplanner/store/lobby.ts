import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, TimeBlock, Lobby } from "@/types";

interface LobbyState {
  // Current lobby state
  lobby: Lobby | null;
  currentUser: User | null;

  // Actions
  setLobby: (lobby: Lobby) => void;
  setCurrentUser: (user: User) => void;
  updateTimeBlocks: (timeBlocks: TimeBlock[]) => void;
  addTimeBlock: (block: TimeBlock) => void;
  updateTimeBlock: (block: TimeBlock) => void;
  deleteTimeBlock: (blockId: string) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  clearLobby: () => void;
}

export const useLobbyStore = create<LobbyState>()(
  persist(
    (set) => ({
      lobby: null,
      currentUser: null,

      setLobby: (lobby) => set({ lobby }),

      setCurrentUser: (user) => set({ currentUser: user }),

      updateTimeBlocks: (timeBlocks) =>
        set((state) =>
          state.lobby
            ? { lobby: { ...state.lobby, timeBlocks } }
            : state
        ),

      addTimeBlock: (block) =>
        set((state) =>
          state.lobby
            ? {
                lobby: {
                  ...state.lobby,
                  timeBlocks: [...state.lobby.timeBlocks, block],
                },
              }
            : state
        ),

      updateTimeBlock: (block) =>
        set((state) =>
          state.lobby
            ? {
                lobby: {
                  ...state.lobby,
                  timeBlocks: state.lobby.timeBlocks.map((b) =>
                    b.id === block.id ? block : b
                  ),
                },
              }
            : state
        ),

      deleteTimeBlock: (blockId) =>
        set((state) =>
          state.lobby
            ? {
                lobby: {
                  ...state.lobby,
                  timeBlocks: state.lobby.timeBlocks.filter(
                    (b) => b.id !== blockId
                  ),
                },
              }
            : state
        ),

      addUser: (user) =>
        set((state) => {
          if (!state.lobby) return state;
          const existingUserIndex = state.lobby.users.findIndex(
            (u) => u.id === user.id
          );
          if (existingUserIndex >= 0) {
            // Update existing user
            const users = [...state.lobby.users];
            users[existingUserIndex] = user;
            return { lobby: { ...state.lobby, users } };
          }
          // Add new user
          return {
            lobby: {
              ...state.lobby,
              users: [...state.lobby.users, user],
            },
          };
        }),

      removeUser: (userId) =>
        set((state) =>
          state.lobby
            ? {
                lobby: {
                  ...state.lobby,
                  users: state.lobby.users.filter((u) => u.id !== userId),
                },
              }
            : state
        ),

      clearLobby: () => set({ lobby: null, currentUser: null }),
    }),
    { name: "lobby-store" }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, TimeBlock, Lobby } from "@/types";

interface LobbyState {
  // Current lobby state
  lobby: Lobby | null;
  currentUser: User | null;
  // Remember user identity per lobby to prevent duplicates on rejoin
  usersByLobby: Record<string, User>;

  // Actions
  setLobby: (lobby: Lobby | null) => void;
  setCurrentUser: (user: User | null) => void;
  updateTimeBlocks: (timeBlocks: TimeBlock[]) => void;
  addTimeBlock: (block: TimeBlock) => void;
  updateTimeBlock: (block: TimeBlock) => void;
  deleteTimeBlock: (blockId: string) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  clearLobby: () => void;
  // User session management
  setUserForLobby: (lobbyCode: string, user: User) => void;
  getUserForLobby: (lobbyCode: string) => User | null;
  clearUserForLobby: (lobbyCode: string) => void;
}

export const useLobbyStore = create<LobbyState>()(
  persist(
    (set, get) => ({
      lobby: null,
      currentUser: null,
      usersByLobby: {},

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

      setUserForLobby: (lobbyCode, user) =>
        set((state) => ({
          usersByLobby: { ...state.usersByLobby, [lobbyCode]: user },
        })),

      getUserForLobby: (lobbyCode) => get().usersByLobby[lobbyCode] || null,

      clearUserForLobby: (lobbyCode) =>
        set((state) => {
          const { [lobbyCode]: _, ...rest } = state.usersByLobby;
          return { usersByLobby: rest };
        }),
    }),
    { name: "lobby-store" }
  )
);

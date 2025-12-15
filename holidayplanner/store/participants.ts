import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Participant,
  CreateParticipantInput,
  UpdateParticipantInput,
  UUID,
} from "@/types";

interface ParticipantsState {
  participants: Participant[];

  // Actions
  addParticipant: (input: CreateParticipantInput) => Participant;
  updateParticipant: (id: UUID, input: UpdateParticipantInput) => void;
  deleteParticipant: (id: UUID) => void;
  getParticipantById: (id: UUID) => Participant | undefined;
  getParticipantsByIds: (ids: UUID[]) => Participant[];
}

export const useParticipantsStore = create<ParticipantsState>()(
  persist(
    (set, get) => ({
      participants: [],

      addParticipant: (input) => {
        const now = new Date();
        const newParticipant: Participant = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          participants: [...state.participants, newParticipant],
        }));
        return newParticipant;
      },

      updateParticipant: (id, input) => {
        set((state) => ({
          participants: state.participants.map((p) =>
            p.id === id ? { ...p, ...input, updatedAt: new Date() } : p
          ),
        }));
      },

      deleteParticipant: (id) => {
        set((state) => ({
          participants: state.participants.filter((p) => p.id !== id),
        }));
      },

      getParticipantById: (id) => {
        return get().participants.find((p) => p.id === id);
      },

      getParticipantsByIds: (ids) => {
        return get().participants.filter((p) => ids.includes(p.id));
      },
    }),
    { name: "holiday-planner-participants" }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Trip, CreateTripInput, UpdateTripInput, UUID } from "@/types";

interface TripsState {
  trips: Trip[];
  selectedTripId: UUID | null;

  // Actions
  addTrip: (input: CreateTripInput) => Trip;
  updateTrip: (id: UUID, input: UpdateTripInput) => void;
  deleteTrip: (id: UUID) => void;
  selectTrip: (id: UUID | null) => void;
  getTripById: (id: UUID) => Trip | undefined;
  getTripsForDateRange: (start: Date, end: Date) => Trip[];
  addParticipantToTrip: (tripId: UUID, participantId: UUID) => void;
  removeParticipantFromTrip: (tripId: UUID, participantId: UUID) => void;
}

export const useTripsStore = create<TripsState>()(
  persist(
    (set, get) => ({
      trips: [],
      selectedTripId: null,

      addTrip: (input) => {
        const now = new Date();
        const newTrip: Trip = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ trips: [...state.trips, newTrip] }));
        return newTrip;
      },

      updateTrip: (id, input) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === id
              ? { ...trip, ...input, updatedAt: new Date() }
              : trip
          ),
        }));
      },

      deleteTrip: (id) => {
        set((state) => ({
          trips: state.trips.filter((trip) => trip.id !== id),
          selectedTripId: state.selectedTripId === id ? null : state.selectedTripId,
        }));
      },

      selectTrip: (id) => set({ selectedTripId: id }),

      getTripById: (id) => get().trips.find((trip) => trip.id === id),

      getTripsForDateRange: (start, end) => {
        return get().trips.filter((trip) => {
          const tripStart = new Date(trip.startDate);
          const tripEnd = new Date(trip.endDate);
          return tripStart <= end && tripEnd >= start;
        });
      },

      addParticipantToTrip: (tripId, participantId) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId && !trip.participantIds.includes(participantId)
              ? {
                  ...trip,
                  participantIds: [...trip.participantIds, participantId],
                  updatedAt: new Date(),
                }
              : trip
          ),
        }));
      },

      removeParticipantFromTrip: (tripId, participantId) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  participantIds: trip.participantIds.filter(
                    (id) => id !== participantId
                  ),
                  updatedAt: new Date(),
                }
              : trip
          ),
        }));
      },
    }),
    { name: "holiday-planner-trips" }
  )
);

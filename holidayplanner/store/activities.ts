import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Activity,
  CreateActivityInput,
  UpdateActivityInput,
  UUID,
} from "@/types";

interface ActivitiesState {
  activities: Activity[];

  // Actions
  addActivity: (input: CreateActivityInput) => Activity;
  updateActivity: (id: UUID, input: UpdateActivityInput) => void;
  deleteActivity: (id: UUID) => void;
  getActivityById: (id: UUID) => Activity | undefined;
  getActivitiesByTripId: (tripId: UUID) => Activity[];
  deleteActivitiesByTripId: (tripId: UUID) => void;
}

export const useActivitiesStore = create<ActivitiesState>()(
  persist(
    (set, get) => ({
      activities: [],

      addActivity: (input) => {
        const now = new Date();
        const newActivity: Activity = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          activities: [...state.activities, newActivity],
        }));
        return newActivity;
      },

      updateActivity: (id, input) => {
        set((state) => ({
          activities: state.activities.map((activity) =>
            activity.id === id
              ? { ...activity, ...input, updatedAt: new Date() }
              : activity
          ),
        }));
      },

      deleteActivity: (id) => {
        set((state) => ({
          activities: state.activities.filter((activity) => activity.id !== id),
        }));
      },

      getActivityById: (id) => {
        return get().activities.find((activity) => activity.id === id);
      },

      getActivitiesByTripId: (tripId) => {
        return get()
          .activities.filter((activity) => activity.tripId === tripId)
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
      },

      deleteActivitiesByTripId: (tripId) => {
        set((state) => ({
          activities: state.activities.filter(
            (activity) => activity.tripId !== tripId
          ),
        }));
      },
    }),
    { name: "holiday-planner-activities" }
  )
);

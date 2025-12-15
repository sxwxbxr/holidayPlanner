import { create } from "zustand";
import { Notification, NotificationType, UUID } from "@/types";

interface NotificationsState {
  notifications: Notification[];
  addNotification: (
    type: NotificationType,
    title: string,
    message?: string,
    duration?: number
  ) => void;
  removeNotification: (id: UUID) => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],

  addNotification: (type, title, message, duration = 5000) => {
    const id = crypto.randomUUID();
    const newNotification: Notification = {
      id,
      type,
      title,
      message,
      duration,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after duration (unless duration is 0)
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => set({ notifications: [] }),
}));

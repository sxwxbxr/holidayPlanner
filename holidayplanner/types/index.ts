// Unique identifier type
export type UUID = string;

// User in a lobby
export interface User {
  id: UUID;
  name: string;
  color: string;
}

// Time block representing availability
export interface TimeBlock {
  id: UUID;
  userId: UUID;
  startTime: Date;
  endTime: Date;
  title?: string; // e.g., "Available to game", "Free to hang"
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Lobby state
export interface Lobby {
  code: string;
  name: string;
  users: User[];
  timeBlocks: TimeBlock[];
  createdAt: Date;
}

// Form types
export type CreateTimeBlockInput = Omit<TimeBlock, "id" | "createdAt" | "updatedAt">;
export type UpdateTimeBlockInput = Partial<CreateTimeBlockInput>;

// Calendar view types
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  timeBlocks: TimeBlock[];
  hasOverlap: boolean; // True if multiple users have blocks on this day
}

// Notification types
export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: UUID;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

// PartyKit message types
export type MessageType =
  | "sync"
  | "user-joined"
  | "user-left"
  | "block-added"
  | "block-updated"
  | "block-deleted";

export interface PartyMessage {
  type: MessageType;
  data?: Lobby | TimeBlock | User;
}

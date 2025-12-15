// Unique identifier type for API-readiness
export type UUID = string;

// Base entity with common fields
export interface BaseEntity {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
}

// Participant/Person model
export interface Participant extends BaseEntity {
  name: string;
  email: string;
  avatarUrl?: string;
  color: string;
}

// Activity categories
export type ActivityCategory =
  | "transport"
  | "accommodation"
  | "dining"
  | "sightseeing"
  | "adventure"
  | "relaxation"
  | "other";

// Activity within a trip
export interface Activity extends BaseEntity {
  tripId: UUID;
  title: string;
  description?: string;
  date: Date;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  location?: string;
  assignedParticipantIds: UUID[];
  category: ActivityCategory;
}

// Trip model
export interface Trip extends BaseEntity {
  name: string;
  destination: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  coverImageUrl?: string;
  participantIds: UUID[];
  color: string;
}

// Form types for create/edit operations
export type CreateTripInput = Omit<Trip, keyof BaseEntity>;
export type UpdateTripInput = Partial<CreateTripInput>;

export type CreateActivityInput = Omit<Activity, keyof BaseEntity>;
export type UpdateActivityInput = Partial<CreateActivityInput>;

export type CreateParticipantInput = Omit<Participant, keyof BaseEntity>;
export type UpdateParticipantInput = Partial<CreateParticipantInput>;

// Calendar view types
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  trips: Trip[];
}

// Notification types for UI feedback
export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: UUID;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

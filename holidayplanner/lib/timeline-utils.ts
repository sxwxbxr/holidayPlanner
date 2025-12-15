import { TimeBlock } from "@/types";

export interface TimeSlot {
  start: Date;
  end: Date;
  users: string[]; // User IDs
  isOverlap: boolean;
}

// Convert time to minutes since midnight
function timeToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

// Find all overlapping time periods in a day
export function findOverlappingSlots(blocks: TimeBlock[]): TimeSlot[] {
  if (blocks.length === 0) return [];

  // Create events for start/end times
  interface TimeEvent {
    time: number; // minutes since midnight
    type: "start" | "end";
    userId: string;
  }

  const events: TimeEvent[] = [];

  blocks.forEach((block) => {
    const start = new Date(block.startTime);
    const end = new Date(block.endTime);

    events.push({
      time: timeToMinutes(start),
      type: "start",
      userId: block.userId,
    });

    events.push({
      time: timeToMinutes(end),
      type: "end",
      userId: block.userId,
    });
  });

  // Sort events by time
  events.sort((a, b) => a.time - b.time);

  // Process events to find overlapping periods
  const slots: TimeSlot[] = [];
  const activeUsers = new Set<string>();
  let lastTime: number | null = null;

  events.forEach((event) => {
    // If we have active users and time has changed, create a slot
    if (activeUsers.size > 0 && lastTime !== null && event.time > lastTime) {
      const baseDate = blocks[0] ? new Date(blocks[0].startTime) : new Date();
      const slotStart = new Date(baseDate);
      const slotEnd = new Date(baseDate);

      slotStart.setHours(Math.floor(lastTime / 60), lastTime % 60, 0, 0);
      slotEnd.setHours(Math.floor(event.time / 60), event.time % 60, 0, 0);

      slots.push({
        start: slotStart,
        end: slotEnd,
        users: Array.from(activeUsers),
        isOverlap: activeUsers.size > 1,
      });
    }

    // Update active users
    if (event.type === "start") {
      activeUsers.add(event.userId);
    } else {
      activeUsers.delete(event.userId);
    }

    lastTime = event.time;
  });

  return slots;
}

// Get the earliest and latest times from blocks
export function getTimeRange(blocks: TimeBlock[]): { earliest: Date; latest: Date } {
  if (blocks.length === 0) {
    const now = new Date();
    const earliest = new Date(now);
    earliest.setHours(0, 0, 0, 0);
    const latest = new Date(now);
    latest.setHours(23, 59, 59, 999);
    return { earliest, latest };
  }

  let earliest = new Date(blocks[0].startTime);
  let latest = new Date(blocks[0].endTime);

  blocks.forEach((block) => {
    const start = new Date(block.startTime);
    const end = new Date(block.endTime);

    if (start < earliest) earliest = start;
    if (end > latest) latest = end;
  });

  return { earliest, latest };
}

// Format time range for display
export function formatTimeRange(start: Date, end: Date): string {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return `${formatTime(start)} - ${formatTime(end)}`;
}

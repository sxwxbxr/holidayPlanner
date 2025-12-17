import { TimeBlock } from "@/types";
import { startOfDay, endOfDay } from "date-fns";

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
// targetDay is required to properly handle blocks that cross midnight
export function findOverlappingSlots(blocks: TimeBlock[], targetDay: Date): TimeSlot[] {
  if (blocks.length === 0) return [];

  const dayStart = startOfDay(targetDay);
  const dayEnd = endOfDay(targetDay);

  // Create events for start/end times
  interface TimeEvent {
    time: number; // minutes since midnight
    type: "start" | "end";
    userId: string;
  }

  const events: TimeEvent[] = [];

  blocks.forEach((block) => {
    const blockStart = new Date(block.startTime);
    const blockEnd = new Date(block.endTime);

    // Clamp block times to the target day's boundaries
    // This handles blocks that span multiple days or cross midnight
    const clampedStart = blockStart < dayStart ? dayStart : blockStart;
    const clampedEnd = blockEnd > dayEnd ? dayEnd : blockEnd;

    // Only include if the clamped range is valid (start before end)
    if (clampedStart < clampedEnd) {
      let startMinutes = timeToMinutes(clampedStart);
      let endMinutes = timeToMinutes(clampedEnd);

      // If end is at midnight (00:00) and equals dayEnd, treat as 24:00 (1440 minutes)
      if (endMinutes === 0 && clampedEnd.getTime() === dayEnd.getTime()) {
        endMinutes = 1440; // 24:00
      }
      // If end is at 23:59:59 (end of day), treat as 24:00
      if (clampedEnd.getHours() === 23 && clampedEnd.getMinutes() === 59) {
        endMinutes = 1440;
      }

      events.push({
        time: startMinutes,
        type: "start",
        userId: block.userId,
      });

      events.push({
        time: endMinutes,
        type: "end",
        userId: block.userId,
      });
    }
  });

  // Sort events by time, with "end" events before "start" events at the same time
  // This prevents brief overlaps at exact boundaries
  events.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    return a.type === "end" ? -1 : 1;
  });

  // Process events to find overlapping periods
  const slots: TimeSlot[] = [];
  const activeUsers = new Set<string>();
  let lastTime: number | null = null;

  events.forEach((event) => {
    // If we have active users and time has changed, create a slot
    if (activeUsers.size > 0 && lastTime !== null && event.time > lastTime) {
      const slotStart = new Date(dayStart);
      const slotEnd = new Date(dayStart);

      slotStart.setHours(Math.floor(lastTime / 60), lastTime % 60, 0, 0);
      // Handle 24:00 (midnight end)
      if (event.time >= 1440) {
        slotEnd.setHours(23, 59, 59, 999);
      } else {
        slotEnd.setHours(Math.floor(event.time / 60), event.time % 60, 0, 0);
      }

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

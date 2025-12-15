import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import { Trip, Activity, CalendarDay } from "@/types";

export function formatDateRange(start: Date, end: Date): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (startDate.getFullYear() === endDate.getFullYear()) {
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${format(startDate, "MMM d")} - ${format(endDate, "d, yyyy")}`;
    }
    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  }
  return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
}

export function formatDate(date: Date): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function getCalendarDays(
  year: number,
  month: number,
  trips: Trip[]
): CalendarDay[] {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  return days.map((date) => ({
    date,
    isCurrentMonth: isSameMonth(date, monthStart),
    isToday: isSameDay(date, today),
    trips: trips.filter((trip) =>
      isWithinInterval(date, {
        start: new Date(trip.startDate),
        end: new Date(trip.endDate),
      })
    ),
  }));
}

export function getNextMonth(year: number, month: number): { year: number; month: number } {
  const nextDate = addMonths(new Date(year, month), 1);
  return { year: nextDate.getFullYear(), month: nextDate.getMonth() };
}

export function getPrevMonth(year: number, month: number): { year: number; month: number } {
  const prevDate = subMonths(new Date(year, month), 1);
  return { year: prevDate.getFullYear(), month: prevDate.getMonth() };
}

export function groupActivitiesByDate(
  activities: Activity[]
): Record<string, Activity[]> {
  return activities.reduce(
    (acc, activity) => {
      const dateKey = format(new Date(activity.date), "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(activity);
      return acc;
    },
    {} as Record<string, Activity[]>
  );
}

export function getTripDuration(start: Date, end: Date): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

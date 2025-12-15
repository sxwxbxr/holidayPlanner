"use client";

import { CalendarDay as CalendarDayType } from "@/types";
import { CalendarTripBadge } from "./calendar-trip-badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Trip } from "@/types";

interface CalendarDayProps {
  day: CalendarDayType;
  onTripClick: (trip: Trip) => void;
  onDayClick: (date: Date) => void;
}

export function CalendarDay({ day, onTripClick, onDayClick }: CalendarDayProps) {
  const maxVisibleTrips = 2;
  const visibleTrips = day.trips.slice(0, maxVisibleTrips);
  const hiddenCount = day.trips.length - maxVisibleTrips;

  return (
    <div
      onClick={() => onDayClick(day.date)}
      className={cn(
        "min-h-[100px] p-1.5 border border-border/50 cursor-pointer transition-colors hover:bg-accent/50",
        !day.isCurrentMonth && "bg-muted/30 text-muted-foreground",
        day.isToday && "bg-primary/5 border-primary"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
            day.isToday && "bg-primary text-primary-foreground"
          )}
        >
          {format(day.date, "d")}
        </span>
      </div>
      <div className="space-y-1">
        {visibleTrips.map((trip) => (
          <CalendarTripBadge
            key={trip.id}
            trip={trip}
            onClick={(t) => {
              onTripClick(t);
            }}
          />
        ))}
        {hiddenCount > 0 && (
          <button className="text-xs text-muted-foreground hover:text-foreground">
            +{hiddenCount} more
          </button>
        )}
      </div>
    </div>
  );
}

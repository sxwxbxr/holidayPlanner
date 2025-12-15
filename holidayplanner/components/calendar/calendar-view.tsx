"use client";

import { useState } from "react";
import { CalendarHeader } from "./calendar-header";
import { CalendarDay } from "./calendar-day";
import { useTripsStore } from "@/store";
import { getCalendarDays, getNextMonth, getPrevMonth } from "@/lib/date-utils";
import { Trip } from "@/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarViewProps {
  onTripClick: (trip: Trip) => void;
  onDayClick: (date: Date) => void;
}

export function CalendarView({ onTripClick, onDayClick }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const trips = useTripsStore((state) => state.trips);
  const calendarDays = getCalendarDays(year, month, trips);

  const handlePrevMonth = () => {
    const prev = getPrevMonth(year, month);
    setYear(prev.year);
    setMonth(prev.month);
  };

  const handleNextMonth = () => {
    const next = getNextMonth(year, month);
    setYear(next.year);
    setMonth(next.month);
  };

  const handleToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4">
      <CalendarHeader
        year={year}
        month={month}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => (
          <CalendarDay
            key={index}
            day={day}
            onTripClick={onTripClick}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </div>
  );
}

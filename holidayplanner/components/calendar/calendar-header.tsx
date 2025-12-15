"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  const currentDate = new Date(year, month);

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

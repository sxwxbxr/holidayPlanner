"use client";

import { Trip } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CalendarTripBadgeProps {
  trip: Trip;
  onClick: (trip: Trip) => void;
}

export function CalendarTripBadge({ trip, onClick }: CalendarTripBadgeProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(trip)}
      className={cn(
        "w-full text-left text-xs px-1.5 py-0.5 rounded truncate font-medium",
        "text-white shadow-sm hover:shadow-md transition-shadow"
      )}
      style={{ backgroundColor: trip.color }}
    >
      {trip.name}
    </motion.button>
  );
}

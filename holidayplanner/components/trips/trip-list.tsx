"use client";

import { useTripsStore } from "@/store";
import { TripCard } from "./trip-card";
import { TripDialog } from "./trip-dialog";
import { Trip } from "@/types";
import { Plane } from "lucide-react";

interface TripListProps {
  onTripClick?: (trip: Trip) => void;
}

export function TripList({ onTripClick }: TripListProps) {
  const trips = useTripsStore((state) => state.trips);

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Plane className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          Start planning your next adventure by creating your first trip.
        </p>
        <TripDialog />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          onClick={() => onTripClick?.(trip)}
        />
      ))}
    </div>
  );
}

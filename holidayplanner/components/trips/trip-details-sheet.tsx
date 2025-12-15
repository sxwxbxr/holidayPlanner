"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/animate-ui/components/radix/sheet";
import { useTripsStore, useParticipantsStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateRange, getTripDuration } from "@/lib/date-utils";
import { MapPin, Calendar, Users } from "lucide-react";
import { ParticipantList } from "@/components/participants/participant-list";
import { ActivityList } from "@/components/activities/activity-list";
import { TripDialog } from "./trip-dialog";
import { ActivityDialog } from "@/components/activities/activity-dialog";
import Link from "next/link";

interface TripDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string | null;
}

export function TripDetailsSheet({
  open,
  onOpenChange,
  tripId,
}: TripDetailsSheetProps) {
  const trip = useTripsStore((state) =>
    tripId ? state.getTripById(tripId) : undefined
  );
  const participants = useParticipantsStore((state) =>
    trip ? state.getParticipantsByIds(trip.participantIds) : []
  );

  if (!trip) return null;

  const duration = getTripDuration(trip.startDate, trip.endDate);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: trip.color }}
            />
            <SheetTitle className="text-xl">{trip.name}</SheetTitle>
          </div>
          <SheetDescription className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {trip.destination}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </div>
            <Badge variant="secondary">{duration} days</Badge>
          </div>

          {trip.description && (
            <p className="text-muted-foreground">{trip.description}</p>
          )}

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants ({participants.length})
              </h3>
            </div>
            <ParticipantList tripId={trip.id} />
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Activities</h3>
              <ActivityDialog tripId={trip.id} />
            </div>
            <ActivityList tripId={trip.id} />
          </section>
        </div>

        <SheetFooter>
          <div className="flex gap-2 w-full">
            <TripDialog
              tripId={trip.id}
              trigger={
                <Button variant="outline" className="flex-1">
                  Edit Trip
                </Button>
              }
            />
            <Button asChild className="flex-1">
              <Link href={`/trips/${trip.id}`}>View Full Details</Link>
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

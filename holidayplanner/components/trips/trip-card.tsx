"use client";

import { Trip } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Trash2, Pencil } from "lucide-react";
import { formatDateRange, getTripDuration } from "@/lib/date-utils";
import { useTripsStore, useParticipantsStore, useActivitiesStore, useNotificationsStore } from "@/store";
import { motion } from "framer-motion";
import { TripDialog } from "./trip-dialog";

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const { deleteTrip } = useTripsStore();
  const { deleteActivitiesByTripId } = useActivitiesStore();
  const { getParticipantsByIds } = useParticipantsStore();
  const { addNotification } = useNotificationsStore();

  const participants = getParticipantsByIds(trip.participantIds);
  const duration = getTripDuration(trip.startDate, trip.endDate);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteActivitiesByTripId(trip.id);
    deleteTrip(trip.id);
    addNotification("success", "Trip deleted", `${trip.name} has been removed`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card
        className="cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
        onClick={onClick}
      >
        <div
          className="h-2"
          style={{ backgroundColor: trip.color }}
        />
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{trip.name}</CardTitle>
              <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {trip.destination}
              </div>
            </div>
            <Badge variant="secondary">{duration} days</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateRange(trip.startDate, trip.endDate)}
          </div>

          {trip.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {trip.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {participants.length} {participants.length === 1 ? "person" : "people"}
              </span>
            </div>

            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <TripDialog
                tripId={trip.id}
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

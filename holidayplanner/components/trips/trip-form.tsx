"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTripsStore, useNotificationsStore } from "@/store";
import { getRandomColor, COLORS } from "@/lib/utils";
import { Trip } from "@/types";
import { format } from "date-fns";

interface TripFormProps {
  tripId?: string;
  initialDate?: Date;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TripForm({ tripId, initialDate, onSuccess, onCancel }: TripFormProps) {
  const { addTrip, updateTrip, getTripById } = useTripsStore();
  const { addNotification } = useNotificationsStore();

  const existingTrip = tripId ? getTripById(tripId) : undefined;

  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    description: "",
    startDate: initialDate ? format(initialDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    endDate: initialDate ? format(initialDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    color: getRandomColor(),
  });

  useEffect(() => {
    if (existingTrip) {
      setFormData({
        name: existingTrip.name,
        destination: existingTrip.destination,
        description: existingTrip.description || "",
        startDate: format(new Date(existingTrip.startDate), "yyyy-MM-dd"),
        endDate: format(new Date(existingTrip.endDate), "yyyy-MM-dd"),
        color: existingTrip.color,
      });
    }
  }, [existingTrip]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.destination.trim()) {
      addNotification("error", "Please fill in all required fields");
      return;
    }

    const tripData = {
      name: formData.name.trim(),
      destination: formData.destination.trim(),
      description: formData.description.trim() || undefined,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      color: formData.color,
      participantIds: existingTrip?.participantIds || [],
    };

    if (tripId && existingTrip) {
      updateTrip(tripId, tripData);
      addNotification("success", "Trip updated", `${tripData.name} has been updated`);
    } else {
      addTrip(tripData);
      addNotification("success", "Trip created", `${tripData.name} has been added to your trips`);
    }

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Trip Name *</Label>
        <Input
          id="name"
          placeholder="Summer Vacation"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">Destination *</Label>
        <Input
          id="destination"
          placeholder="Paris, France"
          value={formData.destination}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="A relaxing trip to explore the city..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            min={formData.startDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`w-8 h-8 rounded-full transition-transform ${
                formData.color === color ? "scale-110 ring-2 ring-offset-2 ring-foreground" : ""
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {tripId ? "Update Trip" : "Create Trip"}
        </Button>
      </div>
    </form>
  );
}

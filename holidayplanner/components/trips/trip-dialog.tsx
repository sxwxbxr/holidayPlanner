"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import { TripForm } from "./trip-form";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

interface TripDialogProps {
  tripId?: string;
  initialDate?: Date;
  trigger?: React.ReactNode;
}

export function TripDialog({ tripId, initialDate, trigger }: TripDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!tripId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {isEdit ? (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Trip
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                New Trip
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent from="bottom">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Trip" : "Create New Trip"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your trip details below."
              : "Fill in the details for your new adventure."}
          </DialogDescription>
        </DialogHeader>
        <TripForm
          tripId={tripId}
          initialDate={initialDate}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

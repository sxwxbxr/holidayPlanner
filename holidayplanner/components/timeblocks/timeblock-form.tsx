"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotificationsStore, useLobbyStore } from "@/store";
import { useLobby } from "@/lib/hooks/use-lobby";
import { TimeBlock, BlockType } from "@/types";
import { format, startOfDay, endOfDay } from "date-fns";
import { generateUUID } from "@/lib/utils";
import { Check, X, Calendar } from "lucide-react";

interface TimeBlockFormProps {
  lobbyCode: string;
  blockId?: string;
  initialDate?: Date;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TimeBlockForm({
  lobbyCode,
  blockId,
  initialDate,
  onSuccess,
  onCancel,
}: TimeBlockFormProps) {
  const { addBlock, updateBlock } = useLobby(lobbyCode);
  const { addNotification } = useNotificationsStore();
  const { lobby, currentUser } = useLobbyStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingBlock = blockId
    ? lobby?.timeBlocks.find((b) => b.id === blockId)
    : undefined;

  const [formData, setFormData] = useState({
    startDate: initialDate
      ? format(initialDate, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    endDate: initialDate
      ? format(initialDate, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    startTime: "18:00",
    endTime: "22:00",
    isAllDay: false,
    blockType: "available" as BlockType,
    title: "",
    description: "",
  });

  useEffect(() => {
    if (existingBlock) {
      const startDate = new Date(existingBlock.startTime);
      const endDate = new Date(existingBlock.endTime);
      setFormData({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        startTime: format(startDate, "HH:mm"),
        endTime: format(endDate, "HH:mm"),
        isAllDay: existingBlock.isAllDay || false,
        blockType: existingBlock.blockType || "available",
        title: existingBlock.title || "",
        description: existingBlock.description || "",
      });
    }
  }, [existingBlock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      addNotification("error", "You must be logged in");
      return;
    }

    if (isSubmitting) return; // Prevent double submission

    let startTime: Date;
    let endTime: Date;

    if (formData.isAllDay) {
      // For all-day events, set start to beginning of start date and end to end of end date
      startTime = startOfDay(new Date(formData.startDate));
      endTime = endOfDay(new Date(formData.endDate));

      if (endTime < startTime) {
        addNotification("error", "End date must be on or after start date");
        return;
      }
    } else {
      // Regular time-based blocks
      startTime = new Date(`${formData.startDate}T${formData.startTime}`);
      endTime = new Date(`${formData.startDate}T${formData.endTime}`);

      // If end time is before or equal to start time, assume it's the next day
      if (endTime <= startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }
    }

    setIsSubmitting(true);

    let success = false;

    try {
      if (blockId && existingBlock) {
        success = await updateBlock(blockId, {
          startTime,
          endTime,
          isAllDay: formData.isAllDay,
          blockType: formData.blockType,
          title: formData.title.trim() || undefined,
          description: formData.description.trim() || undefined,
        });
        if (success) {
          addNotification("success", "Time block updated");
        }
      } else {
        success = await addBlock({
          id: generateUUID(),
          userId: currentUser.id,
          startTime,
          endTime,
          isAllDay: formData.isAllDay,
          blockType: formData.blockType,
          title: formData.title.trim() || undefined,
          description: formData.description.trim() || undefined,
        });
        if (success) {
          addNotification("success", "Time block added");
        }
      }
    } catch (error) {
      console.error("Error submitting time block:", error);
      addNotification("error", "Failed to save time block");
    } finally {
      setIsSubmitting(false);
    }

    if (success) {
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Block Type Toggle */}
      <div className="space-y-2">
        <Label>Type</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={formData.blockType === "available" ? "default" : "outline"}
            className={formData.blockType === "available"
              ? "bg-green-600 hover:bg-green-700"
              : ""
            }
            onClick={() => setFormData({ ...formData, blockType: "available" })}
          >
            <Check className="size-4 mr-2" />
            Available
          </Button>
          <Button
            type="button"
            variant={formData.blockType === "busy" ? "default" : "outline"}
            className={formData.blockType === "busy"
              ? "bg-red-600 hover:bg-red-700"
              : ""
            }
            onClick={() => setFormData({ ...formData, blockType: "busy" })}
          >
            <X className="size-4 mr-2" />
            Busy
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {formData.blockType === "available"
            ? "Mark when you're free to meet up"
            : "Mark when you can't meet up"
          }
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title (Optional)</Label>
        <Input
          id="title"
          placeholder={formData.blockType === "available" ? "Free to hang, Available to game..." : "Work, Appointment, School..."}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      {/* All Day Toggle */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="allDay"
          checked={formData.isAllDay}
          onCheckedChange={(checked) => {
            setFormData({
              ...formData,
              isAllDay: checked === true,
              // When toggling to all day, sync end date with start date
              endDate: checked === true ? formData.startDate : formData.endDate,
            });
          }}
        />
        <Label htmlFor="allDay" className="flex items-center gap-2 cursor-pointer">
          <Calendar className="h-4 w-4" />
          All Day / Multiple Days
        </Label>
      </div>

      {formData.isAllDay ? (
        // All Day / Multi-day: Show date range
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => {
                const newStartDate = e.target.value;
                setFormData({
                  ...formData,
                  startDate: newStartDate,
                  // If end date is before new start date, update it
                  endDate: newStartDate > formData.endDate ? newStartDate : formData.endDate,
                });
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
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
      ) : (
        // Regular: Show single date with time range
        <>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                required
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Note (Optional)</Label>
        <Input
          id="description"
          placeholder="Any additional details..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : (blockId ? "Update" : "Add")} {!isSubmitting && "Time Block"}
        </Button>
      </div>
    </form>
  );
}

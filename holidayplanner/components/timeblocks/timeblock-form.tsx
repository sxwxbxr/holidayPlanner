"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotificationsStore, useLobbyStore } from "@/store";
import { useLobby } from "@/lib/hooks/use-lobby";
import { TimeBlock, BlockType } from "@/types";
import { format } from "date-fns";
import { generateUUID } from "@/lib/utils";
import { Check, X } from "lucide-react";

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

  const existingBlock = blockId
    ? lobby?.timeBlocks.find((b) => b.id === blockId)
    : undefined;

  const [formData, setFormData] = useState({
    date: initialDate
      ? format(initialDate, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    startTime: "18:00",
    endTime: "22:00",
    blockType: "available" as BlockType,
    title: "",
    description: "",
  });

  useEffect(() => {
    if (existingBlock) {
      setFormData({
        date: format(new Date(existingBlock.startTime), "yyyy-MM-dd"),
        startTime: format(new Date(existingBlock.startTime), "HH:mm"),
        endTime: format(new Date(existingBlock.endTime), "HH:mm"),
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

    const startTime = new Date(`${formData.date}T${formData.startTime}`);
    const endTime = new Date(`${formData.date}T${formData.endTime}`);

    if (endTime <= startTime) {
      addNotification("error", "End time must be after start time");
      return;
    }

    if (blockId && existingBlock) {
      await updateBlock(blockId, {
        startTime,
        endTime,
        blockType: formData.blockType,
        title: formData.title.trim() || undefined,
        description: formData.description.trim() || undefined,
      });
      addNotification("success", "Time block updated");
    } else {
      await addBlock({
        id: generateUUID(),
        userId: currentUser.id,
        startTime,
        endTime,
        blockType: formData.blockType,
        title: formData.title.trim() || undefined,
        description: formData.description.trim() || undefined,
      });
      addNotification("success", "Time block added");
    }

    onSuccess?.();
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

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {blockId ? "Update" : "Add"} Time Block
        </Button>
      </div>
    </form>
  );
}

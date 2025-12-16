"use client";

import { useState } from "react";
import { TimeBlockForm } from "./timeblock-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import { Plus } from "lucide-react";

interface TimeBlockDialogProps {
  lobbyCode: string;
  blockId?: string;
  initialDate?: Date;
  trigger?: React.ReactNode;
}

export function TimeBlockDialog({
  lobbyCode,
  blockId,
  initialDate,
  trigger,
}: TimeBlockDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="size-4 mr-2" />
            Add Time Block
          </Button>
        )}
      </DialogTrigger>
      <DialogContent from="bottom">
        <DialogHeader>
          <DialogTitle>
            {blockId ? "Edit" : "Add"} Time Block
          </DialogTitle>
        </DialogHeader>
        <TimeBlockForm
          lobbyCode={lobbyCode}
          blockId={blockId}
          initialDate={initialDate}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

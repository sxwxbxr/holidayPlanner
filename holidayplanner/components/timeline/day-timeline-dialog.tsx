"use client";

import { TimeBlock, User } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { findOverlappingSlots, formatTimeRange } from "@/lib/timeline-utils";
import { Clock, Users } from "lucide-react";

interface DayTimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  blocks: TimeBlock[];
  users: User[];
}

export function DayTimelineDialog({
  open,
  onOpenChange,
  date,
  blocks,
  users,
}: DayTimelineDialogProps) {
  const getUserColor = (userId: string) => {
    return users.find((u) => u.id === userId)?.color || "#gray";
  };

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "Unknown";
  };

  // Generate hour slots (6 AM to midnight)
  const hours = Array.from({ length: 19 }, (_, i) => i + 6); // 6 to 24

  // Find overlapping periods
  const overlaps = findOverlappingSlots(blocks).filter((slot) => slot.isOverlap);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" from="bottom">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {format(date, "EEEE, MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overlapping Time Periods */}
          {overlaps.length > 0 && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-green-700 dark:text-green-400" />
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    {overlaps.length} Overlapping Time{overlaps.length > 1 ? "s" : ""}
                  </h3>
                </div>
                <div className="space-y-2">
                  {overlaps.map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white dark:bg-green-950/40 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {slot.users.map((userId) => (
                            <div
                              key={userId}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs ring-2 ring-white dark:ring-gray-900"
                              style={{ backgroundColor: getUserColor(userId) }}
                              title={getUserName(userId)}
                            >
                              {getUserName(userId).charAt(0)}
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="font-medium text-green-900 dark:text-green-100">
                            {formatTimeRange(slot.start, slot.end)}
                          </div>
                          <div className="text-sm text-green-700 dark:text-green-400">
                            {slot.users.map((uid) => getUserName(uid)).join(", ")}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-600 text-white">
                        {slot.users.length} people
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline View */}
          <div>
            <h3 className="font-semibold mb-3">Full Day Timeline</h3>
            <div className="relative border rounded-lg overflow-hidden">
              {/* Hour rows */}
              {hours.map((hour) => {
                const hourDate = new Date(date);
                hourDate.setHours(hour, 0, 0, 0);
                const nextHourDate = new Date(date);
                nextHourDate.setHours(hour + 1, 0, 0, 0);

                // Find blocks in this hour
                const hourBlocks = blocks.filter((block) => {
                  const start = new Date(block.startTime);
                  const end = new Date(block.endTime);
                  return (
                    (start >= hourDate && start < nextHourDate) ||
                    (end > hourDate && end <= nextHourDate) ||
                    (start <= hourDate && end >= nextHourDate)
                  );
                });

                return (
                  <div
                    key={hour}
                    className="flex border-b last:border-b-0 min-h-[60px] hover:bg-accent/50"
                  >
                    {/* Time label */}
                    <div className="w-20 flex-shrink-0 p-3 border-r bg-muted/30 text-sm font-medium text-muted-foreground">
                      {format(hourDate, "h:mm a")}
                    </div>

                    {/* Blocks in this hour */}
                    <div className="flex-1 p-2 relative">
                      {hourBlocks.length > 0 ? (
                        <div className="space-y-1">
                          {hourBlocks.map((block) => (
                            <div
                              key={block.id}
                              className="text-xs p-2 rounded flex items-center gap-2"
                              style={{
                                backgroundColor: getUserColor(block.userId) + "20",
                                borderLeft: `3px solid ${getUserColor(block.userId)}`,
                              }}
                            >
                              <span className="font-medium">
                                {getUserName(block.userId)}
                              </span>
                              <span className="text-muted-foreground">
                                {formatTimeRange(
                                  new Date(block.startTime),
                                  new Date(block.endTime)
                                )}
                              </span>
                              {block.title && (
                                <span className="ml-auto text-muted-foreground">
                                  {block.title}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground italic">
                          No availability
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

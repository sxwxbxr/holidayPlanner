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
import { Button } from "@/components/ui/button";
import { format, isSameDay } from "date-fns";
import { findOverlappingSlots, formatTimeRange } from "@/lib/timeline-utils";
import { Clock, Users, Trash2, Calendar } from "lucide-react";
import { useLobby } from "@/lib/hooks/use-lobby";
import { useLobbyStore, useNotificationsStore } from "@/store";

interface DayTimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  blocks: TimeBlock[];
  users: User[];
  lobbyCode: string;
}

export function DayTimelineDialog({
  open,
  onOpenChange,
  date,
  blocks,
  users,
  lobbyCode,
}: DayTimelineDialogProps) {
  const { currentUser } = useLobbyStore();
  const { deleteBlock } = useLobby(lobbyCode);
  const { addNotification } = useNotificationsStore();

  const getUserColor = (userId: string) => {
    return users.find((u) => u.id === userId)?.color || "#gray";
  };

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "Unknown";
  };

  const handleDelete = async (blockId: string, title: string) => {
    if (confirm(`Delete "${title || 'this time block'}"?`)) {
      const success = await deleteBlock(blockId);
      if (success) {
        addNotification("success", "Time block deleted");
      }
    }
  };

  // Separate all-day blocks from timed blocks
  const allDayBlocks = blocks.filter(b => b.isAllDay);
  const timedBlocks = blocks.filter(b => !b.isAllDay);

  // Filter only available blocks for overlap detection (exclude all-day)
  const availableBlocks = timedBlocks.filter(b => b.blockType !== "busy");

  // Generate hour slots (6 AM to midnight)
  const hours = Array.from({ length: 19 }, (_, i) => i + 6); // 6 to 24

  // Find overlapping periods (only consider available blocks)
  // Pass the date to properly handle blocks that cross midnight
  const overlaps = findOverlappingSlots(availableBlocks, date).filter((slot) => slot.isOverlap);

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

          {/* All-Day Events Section */}
          {allDayBlocks.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                All-Day Events
              </h3>
              <div className="space-y-2">
                {allDayBlocks.map((block) => {
                  const isBusy = block.blockType === "busy";
                  const isMultiDay = !isSameDay(new Date(block.startTime), new Date(block.endTime));
                  const dateRange = isMultiDay
                    ? `${format(new Date(block.startTime), "MMM d")} - ${format(new Date(block.endTime), "MMM d")}`
                    : "All day";

                  return (
                    <div
                      key={block.id}
                      className="p-3 rounded-lg flex items-center gap-3 group"
                      style={{
                        backgroundColor: isBusy ? "#ef444420" : getUserColor(block.userId) + "20",
                        borderLeft: `4px solid ${isBusy ? "#ef4444" : getUserColor(block.userId)}`,
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {isBusy && "❌ "}
                          {getUserName(block.userId)}
                          <Badge variant="secondary" className="text-xs">
                            {dateRange}
                          </Badge>
                        </div>
                        {block.title && (
                          <div className="text-sm text-muted-foreground">{block.title}</div>
                        )}
                      </div>
                      {currentUser?.id === block.userId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(block.id, block.title || (isBusy ? "Busy" : "Available"))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timeline View */}
          <div>
            <h3 className="font-semibold mb-3">Hourly Timeline</h3>
            <div className="relative border rounded-lg overflow-hidden">
              {/* Hour rows */}
              {hours.map((hour) => {
                const hourDate = new Date(date);
                hourDate.setHours(hour, 0, 0, 0);
                const nextHourDate = new Date(date);
                nextHourDate.setHours(hour + 1, 0, 0, 0);

                // Find timed blocks (not all-day) in this hour
                const hourBlocks = timedBlocks.filter((block) => {
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
                          {hourBlocks.map((block) => {
                            const isBusy = block.blockType === "busy";
                            return (
                              <div
                                key={block.id}
                                className="text-xs p-2 rounded flex items-center gap-2 group"
                                style={{
                                  backgroundColor: isBusy
                                    ? "#ef444420"
                                    : getUserColor(block.userId) + "20",
                                  borderLeft: `3px solid ${isBusy ? "#ef4444" : getUserColor(block.userId)}`,
                                }}
                              >
                                <span className="font-medium">
                                  {isBusy && "❌ "}{getUserName(block.userId)}
                                </span>
                                <span className="text-muted-foreground">
                                  {formatTimeRange(
                                    new Date(block.startTime),
                                    new Date(block.endTime)
                                  )}
                                </span>
                                {block.title && (
                                  <span className="text-muted-foreground">
                                    {block.title}
                                  </span>
                                )}
                                {!block.title && (
                                  <span className="text-muted-foreground italic">
                                    {isBusy ? "Busy" : "Available"}
                                  </span>
                                )}
                                {currentUser?.id === block.userId && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="ml-auto h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDelete(block.id, block.title || (isBusy ? "Busy" : "Available"))}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            );
                          })}
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

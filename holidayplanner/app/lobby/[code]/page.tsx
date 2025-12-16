"use client";

import { use, useEffect, useState } from "react";
import { useLobbyStore } from "@/store";
import { useLobby } from "@/lib/hooks/use-lobby";
import { useMounted } from "@/lib/hooks/use-mounted";
import { LobbyInfo } from "@/components/lobby/lobby-info";
import { TimeBlockDialog } from "@/components/timeblocks/timeblock-dialog";
import { DayTimelineDialog } from "@/components/timeline/day-timeline-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, startOfDay, endOfDay, isWithinInterval, max, min } from "date-fns";
import { TimeBlock } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LobbyPageProps {
  params: Promise<{ code: string }>;
}

export default function LobbyPage({ params }: LobbyPageProps) {
  const mounted = useMounted();
  const { code } = use(params);
  const { lobby, currentUser, setUserForLobby, getUserForLobby } = useLobbyStore();
  const { joinLobby, isLoading, sseStatus } = useLobby(code);
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize current month only on client to avoid hydration mismatch
    setCurrentMonth(new Date());
  }, []);

  // Track if we've already joined to prevent re-joining on every render
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    const doJoin = async () => {
      if (currentUser && !hasJoined) {
        setHasJoined(true);
        const userCode = await joinLobby(currentUser.id, currentUser.name, currentUser.color);
        // Store userCode with user data
        if (userCode) {
          setUserForLobby(code, {
            ...currentUser,
            userCode: userCode,
          });
        }
      }
    };
    doJoin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, code, hasJoined]);

  if (!mounted || !currentMonth) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBlocksForDay = (day: Date) => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    return (
      lobby?.timeBlocks.filter((block) => {
        const blockStart = new Date(block.startTime);
        const blockEnd = new Date(block.endTime);

        // For all-day/multi-day blocks: check if the day falls within the block's range
        if (block.isAllDay) {
          return (
            isWithinInterval(dayStart, { start: startOfDay(blockStart), end: endOfDay(blockEnd) }) ||
            isSameDay(blockStart, day) ||
            isSameDay(blockEnd, day)
          );
        }

        // For regular blocks (including overnight): check if the block overlaps with this day
        // A block overlaps with a day if it starts before the day ends AND ends after the day starts
        return blockStart < dayEnd && blockEnd > dayStart;
      }) || []
    );
  };

  const getUserColor = (userId: string) => {
    return lobby?.users.find((u) => u.id === userId)?.color || "#gray";
  };

  const getUserName = (userId: string) => {
    return lobby?.users.find((u) => u.id === userId)?.name || "Unknown";
  };

  // Check if there are overlapping "available" blocks from different users
  const hasOverlappingAvailability = (blocks: TimeBlock[]) => {
    // Filter only available blocks (not busy)
    const availableBlocks = blocks.filter(b => b.blockType !== "busy");

    // Need at least 2 available blocks from different users
    if (availableBlocks.length < 2) return false;

    // Get unique users with available blocks
    const usersWithAvailability = new Set(availableBlocks.map(b => b.userId));
    if (usersWithAvailability.size < 2) return false;

    // Check for actual time overlap between blocks from different users
    for (let i = 0; i < availableBlocks.length; i++) {
      for (let j = i + 1; j < availableBlocks.length; j++) {
        const block1 = availableBlocks[i];
        const block2 = availableBlocks[j];

        // Only check blocks from different users
        if (block1.userId === block2.userId) continue;

        const start1 = new Date(block1.startTime);
        const end1 = new Date(block1.endTime);
        const start2 = new Date(block2.startTime);
        const end2 = new Date(block2.endTime);

        // Check if time ranges overlap
        if (start1 < end2 && start2 < end1) {
          return true;
        }
      }
    }

    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Time Sync</h1>
            {sseStatus === "connected" ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Live
              </Badge>
            ) : sseStatus === "connecting" ? (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Connecting...
              </Badge>
            ) : isLoading ? (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Loading...
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600">
                Reconnecting...
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Mark when you&apos;re available or busy, and find overlapping free time
          </p>
        </div>
        <TimeBlockDialog lobbyCode={code} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() - 1
                      )
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1
                      )
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground p-2"
                  >
                    {day}
                  </div>
                ))}

                {/* Add empty cells for days before the first of the month */}
                {(() => {
                  // getDay returns 0 for Sunday, 1 for Monday, etc.
                  // For Monday-first layout, we need to adjust: Mon=0, Tue=1, ..., Sun=6
                  const firstDayOfWeek = getDay(monthStart);
                  // Convert Sunday-first (0=Sun) to Monday-first (0=Mon)
                  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
                  return Array.from({ length: paddingDays }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-24 p-2" />
                  ));
                })()}

                {days.map((day, index) => {
                  const blocks = getBlocksForDay(day);
                  const hasOverlap = hasOverlappingAvailability(blocks);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={index}
                      onClick={() => blocks.length > 0 && setSelectedDay(day)}
                      className={`min-h-24 p-2 border rounded-md ${
                        isToday ? "bg-primary/5 border-primary" : "bg-card"
                      } ${hasOverlap ? "ring-2 ring-green-500" : ""} ${
                        blocks.length > 0 ? "cursor-pointer hover:bg-accent" : ""
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1">
                        {blocks.slice(0, 3).map((block) => {
                          const isMultiDay = block.isAllDay && !isSameDay(new Date(block.startTime), new Date(block.endTime));
                          const timeDisplay = block.isAllDay
                            ? (isMultiDay
                              ? `${format(new Date(block.startTime), "MMM d")} - ${format(new Date(block.endTime), "MMM d")}`
                              : "All day")
                            : `${format(new Date(block.startTime), "HH:mm")} - ${format(new Date(block.endTime), "HH:mm")}`;

                          return (
                            <div
                              key={block.id}
                              className={`text-xs p-1 rounded truncate ${block.isAllDay ? "font-medium" : ""}`}
                              style={{
                                backgroundColor: block.blockType === "busy"
                                  ? "#ef444420"
                                  : getUserColor(block.userId) + "20",
                                borderLeft: `2px solid ${block.blockType === "busy" ? "#ef4444" : getUserColor(block.userId)}`,
                              }}
                              title={`${getUserName(block.userId)} (${block.blockType === "busy" ? "Busy" : "Available"}): ${timeDisplay}${block.title ? ` - ${block.title}` : ""}`}
                            >
                              {block.blockType === "busy" ? "❌ " : ""}{block.isAllDay ? "📅 " : ""}{getUserName(block.userId)}
                            </div>
                          );
                        })}
                        {blocks.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{blocks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Legend</h3>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-green-500" />
                  <span>Overlapping availability</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-primary" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-l-2 border-red-500 bg-red-500/20" />
                  <span>Busy/Unavailable</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <LobbyInfo />
        </div>
      </div>

      {/* Day Timeline Dialog */}
      {selectedDay && lobby && (
        <DayTimelineDialog
          open={selectedDay !== null}
          onOpenChange={(open) => !open && setSelectedDay(null)}
          date={selectedDay}
          blocks={getBlocksForDay(selectedDay)}
          users={lobby.users}
          lobbyCode={code}
        />
      )}
    </div>
  );
}

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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LobbyPageProps {
  params: Promise<{ code: string }>;
}

export default function LobbyPage({ params }: LobbyPageProps) {
  const mounted = useMounted();
  const { code } = use(params);
  const { lobby, currentUser } = useLobbyStore();
  const { joinLobby, isLoading } = useLobby(code);
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize current month only on client to avoid hydration mismatch
    setCurrentMonth(new Date());
  }, []);

  useEffect(() => {
    if (currentUser) {
      joinLobby(currentUser.id, currentUser.name, currentUser.color);
    }
  }, [currentUser, joinLobby]);

  if (!mounted || !currentMonth) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBlocksForDay = (day: Date) => {
    return (
      lobby?.timeBlocks.filter((block) =>
        isSameDay(new Date(block.startTime), day)
      ) || []
    );
  };

  const getUserColor = (userId: string) => {
    return lobby?.users.find((u) => u.id === userId)?.color || "#gray";
  };

  const getUserName = (userId: string) => {
    return lobby?.users.find((u) => u.id === userId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Time Sync</h1>
            {!isLoading && lobby ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Synced
              </Badge>
            ) : (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Loading...
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Mark your availability and find overlapping free time
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
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground p-2"
                  >
                    {day}
                  </div>
                ))}

                {days.map((day, index) => {
                  const blocks = getBlocksForDay(day);
                  const hasOverlap = blocks.length > 1;
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
                        {blocks.slice(0, 3).map((block) => (
                          <div
                            key={block.id}
                            className="text-xs p-1 rounded truncate"
                            style={{
                              backgroundColor: getUserColor(block.userId) + "20",
                              borderLeft: `2px solid ${getUserColor(block.userId)}`,
                            }}
                            title={`${getUserName(block.userId)}: ${format(
                              new Date(block.startTime),
                              "HH:mm"
                            )} - ${format(new Date(block.endTime), "HH:mm")}`}
                          >
                            {getUserName(block.userId)}
                          </div>
                        ))}
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
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-green-500" />
                  <span>Overlapping availability</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-primary" />
                  <span>Today</span>
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
        />
      )}
    </div>
  );
}

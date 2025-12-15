"use client";

import { LobbyJoin } from "@/components/lobby/lobby-join";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Time Sync
        </h1>
        <p className="text-muted-foreground text-lg">
          Coordinate availability with friends in real-time
        </p>
      </div>

      <LobbyJoin />

      <div className="max-w-2xl mx-auto text-center space-y-4 pt-12">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">1</div>
            <h3 className="font-medium">Create or Join</h3>
            <p className="text-sm text-muted-foreground">
              Start a new lobby or join with a friend's code
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">2</div>
            <h3 className="font-medium">Add Availability</h3>
            <p className="text-sm text-muted-foreground">
              Mark when you're free to hang out or game
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">3</div>
            <h3 className="font-medium">Find Overlap</h3>
            <p className="text-sm text-muted-foreground">
              See when everyone is available at the same time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

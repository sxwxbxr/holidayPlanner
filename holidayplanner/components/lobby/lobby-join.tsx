"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLobbyStore } from "@/store";
import { getRandomColor } from "@/lib/utils";
import { useLobby } from "@/lib/hooks/use-lobby";
import { useMounted } from "@/lib/hooks/use-mounted";
import { User } from "@/types";

export function LobbyJoin() {
  const mounted = useMounted();
  const router = useRouter();
  const { setCurrentUser } = useLobbyStore();
  const { createLobby } = useLobby(null);
  const [name, setName] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [mode, setMode] = useState<"join" | "create" | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (!mounted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const user: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color: getRandomColor(),
    };

    setCurrentUser(user);

    if (mode === "create") {
      setIsCreating(true);
      const code = await createLobby();
      setIsCreating(false);
      if (code) {
        router.push(`/lobby/${code}`);
      }
    } else if (mode === "join" && lobbyCode.trim()) {
      router.push(`/lobby/${lobbyCode.trim().toUpperCase()}`);
    }
  };

  if (!mode) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl w-full">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setMode("create")}>
            <CardHeader>
              <CardTitle>Create Lobby</CardTitle>
              <CardDescription>
                Start a new lobby and invite friends with a code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Create New Lobby</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setMode("join")}>
            <CardHeader>
              <CardTitle>Join Lobby</CardTitle>
              <CardDescription>
                Enter a lobby code to join your friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Join Existing Lobby</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Create Lobby" : "Join Lobby"}
          </CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Enter your name to create a new lobby"
              : "Enter your name and the lobby code to join"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {mode === "join" && (
              <div className="space-y-2">
                <Label htmlFor="code">Lobby Code</Label>
                <Input
                  id="code"
                  placeholder="Enter 6-character code"
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode(null)}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isCreating}>
                {isCreating ? "Creating..." : mode === "create" ? "Create" : "Join"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLobbyStore } from "@/store";
import { getRandomColor, generateUUID } from "@/lib/utils";
import { useLobby } from "@/lib/hooks/use-lobby";
import { useMounted } from "@/lib/hooks/use-mounted";
import { User } from "@/types";
import { Smartphone, ArrowLeft } from "lucide-react";

export function LobbyJoin() {
  const mounted = useMounted();
  const router = useRouter();
  const { setCurrentUser, getUserForLobby, setUserForLobby } = useLobbyStore();
  const [tempLobbyCode, setTempLobbyCode] = useState("");
  const { createLobby, linkDevice } = useLobby(tempLobbyCode || null);
  const [name, setName] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [deviceCode, setDeviceCode] = useState("");
  const [mode, setMode] = useState<"join" | "create" | "link" | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [existingUser, setExistingUser] = useState<User | null>(null);

  // Check for existing user session when lobby code changes
  useEffect(() => {
    if (mode === "join" && lobbyCode.length === 6) {
      const normalizedCode = lobbyCode.trim().toUpperCase();
      const existing = getUserForLobby(normalizedCode);
      if (existing) {
        setExistingUser(existing);
        setName(existing.name);
      } else {
        setExistingUser(null);
      }
    } else {
      setExistingUser(null);
    }
  }, [lobbyCode, mode, getUserForLobby]);

  if (!mounted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let user: User;

    if (mode === "join" && existingUser) {
      // Reuse existing user ID but update the name if changed
      user = {
        id: existingUser.id,
        name: name.trim(),
        color: existingUser.color,
      };
    } else {
      // Create new user
      user = {
        id: generateUUID(),
        name: name.trim(),
        color: getRandomColor(),
      };
    }

    setCurrentUser(user);

    if (mode === "create") {
      setIsCreating(true);
      const code = await createLobby();
      setIsCreating(false);
      if (code) {
        // Store user identity for this lobby
        setUserForLobby(code, user);
        router.push(`/lobby/${code}`);
      }
    } else if (mode === "join" && lobbyCode.trim()) {
      const normalizedCode = lobbyCode.trim().toUpperCase();
      // Store user identity for this lobby
      setUserForLobby(normalizedCode, user);
      router.push(`/lobby/${normalizedCode}`);
    }
  };

  // Handle linking device
  const handleLinkDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lobbyCode.trim() || !deviceCode.trim()) return;

    const normalizedLobbyCode = lobbyCode.trim().toUpperCase();
    setTempLobbyCode(normalizedLobbyCode);
    setIsLinking(true);

    // Small delay to ensure tempLobbyCode is set for useLobby hook
    await new Promise((resolve) => setTimeout(resolve, 100));

    const linkedUser = await linkDevice(deviceCode.trim().toUpperCase());
    setIsLinking(false);

    if (linkedUser) {
      const user: User = {
        id: linkedUser.id,
        name: linkedUser.name,
        color: linkedUser.color,
        userCode: linkedUser.userCode,
      };
      setCurrentUser(user);
      setUserForLobby(normalizedLobbyCode, user);
      router.push(`/lobby/${normalizedLobbyCode}`);
    }
  };

  if (!mode) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="space-y-6 max-w-4xl w-full">
          <div className="grid gap-6 md:grid-cols-2">
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

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setMode("link")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Link Another Device
              </CardTitle>
              <CardDescription>
                Already in a lobby on another device? Enter your device code to sync
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">Link Device</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === "link") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Link Device
            </CardTitle>
            <CardDescription>
              Enter the lobby code and your device code to sync as the same user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLinkDevice} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lobbyCodeLink">Lobby Code</Label>
                <Input
                  id="lobbyCodeLink"
                  placeholder="Enter 6-character lobby code"
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceCode">Your Device Code</Label>
                <Input
                  id="deviceCode"
                  placeholder="Enter your 8-character device code"
                  value={deviceCode}
                  onChange={(e) => setDeviceCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Find your device code in the Lobby Info section on your other device
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMode(null);
                    setLobbyCode("");
                    setDeviceCode("");
                  }}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLinking}>
                  {isLinking ? "Linking..." : "Link Device"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
                autoFocus={mode === "create"}
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
                  autoFocus
                />
                {existingUser && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Welcome back! Rejoining as {existingUser.name}
                  </p>
                )}
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

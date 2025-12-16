"use client";

import { useLobbyStore } from "@/store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { useLobby } from "@/lib/hooks/use-lobby";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Users as UsersIcon, LogOut, Smartphone, Info } from "lucide-react";
import { useNotificationsStore } from "@/store";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function LobbyInfo() {
  const mounted = useMounted();
  const { lobby, currentUser, setLobby, setCurrentUser, getUserForLobby } = useLobbyStore();
  const { addNotification } = useNotificationsStore();
  const { leaveLobby } = useLobby(lobby?.code || null);
  const router = useRouter();

  if (!mounted || !lobby) return null;

  // Get the user data which includes the userCode
  const storedUser = getUserForLobby(lobby.code);
  const userCode = storedUser?.userCode;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(lobby.code);
    addNotification("success", "Lobby code copied!");
  };

  const handleCopyUserCode = () => {
    if (userCode) {
      navigator.clipboard.writeText(userCode);
      addNotification("success", "Your device code copied!");
    }
  };

  const handleLeaveLobby = async () => {
    if (!currentUser) return;

    if (confirm("Are you sure you want to leave this lobby?")) {
      const success = await leaveLobby(currentUser.id);
      if (success) {
        // Clear local state
        setLobby(null);
        setCurrentUser(null);
        addNotification("success", "Left lobby");
        router.push("/");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Lobby Info
          </span>
          <Badge variant="secondary">{lobby.users.length} online</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Lobby Code</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-2 bg-muted rounded-md text-lg font-mono font-semibold tracking-wider">
              {lobby.code}
            </code>
            <Button size="sm" variant="outline" onClick={handleCopyCode}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {userCode && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Smartphone className="h-3 w-3" />
              Your Device Code
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Use this code to log in on another device (like your phone). Enter the lobby code and this device code to sync as the same user.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-2 bg-muted rounded-md text-lg font-mono font-semibold tracking-wider text-center">
                {userCode}
              </code>
              <Button size="sm" variant="outline" onClick={handleCopyUserCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Connected Users</div>
          <div className="space-y-1">
            {lobby.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 p-2 rounded-md bg-muted"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-sm font-medium">{user.name}</span>
                {currentUser?.id === user.id && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    You
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLeaveLobby}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Leave Lobby
        </Button>
      </CardContent>
    </Card>
  );
}

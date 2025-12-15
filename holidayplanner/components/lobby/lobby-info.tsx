"use client";

import { useLobbyStore } from "@/store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Users as UsersIcon } from "lucide-react";
import { useNotificationsStore } from "@/store";

export function LobbyInfo() {
  const mounted = useMounted();
  const { lobby, currentUser } = useLobbyStore();
  const { addNotification } = useNotificationsStore();

  if (!mounted || !lobby) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(lobby.code);
    addNotification("success", "Lobby code copied!");
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
      </CardContent>
    </Card>
  );
}

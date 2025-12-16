import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateUserCode } from "@/lib/utils";
import { sseManager } from "@/lib/sse/connection-manager";

// Join a lobby (add or update user)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { id, name, color } = body;

    if (!id || !name || !color) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if lobby exists
    const lobbies = await sql`
      SELECT code FROM lobbies WHERE code = ${code}
    `;

    if (lobbies.length === 0) {
      return NextResponse.json({ error: "Lobby not found" }, { status: 404 });
    }

    // Check if user already exists (to preserve their user_code)
    const existingUsers = await sql`
      SELECT user_code FROM lobby_users WHERE id = ${id}
    `;

    let userCode = existingUsers.length > 0 ? existingUsers[0].user_code : null;

    // Generate a new user code if this is a new user or they don't have one
    if (!userCode) {
      userCode = generateUserCode();
    }

    // Upsert user - reactivate if they're rejoining
    await sql`
      INSERT INTO lobby_users (id, lobby_code, name, color, user_code, is_active, last_seen)
      VALUES (${id}, ${code}, ${name}, ${color}, ${userCode}, TRUE, CURRENT_TIMESTAMP)
      ON CONFLICT (id)
      DO UPDATE SET
        name = ${name},
        color = ${color},
        user_code = COALESCE(lobby_users.user_code, ${userCode}),
        is_active = TRUE,
        last_seen = CURRENT_TIMESTAMP
    `;

    // Broadcast to all clients in this lobby
    sseManager.broadcast(code, {
      type: "user-joined",
      data: { userId: id, userName: name },
    });

    // Return the user code so it can be stored and displayed
    return NextResponse.json({ success: true, userCode });
  } catch (error) {
    console.error("Error joining lobby:", error);
    return NextResponse.json(
      { error: "Failed to join lobby" },
      { status: 500 }
    );
  }
}

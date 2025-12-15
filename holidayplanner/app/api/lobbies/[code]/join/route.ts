import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

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

    // Upsert user
    await sql`
      INSERT INTO lobby_users (id, lobby_code, name, color, last_seen)
      VALUES (${id}, ${code}, ${name}, ${color}, CURRENT_TIMESTAMP)
      ON CONFLICT (id)
      DO UPDATE SET
        name = ${name},
        color = ${color},
        last_seen = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error joining lobby:", error);
    return NextResponse.json(
      { error: "Failed to join lobby" },
      { status: 500 }
    );
  }
}

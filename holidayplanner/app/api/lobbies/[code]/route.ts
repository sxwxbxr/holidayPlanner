import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Get lobby state (users + time blocks)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Get lobby
    const lobbies = await sql`
      SELECT * FROM lobbies WHERE code = ${code}
    `;

    if (lobbies.length === 0) {
      return NextResponse.json({ error: "Lobby not found" }, { status: 404 });
    }

    // Get active users only
    const users = await sql`
      SELECT id, name, color, is_active, joined_at
      FROM lobby_users
      WHERE lobby_code = ${code} AND is_active = TRUE
      ORDER BY joined_at ASC
    `;

    // Get time blocks
    const timeBlocks = await sql`
      SELECT id, user_id, start_time, end_time, title, description, created_at, updated_at
      FROM time_blocks
      WHERE lobby_code = ${code}
      ORDER BY start_time ASC
    `;

    return NextResponse.json({
      code: lobbies[0].code,
      name: lobbies[0].name,
      createdAt: lobbies[0].created_at,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        color: u.color,
        isActive: u.is_active,
      })),
      timeBlocks: timeBlocks.map((tb) => ({
        id: tb.id,
        userId: tb.user_id,
        startTime: tb.start_time,
        endTime: tb.end_time,
        title: tb.title,
        description: tb.description,
        createdAt: tb.created_at,
        updatedAt: tb.updated_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching lobby:", error);
    return NextResponse.json(
      { error: "Failed to fetch lobby" },
      { status: 500 }
    );
  }
}

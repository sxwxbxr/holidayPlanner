import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Link a device to an existing user using their user code
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { userCode } = body;

    if (!userCode) {
      return NextResponse.json(
        { error: "User code is required" },
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

    // Find user by their code in this lobby
    const users = await sql`
      SELECT id, name, color, user_code
      FROM lobby_users
      WHERE lobby_code = ${code} AND user_code = ${userCode.toUpperCase()}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: "No user found with this code in this lobby" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Mark user as active
    await sql`
      UPDATE lobby_users
      SET is_active = TRUE, last_seen = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        color: user.color,
        userCode: user.user_code,
      },
    });
  } catch (error) {
    console.error("Error linking device:", error);
    return NextResponse.json(
      { error: "Failed to link device" },
      { status: 500 }
    );
  }
}

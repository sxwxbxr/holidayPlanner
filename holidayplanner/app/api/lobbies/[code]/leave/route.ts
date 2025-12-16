import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sseManager } from "@/lib/sse/connection-manager";

// Leave a lobby (mark user as inactive)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // Mark user as inactive instead of deleting
    await sql`
      UPDATE lobby_users
      SET is_active = FALSE, last_seen = CURRENT_TIMESTAMP
      WHERE id = ${userId} AND lobby_code = ${code}
    `;

    // Broadcast to all clients in this lobby
    sseManager.broadcast(code, {
      type: "user-left",
      data: { userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving lobby:", error);
    return NextResponse.json(
      { error: "Failed to leave lobby" },
      { status: 500 }
    );
  }
}

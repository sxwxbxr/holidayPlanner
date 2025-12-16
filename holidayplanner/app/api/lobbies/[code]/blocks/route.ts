import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Add a time block
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { id, userId, startTime, endTime, blockType, title, description } = body;

    if (!id || !userId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO time_blocks (id, lobby_code, user_id, start_time, end_time, block_type, title, description)
      VALUES (${id}, ${code}, ${userId}, ${startTime}, ${endTime}, ${blockType || 'available'}, ${title || null}, ${description || null})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding time block:", error);
    return NextResponse.json(
      { error: "Failed to add time block" },
      { status: 500 }
    );
  }
}

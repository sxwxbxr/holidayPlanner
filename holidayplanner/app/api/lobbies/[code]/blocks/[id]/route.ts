import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Update a time block
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ code: string; id: string }> }
) {
  try {
    const { code, id } = await params;
    const body = await request.json();
    const { startTime, endTime, blockType, title, description } = body;

    await sql`
      UPDATE time_blocks
      SET
        start_time = ${startTime},
        end_time = ${endTime},
        block_type = ${blockType || 'available'},
        title = ${title || null},
        description = ${description || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND lobby_code = ${code}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating time block:", error);
    return NextResponse.json(
      { error: "Failed to update time block" },
      { status: 500 }
    );
  }
}

// Delete a time block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string; id: string }> }
) {
  try {
    const { code, id } = await params;

    await sql`
      DELETE FROM time_blocks
      WHERE id = ${id} AND lobby_code = ${code}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting time block:", error);
    return NextResponse.json(
      { error: "Failed to delete time block" },
      { status: 500 }
    );
  }
}

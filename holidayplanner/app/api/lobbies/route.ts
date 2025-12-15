import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Create a new lobby
export async function POST() {
  try {
    const code = generateLobbyCode();
    const name = `Lobby ${code}`;

    await sql`
      INSERT INTO lobbies (code, name)
      VALUES (${code}, ${name})
    `;

    return NextResponse.json({ code, name });
  } catch (error) {
    console.error("Error creating lobby:", error);
    return NextResponse.json(
      { error: "Failed to create lobby" },
      { status: 500 }
    );
  }
}

function generateLobbyCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

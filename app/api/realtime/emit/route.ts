import { type NextRequest, NextResponse } from "next/server"
import { broadcastEvent } from "../route"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await verifyToken(token)
    const event = await request.json()

    // Broadcast to all connected clients
    broadcastEvent(event, event.userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to emit event" }, { status: 500 })
  }
}

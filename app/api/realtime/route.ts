import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return new Response("User ID required", { status: 400 })
  }

  // Verify authentication
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    await verifyToken(token)
  } catch (error) {
    return new Response("Invalid token", { status: 401 })
  }

  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      connections.set(userId, controller)

      // Send initial connection event
      controller.enqueue(
        `data: ${JSON.stringify({
          type: "connected",
          data: { message: "Real-time connection established" },
          timestamp: Date.now(),
        })}\n\n`,
      )

      // Keep connection alive
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(
            `data: ${JSON.stringify({
              type: "ping",
              data: {},
              timestamp: Date.now(),
            })}\n\n`,
          )
        } catch (error) {
          clearInterval(keepAlive)
          connections.delete(userId)
        }
      }, 30000)

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive)
        connections.delete(userId)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}

// Broadcast event to all connected clients
export function broadcastEvent(event: any, excludeUserId?: string) {
  const eventData = `data: ${JSON.stringify(event)}\n\n`

  connections.forEach((controller, userId) => {
    if (excludeUserId && userId === excludeUserId) return

    try {
      controller.enqueue(eventData)
    } catch (error) {
      // Remove dead connection
      connections.delete(userId)
    }
  })
}

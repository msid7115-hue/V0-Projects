import type { NextRequest } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { userDb } from "@/lib/db"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return unauthorizedResponse()
    }

    const users = userDb.getAll()

    // Return users without sensitive information
    const safeUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
    }))

    return successResponse(safeUsers)
  } catch (error) {
    return errorResponse("Internal server error", 500)
  }
}

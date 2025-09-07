import type { NextRequest } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { userDb } from "@/lib/db"
import { successResponse, unauthorizedResponse } from "@/lib/api-response"

export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)

    if (!userPayload) {
      return unauthorizedResponse()
    }

    const user = userDb.findById(userPayload.userId)

    if (!user) {
      return unauthorizedResponse()
    }

    return successResponse({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    })
  } catch (error) {
    return unauthorizedResponse()
  }
}

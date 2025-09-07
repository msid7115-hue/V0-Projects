import type { NextRequest } from "next/server"
import { generateToken } from "@/lib/auth"
import { userDb } from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return errorResponse("Name, email, and password are required")
    }

    if (password.length < 6) {
      return errorResponse("Password must be at least 6 characters long")
    }

    // Check if user already exists
    const existingUser = userDb.findByEmail(email)
    if (existingUser) {
      return errorResponse("User with this email already exists")
    }

    // Create new user
    const newUser = userDb.create({
      name,
      email,
      avatar: "/diverse-user-avatars.png",
    })

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    })

    return successResponse(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
        },
        token,
      },
      "Registration successful",
    )
  } catch (error) {
    return errorResponse("Internal server error", 500)
  }
}

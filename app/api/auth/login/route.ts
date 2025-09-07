import type { NextRequest } from "next/server"
import { generateToken } from "@/lib/auth"
import { userDb } from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return errorResponse("Email and password are required")
    }

    // For demo purposes, we'll use a simple check
    // In a real app, you'd check against a hashed password in the database
    const user = userDb.findByEmail(email)

    if (!user) {
      return errorResponse("Invalid credentials", 401)
    }

    // For demo, accept any password for existing users
    // In production: if (!comparePassword(password, user.hashedPassword))

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    return successResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        token,
      },
      "Login successful",
    )
  } catch (error) {
    return errorResponse("Internal server error", 500)
  }
}

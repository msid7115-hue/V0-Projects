import type { NextRequest } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { taskDb } from "@/lib/db"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return unauthorizedResponse()
    }

    const tasks = taskDb.getAll(user.userId)
    return successResponse(tasks)
  } catch (error) {
    return errorResponse("Internal server error", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return unauthorizedResponse()
    }

    const taskData = await request.json()

    if (!taskData.title) {
      return errorResponse("Title is required")
    }

    // Convert date strings to Date objects
    if (taskData.dueDate) {
      taskData.dueDate = new Date(taskData.dueDate)
    }

    const newTask = taskDb.create({
      ...taskData,
      tags: taskData.tags || [],
    })

    return successResponse(newTask, "Task created successfully")
  } catch (error) {
    return errorResponse("Internal server error", 500)
  }
}

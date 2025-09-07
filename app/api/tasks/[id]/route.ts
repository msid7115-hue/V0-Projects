import type { NextRequest } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { taskDb } from "@/lib/db"
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from "@/lib/api-response"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return unauthorizedResponse()
    }

    const task = taskDb.findById(params.id)

    if (!task) {
      return notFoundResponse("Task")
    }

    return successResponse(task)
  } catch (error) {
    return errorResponse("Internal server error", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return unauthorizedResponse()
    }

    const updates = await request.json()

    // Convert date strings to Date objects
    if (updates.dueDate) {
      updates.dueDate = new Date(updates.dueDate)
    }

    const updatedTask = taskDb.update(params.id, updates)

    if (!updatedTask) {
      return notFoundResponse("Task")
    }

    return successResponse(updatedTask, "Task updated successfully")
  } catch (error) {
    return errorResponse("Internal server error", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return unauthorizedResponse()
    }

    const deleted = taskDb.delete(params.id)

    if (!deleted) {
      return notFoundResponse("Task")
    }

    return successResponse(null, "Task deleted successfully")
  } catch (error) {
    return errorResponse("Internal server error", 500)
  }
}

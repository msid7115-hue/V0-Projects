import type { NextRequest } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { projectDb } from "@/lib/db"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return unauthorizedResponse()
    }

    const projects = projectDb.getAll()
    return successResponse(projects)
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

    const projectData = await request.json()

    if (!projectData.name) {
      return errorResponse("Project name is required")
    }

    const newProject = projectDb.create({
      name: projectData.name,
      description: projectData.description || "",
      color: projectData.color || "#0891b2",
    })

    return successResponse(newProject, "Project created successfully")
  } catch (error) {
    return errorResponse("Internal server error", 500)
  }
}

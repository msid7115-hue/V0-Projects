export interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  projectId?: string
  assigneeId?: string
  tags: string[]
  comments: Comment[]
}

export interface Comment {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: Date
}

export interface Project {
  id: string
  name: string
  description?: string
  color: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export type TaskStatus = Task["status"]
export type TaskPriority = Task["priority"]

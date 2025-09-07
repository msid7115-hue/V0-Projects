// Mock database - In a real app, this would connect to MongoDB, PostgreSQL, etc.
import type { Task, User, Project } from "./types"

// In-memory storage (replace with real database)
const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "/diverse-user-avatars.png",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "/female-user-avatar.png",
  },
]

const projects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete redesign of company website",
    color: "#0891b2",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Mobile App",
    description: "Development of mobile application",
    color: "#10b981",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
]

const tasks: Task[] = [
  {
    id: "1",
    title: "Design homepage mockup",
    description: "Create wireframes and high-fidelity mockups for the new homepage",
    status: "in-progress",
    priority: "high",
    dueDate: new Date("2024-12-20"),
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2024-12-05"),
    projectId: "1",
    assigneeId: "1",
    tags: ["design", "ui/ux"],
    comments: [
      {
        id: "1",
        content: "Started working on the initial wireframes",
        authorId: "1",
        authorName: "John Doe",
        createdAt: new Date("2024-12-05"),
      },
    ],
  },
  {
    id: "2",
    title: "Set up development environment",
    description: "Configure local development environment with all necessary tools",
    status: "done",
    priority: "medium",
    dueDate: new Date("2024-12-15"),
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2024-12-03"),
    projectId: "2",
    assigneeId: "2",
    tags: ["development", "setup"],
    comments: [],
  },
  {
    id: "3",
    title: "Write project documentation",
    description: "Create comprehensive documentation for the project",
    status: "todo",
    priority: "low",
    dueDate: new Date("2024-12-25"),
    createdAt: new Date("2024-12-02"),
    updatedAt: new Date("2024-12-02"),
    projectId: "1",
    assigneeId: "1",
    tags: ["documentation"],
    comments: [],
  },
  {
    id: "4",
    title: "Implement user authentication",
    description: "Add login and registration functionality",
    status: "todo",
    priority: "high",
    dueDate: new Date("2024-12-18"),
    createdAt: new Date("2024-12-03"),
    updatedAt: new Date("2024-12-03"),
    projectId: "2",
    assigneeId: "2",
    tags: ["development", "auth"],
    comments: [],
  },
]

// User operations
export const userDb = {
  findByEmail: (email: string): User | undefined => {
    return users.find((user) => user.email === email)
  },

  findById: (id: string): User | undefined => {
    return users.find((user) => user.id === id)
  },

  create: (userData: Omit<User, "id">): User => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
    }
    users.push(newUser)
    return newUser
  },

  getAll: (): User[] => {
    return users
  },
}

// Task operations
export const taskDb = {
  getAll: (userId?: string): Task[] => {
    // In a real app, filter by user permissions
    return tasks
  },

  findById: (id: string): Task | undefined => {
    return tasks.find((task) => task.id === id)
  },

  create: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">): Task => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
    }
    tasks.push(newTask)
    return newTask
  },

  update: (id: string, updates: Partial<Task>): Task | null => {
    const taskIndex = tasks.findIndex((task) => task.id === id)
    if (taskIndex === -1) return null

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    }
    return tasks[taskIndex]
  },

  delete: (id: string): boolean => {
    const taskIndex = tasks.findIndex((task) => task.id === id)
    if (taskIndex === -1) return false

    tasks.splice(taskIndex, 1)
    return true
  },
}

// Project operations
export const projectDb = {
  getAll: (): Project[] => {
    return projects
  },

  findById: (id: string): Project | undefined => {
    return projects.find((project) => project.id === id)
  },

  create: (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">): Project => {
    const newProject: Project = {
      ...projectData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    projects.push(newProject)
    return newProject
  },
}

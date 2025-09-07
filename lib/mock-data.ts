import type { Task, Project, User } from "./types"

export const mockUsers: User[] = [
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

export const mockProjects: Project[] = [
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

export const mockTasks: Task[] = [
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

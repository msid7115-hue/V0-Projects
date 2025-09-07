"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Calendar, MessageSquare, Tag, Clock, AlertCircle, CheckCircle2, Circle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Task } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onStatusChange?: (taskId: string, status: Task["status"]) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onClick?: (task: Task) => void
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
}

const statusIcons = {
  todo: Circle,
  "in-progress": Clock,
  done: CheckCircle2,
}

export function TaskCard({ task, onStatusChange, onEdit, onDelete, onClick }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const assignee = mockUsers.find((user) => user.id === task.assigneeId)
  const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== "done"
  const StatusIcon = statusIcons[task.status]

  const handleStatusChange = (status: Task["status"]) => {
    onStatusChange?.(task.id, status)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className={cn(
          "glass cursor-pointer transition-all duration-200 hover:shadow-lg",
          isOverdue && "border-destructive/50",
        )}
        onClick={() => onClick?.(task)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <StatusIcon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  task.status === "done" && "text-green-600",
                  task.status === "in-progress" && "text-blue-600",
                  task.status === "todo" && "text-muted-foreground",
                )}
              />
              <h3 className="font-medium text-sm leading-tight line-clamp-2">{task.title}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 w-8 p-0 opacity-0 transition-opacity", isHovered && "opacity-100")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.(task)
                  }}
                >
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange("todo")
                  }}
                  disabled={task.status === "todo"}
                >
                  Mark as Todo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange("in-progress")
                  }}
                  disabled={task.status === "in-progress"}
                >
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange("done")
                  }}
                  disabled={task.status === "done"}
                >
                  Mark as Done
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.(task.id)
                  }}
                  className="text-destructive"
                >
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>

              {task.dueDate && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    isOverdue ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {isOverdue && <AlertCircle className="h-3 w-3" />}
                  <Calendar className="h-3 w-3" />
                  <span>
                    {task.dueDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {task.comments.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  <span>{task.comments.length}</span>
                </div>
              )}

              {task.tags.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  <span>{task.tags.length}</span>
                </div>
              )}

              {assignee && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                  <AvatarFallback className="text-xs">
                    {assignee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

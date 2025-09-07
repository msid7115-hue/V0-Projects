"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react"
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
  low: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800",
  medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
  high: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800",
}

const statusIcons = {
  todo: Circle,
  "in-progress": Clock,
  done: CheckCircle2,
}

const statusColors = {
  todo: "text-muted-foreground",
  "in-progress": "text-blue-500",
  done: "text-primary",
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Card
        className={cn(
          "glass-strong cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 border-0 relative overflow-hidden",
          isOverdue && "ring-2 ring-destructive/20",
          task.status === "done" && "ring-2 ring-primary/20",
        )}
        onClick={() => onClick?.(task)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div
          className={cn(
            "absolute top-0 left-0 w-full h-1 transition-all duration-300",
            task.priority === "high" && "bg-gradient-to-r from-red-500 to-red-400",
            task.priority === "medium" && "bg-gradient-to-r from-amber-500 to-amber-400",
            task.priority === "low" && "bg-gradient-to-r from-blue-500 to-blue-400",
          )}
        />

        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                <StatusIcon
                  className={cn("h-5 w-5 flex-shrink-0 transition-colors duration-200", statusColors[task.status])}
                />
              </motion.div>
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-balance">{task.title}</h3>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8,
              }}
              transition={{ duration: 0.2 }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-strong border-0">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit?.(task)
                    }}
                    className="hover:bg-primary/10"
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
                    className="hover:bg-primary/10"
                  >
                    Mark as Todo
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStatusChange("in-progress")
                    }}
                    disabled={task.status === "in-progress"}
                    className="hover:bg-primary/10"
                  >
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStatusChange("done")
                    }}
                    disabled={task.status === "done"}
                    className="hover:bg-primary/10"
                  >
                    Mark as Done
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete?.(task.id)
                    }}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4 relative">
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 text-pretty">{task.description}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("text-xs font-medium border transition-all duration-200", priorityColors[task.priority])}
              >
                {task.priority}
              </Badge>

              {task.dueDate && (
                <motion.div
                  className={cn(
                    "flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors duration-200",
                    isOverdue ? "text-destructive bg-destructive/10" : "text-muted-foreground bg-muted/50",
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  {isOverdue && <AlertCircle className="h-3 w-3" />}
                  <Calendar className="h-3 w-3" />
                  <span>
                    {task.dueDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {task.comments.length > 0 && (
                <motion.div
                  className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(21, 128, 61, 0.1)" }}
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>{task.comments.length}</span>
                </motion.div>
              )}

              {task.tags.length > 0 && (
                <motion.div
                  className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(132, 204, 22, 0.1)" }}
                >
                  <Tag className="h-3 w-3" />
                  <span>{task.tags.length}</span>
                </motion.div>
              )}

              {assignee && (
                <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <Avatar className="h-7 w-7 ring-2 ring-primary/20 transition-all duration-200 hover:ring-primary/40">
                    <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-accent/20">
                      {assignee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              )}
            </div>
          </div>

          {task.status === "done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2"
            >
              <div className="bg-primary/20 rounded-full p-1">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Calendar, MessageSquare, AlertCircle, GripVertical } from "lucide-react"
import type { Task } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface KanbanTaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  isDragging?: boolean
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
}

export function KanbanTaskCard({ task, onEdit, onDelete, isDragging = false }: KanbanTaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const assignee = mockUsers.find((user) => user.id === task.assigneeId)
  const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== "done"

  if (isDragging) {
    return (
      <Card className="glass shadow-2xl border-primary/50 w-full max-w-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            <h3 className="font-medium text-sm leading-tight line-clamp-2">{task.title}</h3>
            {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
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
    )
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn("cursor-grab active:cursor-grabbing", isSortableDragging && "opacity-50")}
    >
      <Card
        className={cn(
          "glass hover:shadow-lg transition-all duration-200 group",
          isOverdue && "border-destructive/50",
          isSortableDragging && "shadow-2xl",
        )}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header with drag handle */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm leading-tight line-clamp-2 flex-1">{task.title}</h3>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(task)}>Edit Task</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete?.(task.id)} className="text-destructive">
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Description */}
            {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{task.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer */}
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

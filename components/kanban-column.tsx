"use client"

import { motion } from "framer-motion"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { KanbanTaskCard } from "./kanban-task-card"
import { Plus } from "lucide-react"
import type { Task, TaskStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
  column: {
    id: TaskStatus
    title: string
    color: string
    bgColor: string
  }
  tasks: Task[]
  onTaskEdit: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onCreateTask: () => void
}

export function KanbanColumn({ column, tasks, onTaskEdit, onTaskDelete, onCreateTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      <Card className={cn("glass flex-1 transition-all duration-200", isOver && "ring-2 ring-primary/50")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className={cn("text-sm font-medium", column.color)}>{column.title}</CardTitle>
              <Badge variant="secondary" className={cn("text-xs", column.bgColor)}>
                {tasks.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateTask}
              className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pt-0">
          <div
            ref={setNodeRef}
            className={cn(
              "min-h-[200px] space-y-3 p-2 rounded-lg transition-colors duration-200",
              isOver && "bg-muted/50",
            )}
          >
            <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <KanbanTaskCard key={task.id} task={task} onEdit={onTaskEdit} onDelete={onTaskDelete} />
              ))}
            </SortableContext>

            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                <div className="text-center">
                  <div className="mb-2">No tasks</div>
                  <Button variant="ghost" size="sm" onClick={onCreateTask} className="text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Add task
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

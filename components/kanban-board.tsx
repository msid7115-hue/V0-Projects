"use client"

import { useState } from "react"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import { KanbanColumn } from "./kanban-column"
import { KanbanTaskCard } from "./kanban-task-card"
import type { Task, TaskStatus } from "@/lib/types"

interface KanbanBoardProps {
  tasks: Task[]
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void
  onTaskEdit: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onCreateTask: () => void
  isLoading?: boolean
}

const columns: Array<{
  id: TaskStatus
  title: string
  color: string
  bgColor: string
}> = [
  {
    id: "todo",
    title: "To Do",
    color: "text-slate-600",
    bgColor: "bg-slate-100 dark:bg-slate-800/50",
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-800/50",
  },
  {
    id: "done",
    title: "Done",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-800/50",
  },
]

export function KanbanBoard({
  tasks,
  onTaskStatusChange,
  onTaskEdit,
  onTaskDelete,
  onCreateTask,
  isLoading,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    setActiveTask(task || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find the containers
    const activeContainer = findContainer(activeId.toString())
    const overContainer = findContainer(overId.toString())

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }

    // Update task status when dragging over different column
    const task = tasks.find((t) => t.id === activeId)
    if (task && overContainer !== task.status) {
      onTaskStatusChange(task.id, overContainer as TaskStatus)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      return
    }

    const activeId = active.id
    const overId = over.id

    const activeContainer = findContainer(activeId.toString())
    const overContainer = findContainer(overId.toString())

    if (!activeContainer || !overContainer) {
      setActiveTask(null)
      return
    }

    if (activeContainer !== overContainer) {
      const task = tasks.find((t) => t.id === activeId)
      if (task) {
        onTaskStatusChange(task.id, overContainer as TaskStatus)
      }
    }

    setActiveTask(null)
  }

  const findContainer = (id: string): TaskStatus | null => {
    // Check if id is a column
    if (columns.some((col) => col.id === id)) {
      return id as TaskStatus
    }

    // Find which column contains this task
    const task = tasks.find((t) => t.id === id)
    return task ? task.status : null
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id)
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                onTaskEdit={onTaskEdit}
                onTaskDelete={onTaskDelete}
                onCreateTask={onCreateTask}
              />
            )
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-90">
              <KanbanTaskCard task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  gradient: string
}> = [
  {
    id: "todo",
    title: "To Do",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50/80 dark:bg-slate-800/50",
    gradient: "from-slate-100/50 to-slate-50/30 dark:from-slate-800/50 dark:to-slate-900/30",
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50/80 dark:bg-blue-800/50",
    gradient: "from-blue-100/50 to-blue-50/30 dark:from-blue-800/50 dark:to-blue-900/30",
  },
  {
    id: "done",
    title: "Done",
    color: "text-primary dark:text-primary",
    bgColor: "bg-primary/10 dark:bg-primary/20",
    gradient: "from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20",
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
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {columns.map((column, index) => {
            const columnTasks = getTasksByStatus(column.id)
            return (
              <motion.div
                key={column.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <KanbanColumn
                  column={column}
                  tasks={columnTasks}
                  onTaskEdit={onTaskEdit}
                  onTaskDelete={onTaskDelete}
                  onCreateTask={onCreateTask}
                />
              </motion.div>
            )
          })}
        </motion.div>

        <DragOverlay>
          <AnimatePresence>
            {activeTask && (
              <motion.div
                className="rotate-3 opacity-90"
                initial={{ scale: 1.05, rotate: 3 }}
                animate={{ scale: 1.1, rotate: 5 }}
                exit={{ scale: 0.95, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <KanbanTaskCard task={activeTask} isDragging />
              </motion.div>
            )}
          </AnimatePresence>
        </DragOverlay>
      </DndContext>
    </div>
  )
}

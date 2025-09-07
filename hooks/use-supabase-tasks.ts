"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"

interface UseTasksReturn {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  createTask: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">) => Promise<Task | null>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task | null>
  deleteTask: (taskId: string) => Promise<boolean>
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<Task | null>
  updateTaskPriority: (taskId: string, priority: TaskPriority) => Promise<Task | null>
  getTasksByStatus: (status: TaskStatus) => Task[]
  getTasksByProject: (projectId: string) => Task[]
  getOverdueTasks: () => Task[]
  refreshTasks: () => Promise<void>
}

export function useSupabaseTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleError = (error: any, defaultMessage: string) => {
    console.error("[v0] Task operation error:", error)
    const message = error?.message || defaultMessage
    setError(message)
    return null
  }

  const loadTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from("tasks")
        .select(`
          *,
          comments:task_comments(*)
        `)
        .order("created_at", { ascending: false })

      if (supabaseError) throw supabaseError

      const formattedTasks: Task[] = (data || []).map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status as TaskStatus,
        priority: task.priority as TaskPriority,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
        projectId: task.project_id,
        assigneeId: task.assignee_id,
        tags: task.tags || [],
        comments: (task.comments || []).map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          authorId: comment.author_id,
          authorName: comment.author_name,
          createdAt: new Date(comment.created_at),
        })),
      }))

      setTasks(formattedTasks)
    } catch (error) {
      handleError(error, "Failed to load tasks")
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const createTask = useCallback(
    async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">): Promise<Task | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error: supabaseError } = await supabase
          .from("tasks")
          .insert({
            title: taskData.title,
            description: taskData.description,
            status: taskData.status,
            priority: taskData.priority,
            due_date: taskData.dueDate?.toISOString(),
            project_id: taskData.projectId,
            assignee_id: taskData.assigneeId,
            tags: taskData.tags,
          })
          .select()
          .single()

        if (supabaseError) throw supabaseError

        const newTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status as TaskStatus,
          priority: data.priority as TaskPriority,
          dueDate: data.due_date ? new Date(data.due_date) : undefined,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          projectId: data.project_id,
          assigneeId: data.assignee_id,
          tags: data.tags || [],
          comments: [],
        }

        setTasks((prev) => [newTask, ...prev])
        return newTask
      } catch (error) {
        return handleError(error, "Failed to create task")
      } finally {
        setIsLoading(false)
      }
    },
    [supabase],
  )

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const updateData: any = {}
        if (updates.title !== undefined) updateData.title = updates.title
        if (updates.description !== undefined) updateData.description = updates.description
        if (updates.status !== undefined) updateData.status = updates.status
        if (updates.priority !== undefined) updateData.priority = updates.priority
        if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString()
        if (updates.projectId !== undefined) updateData.project_id = updates.projectId
        if (updates.assigneeId !== undefined) updateData.assignee_id = updates.assigneeId
        if (updates.tags !== undefined) updateData.tags = updates.tags

        const { data, error: supabaseError } = await supabase
          .from("tasks")
          .update(updateData)
          .eq("id", taskId)
          .select()
          .single()

        if (supabaseError) throw supabaseError

        const updatedTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status as TaskStatus,
          priority: data.priority as TaskPriority,
          dueDate: data.due_date ? new Date(data.due_date) : undefined,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          projectId: data.project_id,
          assigneeId: data.assignee_id,
          tags: data.tags || [],
          comments: tasks.find((t) => t.id === taskId)?.comments || [],
        }

        setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)))
        return updatedTask
      } catch (error) {
        return handleError(error, "Failed to update task")
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, tasks],
  )

  const deleteTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const { error: supabaseError } = await supabase.from("tasks").delete().eq("id", taskId)

        if (supabaseError) throw supabaseError

        setTasks((prev) => prev.filter((task) => task.id !== taskId))
        return true
      } catch (error) {
        handleError(error, "Failed to delete task")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [supabase],
  )

  const updateTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus): Promise<Task | null> => {
      return updateTask(taskId, { status })
    },
    [updateTask],
  )

  const updateTaskPriority = useCallback(
    async (taskId: string, priority: TaskPriority): Promise<Task | null> => {
      return updateTask(taskId, { priority })
    },
    [updateTask],
  )

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => {
      return tasks.filter((task) => task.status === status)
    },
    [tasks],
  )

  const getTasksByProject = useCallback(
    (projectId: string) => {
      return tasks.filter((task) => task.projectId === projectId)
    },
    [tasks],
  )

  const getOverdueTasks = useCallback(() => {
    const now = new Date()
    return tasks.filter((task) => task.dueDate && task.dueDate < now && task.status !== "done")
  }, [tasks])

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskPriority,
    getTasksByStatus,
    getTasksByProject,
    getOverdueTasks,
    refreshTasks: loadTasks,
  }
}

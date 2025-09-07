"use client"

import { useState, useEffect, useCallback } from "react"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"
import { apiClient } from "./use-api"
import { useRealtime } from "@/contexts/realtime-context"
import { useAuth } from "@/contexts/auth-context"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { emit, subscribe } = useRealtime()
  const { user } = useAuth()

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    const unsubscribeCreated = subscribe("task_created", (event) => {
      if (event.data && event.userId !== user?.id) {
        const newTask = {
          ...event.data,
          createdAt: new Date(event.data.createdAt),
          updatedAt: new Date(event.data.updatedAt),
          dueDate: event.data.dueDate ? new Date(event.data.dueDate) : undefined,
          comments:
            event.data.comments?.map((comment: any) => ({
              ...comment,
              createdAt: new Date(comment.createdAt),
            })) || [],
        }
        setTasks((prev) => [newTask, ...prev])
      }
    })

    const unsubscribeUpdated = subscribe("task_updated", (event) => {
      if (event.data && event.userId !== user?.id) {
        const updatedTask = {
          ...event.data,
          createdAt: new Date(event.data.createdAt),
          updatedAt: new Date(event.data.updatedAt),
          dueDate: event.data.dueDate ? new Date(event.data.dueDate) : undefined,
          comments:
            event.data.comments?.map((comment: any) => ({
              ...comment,
              createdAt: new Date(comment.createdAt),
            })) || [],
        }
        setTasks((prev) => prev.map((task) => (task.id === event.data.id ? updatedTask : task)))
      }
    })

    const unsubscribeDeleted = subscribe("task_deleted", (event) => {
      if (event.data && event.userId !== user?.id) {
        setTasks((prev) => prev.filter((task) => task.id !== event.data.id))
      }
    })

    return () => {
      unsubscribeCreated()
      unsubscribeUpdated()
      unsubscribeDeleted()
    }
  }, [subscribe, user?.id])

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getTasks()
      if (response.success && response.data) {
        const tasksWithDates = response.data.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          comments: task.comments.map((comment: any) => ({
            ...comment,
            createdAt: new Date(comment.createdAt),
          })),
        }))
        setTasks(tasksWithDates)
      }
    } catch (error) {
      console.error("Failed to load tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createTask = useCallback(
    async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">) => {
      setIsLoading(true)

      try {
        const response = await apiClient.createTask(taskData)
        if (response.success && response.data) {
          const newTask = {
            ...response.data,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
            dueDate: response.data.dueDate ? new Date(response.data.dueDate) : undefined,
            comments: response.data.comments.map((comment: any) => ({
              ...comment,
              createdAt: new Date(comment.createdAt),
            })),
          }
          setTasks((prev) => [newTask, ...prev])

          emit({
            type: "task_created",
            data: { ...newTask, createdBy: user?.name },
            timestamp: Date.now(),
            userId: user?.id,
          })

          return newTask
        }
      } catch (error) {
        console.error("Failed to create task:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [emit, user],
  )

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      setIsLoading(true)

      try {
        const response = await apiClient.updateTask(taskId, updates)
        if (response.success && response.data) {
          const updatedTask = {
            ...response.data,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
            dueDate: response.data.dueDate ? new Date(response.data.dueDate) : undefined,
            comments: response.data.comments.map((comment: any) => ({
              ...comment,
              createdAt: new Date(comment.createdAt),
            })),
          }
          setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)))

          emit({
            type: "task_updated",
            data: { ...updatedTask, updatedBy: user?.name },
            timestamp: Date.now(),
            userId: user?.id,
          })
        }
      } catch (error) {
        console.error("Failed to update task:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [emit, user],
  )

  const deleteTask = useCallback(
    async (taskId: string) => {
      setIsLoading(true)

      const taskToDelete = tasks.find((task) => task.id === taskId)

      try {
        const response = await apiClient.deleteTask(taskId)
        if (response.success) {
          setTasks((prev) => prev.filter((task) => task.id !== taskId))

          emit({
            type: "task_deleted",
            data: { id: taskId, title: taskToDelete?.title, deletedBy: user?.name },
            timestamp: Date.now(),
            userId: user?.id,
          })
        }
      } catch (error) {
        console.error("Failed to delete task:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [emit, user, tasks],
  )

  const updateTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      await updateTask(taskId, { status })
    },
    [updateTask],
  )

  const updateTaskPriority = useCallback(
    async (taskId: string, priority: TaskPriority) => {
      await updateTask(taskId, { priority })
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

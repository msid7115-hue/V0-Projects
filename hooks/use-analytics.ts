"use client"

import { useMemo } from "react"
import { useTasks } from "./use-tasks"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subWeeks, isWithinInterval } from "date-fns"

export interface TaskAnalytics {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  overdueTasks: number
  completionRate: number
  weeklyProgress: Array<{
    date: string
    completed: number
    created: number
  }>
  priorityDistribution: Array<{
    priority: string
    count: number
    percentage: number
  }>
  statusDistribution: Array<{
    status: string
    count: number
    percentage: number
  }>
  productivityTrend: Array<{
    week: string
    completed: number
    created: number
    efficiency: number
  }>
  projectProgress: Array<{
    project: string
    total: number
    completed: number
    percentage: number
  }>
}

export function useAnalytics(): TaskAnalytics {
  const { tasks } = useTasks()

  return useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.status === "done").length
    const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length
    const todoTasks = tasks.filter((task) => task.status === "todo").length
    const overdueTasks = tasks.filter(
      (task) => task.dueDate && task.dueDate < new Date() && task.status !== "done",
    ).length

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Weekly progress for the last 7 days
    const today = new Date()
    const weekStart = startOfWeek(today)
    const weekEnd = endOfWeek(today)
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    const weeklyProgress = weekDays.map((day) => {
      const dayStr = format(day, "MMM dd")
      const completed = tasks.filter(
        (task) =>
          task.status === "done" &&
          task.updatedAt.toDateString() === day.toDateString() &&
          task.createdAt.toDateString() !== day.toDateString(),
      ).length

      const created = tasks.filter((task) => task.createdAt.toDateString() === day.toDateString()).length

      return {
        date: dayStr,
        completed,
        created,
      }
    })

    // Priority distribution
    const priorityCount = tasks.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const priorityDistribution = Object.entries(priorityCount).map(([priority, count]) => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      count,
      percentage: totalTasks > 0 ? (count / totalTasks) * 100 : 0,
    }))

    // Status distribution
    const statusCount = tasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const statusDistribution = Object.entries(statusCount).map(([status, count]) => ({
      status: status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      count,
      percentage: totalTasks > 0 ? (count / totalTasks) * 100 : 0,
    }))

    // Productivity trend for the last 4 weeks
    const productivityTrend = Array.from({ length: 4 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(today, 3 - i))
      const weekEnd = endOfWeek(weekStart)

      const completed = tasks.filter(
        (task) =>
          task.status === "done" &&
          isWithinInterval(task.updatedAt, { start: weekStart, end: weekEnd }) &&
          !isWithinInterval(task.createdAt, { start: weekStart, end: weekEnd }),
      ).length

      const created = tasks.filter((task) =>
        isWithinInterval(task.createdAt, { start: weekStart, end: weekEnd }),
      ).length

      const efficiency = created > 0 ? (completed / created) * 100 : 0

      return {
        week: format(weekStart, "MMM dd"),
        completed,
        created,
        efficiency: Math.round(efficiency),
      }
    })

    // Project progress (mock data since we don't have real projects)
    const projectProgress = [
      { project: "Website Redesign", total: 8, completed: 5, percentage: 62.5 },
      { project: "Mobile App", total: 12, completed: 3, percentage: 25 },
      { project: "Documentation", total: 5, completed: 4, percentage: 80 },
    ]

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      completionRate,
      weeklyProgress,
      priorityDistribution,
      statusDistribution,
      productivityTrend,
      projectProgress,
    }
  }, [tasks])
}

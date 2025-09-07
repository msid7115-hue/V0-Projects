"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import type { Task } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  tasks: Task[]
  onTaskEdit: (task: Task) => void
  onTaskStatusChange: (taskId: string, status: Task["status"]) => void
}

const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
}

const statusIcons = {
  todo: Clock,
  "in-progress": Clock,
  done: CheckCircle2,
}

export function CalendarView({ tasks, onTaskEdit, onTaskStatusChange }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewDate, setViewDate] = useState<Date>(new Date())

  // Get tasks for selected date
  const selectedDateTasks = tasks.filter((task) => task.dueDate && isSameDay(task.dueDate, selectedDate))

  // Get tasks for the current month view
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Create a map of dates to tasks for the month
  const dateTaskMap = monthDays.reduce(
    (acc, day) => {
      const dayTasks = tasks.filter((task) => task.dueDate && isSameDay(task.dueDate, day))
      if (dayTasks.length > 0) {
        acc[format(day, "yyyy-MM-dd")] = dayTasks
      }
      return acc
    },
    {} as Record<string, Task[]>,
  )

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  const handleMonthChange = (direction: "prev" | "next") => {
    const newDate = new Date(viewDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setViewDate(newDate)
  }

  const getTasksForDate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd")
    return dateTaskMap[dateKey] || []
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card className="glass h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(viewDate, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleMonthChange("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleMonthChange("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={viewDate}
              onMonthChange={setViewDate}
              className="rounded-md border-0"
              components={{
                Day: ({ date, ...props }) => {
                  const dayTasks = getTasksForDate(date)
                  const hasOverdue = dayTasks.some(
                    (task) => task.dueDate && task.dueDate < new Date() && task.status !== "done",
                  )

                  return (
                    <div className="relative">
                      <button
                        {...props}
                        className={cn(
                          props.className,
                          "relative w-full h-full min-h-[40px]",
                          dayTasks.length > 0 && "font-semibold",
                        )}
                      >
                        {format(date, "d")}
                        {dayTasks.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                            {dayTasks.slice(0, 3).map((task, index) => (
                              <div
                                key={task.id}
                                className={cn("w-1.5 h-1.5 rounded-full", priorityColors[task.priority])}
                              />
                            ))}
                            {dayTasks.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />}
                          </div>
                        )}
                        {hasOverdue && <AlertCircle className="absolute top-1 right-1 h-3 w-3 text-destructive" />}
                      </button>
                    </div>
                  )
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Tasks */}
      <div>
        <Card className="glass h-full">
          <CardHeader>
            <CardTitle className="text-lg">{format(selectedDate, "EEEE, MMMM d")}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? "s" : ""}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="p-6 pt-0">
                <AnimatePresence>
                  {selectedDateTasks.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No tasks scheduled for this date</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateTasks.map((task, index) => {
                        const StatusIcon = statusIcons[task.status]
                        const assignee = mockUsers.find((user) => user.id === task.assigneeId)
                        const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== "done"

                        return (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2, delay: index * 0.1 }}
                          >
                            <Card
                              className={cn(
                                "glass-strong cursor-pointer hover:shadow-md transition-all duration-200",
                                isOverdue && "border-destructive/50",
                              )}
                              onClick={() => onTaskEdit(task)}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-3">
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
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        "text-xs",
                                        task.priority === "high" &&
                                          "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
                                        task.priority === "medium" &&
                                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
                                        task.priority === "low" &&
                                          "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
                                      )}
                                    >
                                      {task.priority}
                                    </Badge>
                                  </div>

                                  {task.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
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
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

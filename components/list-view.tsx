"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"
import { mockUsers, mockProjects } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface ListViewProps {
  tasks: Task[]
  onTaskEdit: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void
}

type SortField = "title" | "status" | "priority" | "dueDate" | "createdAt"
type SortDirection = "asc" | "desc"

const statusIcons = {
  todo: Circle,
  "in-progress": Clock,
  done: CheckCircle2,
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
}

export function ListView({ tasks, onTaskEdit, onTaskDelete, onTaskStatusChange }: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const filteredAndSortedTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || task.status === statusFilter
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
      const matchesProject = projectFilter === "all" || task.projectId === projectFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesProject
    })

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case "dueDate":
          aValue = a.dueDate?.getTime() || 0
          bValue = b.dueDate?.getTime() || 0
          break
        case "createdAt":
          aValue = a.createdAt.getTime()
          bValue = b.createdAt.getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [tasks, searchQuery, statusFilter, priorityFilter, projectFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setProjectFilter("all")
  }

  const hasActiveFilters = searchQuery || statusFilter !== "all" || priorityFilter !== "all" || projectFilter !== "all"

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: TaskStatus | "all") => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value: TaskPriority | "all") => setPriorityFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {mockProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="flex-1 bg-transparent">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tasks ({filteredAndSortedTasks.length})</CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {hasActiveFilters ? "No tasks match your filters." : "No tasks found."}
              </div>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">Status</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("title")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Task
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("priority")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Priority
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("dueDate")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Due Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTasks.map((task, index) => {
                    const StatusIcon = statusIcons[task.status]
                    const assignee = mockUsers.find((user) => user.id === task.assigneeId)
                    const project = mockProjects.find((p) => p.id === task.projectId)
                    const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== "done"

                    return (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className={cn("hover:bg-muted/50 cursor-pointer", isOverdue && "bg-destructive/5")}
                        onClick={() => onTaskEdit(task)}
                      >
                        <TableCell>
                          <StatusIcon
                            className={cn(
                              "h-4 w-4",
                              task.status === "done" && "text-green-600",
                              task.status === "in-progress" && "text-blue-600",
                              task.status === "todo" && "text-muted-foreground",
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium line-clamp-1">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">{task.description}</div>
                            )}
                            {task.tags.length > 0 && (
                              <div className="flex gap-1">
                                {task.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                                {task.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    +{task.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={priorityColors[task.priority]}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {task.dueDate ? (
                            <div
                              className={cn(
                                "flex items-center gap-1 text-sm",
                                isOverdue ? "text-destructive" : "text-muted-foreground",
                              )}
                            >
                              {isOverdue && <AlertCircle className="h-3 w-3" />}
                              <Calendar className="h-3 w-3" />
                              {task.dueDate.toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No due date</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {assignee ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                                <AvatarFallback className="text-xs">
                                  {assignee.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {project ? (
                            <Badge variant="outline" style={{ borderColor: project.color }}>
                              {project.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">No project</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onTaskEdit(task)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onTaskDelete(task.id)
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

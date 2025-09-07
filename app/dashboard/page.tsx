"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskCard } from "@/components/task-card"
import { TaskForm } from "@/components/task-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { StatsCards } from "@/components/stats-cards"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { KanbanBoard } from "@/components/kanban-board"
import { CalendarView } from "@/components/calendar-view"
import { ListView } from "@/components/list-view"
import { ActivityFeed } from "@/components/activity-feed"
import { useTasks } from "@/hooks/use-tasks"
import { useAnalytics } from "@/hooks/use-analytics"
import { useRealtime } from "@/contexts/realtime-context"
import { Plus, Search, Filter, BarChart3, List, Kanban, Calendar, Activity, Wifi, WifiOff } from "lucide-react"
import type { Task } from "@/lib/types"

export default function DashboardPage() {
  const { tasks, isLoading, createTask, updateTask, deleteTask, updateTaskStatus } = useTasks()
  const analytics = useAnalytics()
  const { isConnected } = useRealtime()

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">) => {
    await createTask(taskData)
    setIsTaskFormOpen(false)
  }

  const handleUpdateTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData)
      setEditingTask(undefined)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
  }

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="glass-strong border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                Manage your tasks efficiently
                <span className="flex items-center gap-1">
                  {isConnected ? (
                    <>
                      <Wifi className="h-3 w-3 text-green-500" />
                      <span className="text-green-500 text-xs">Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 text-red-500" />
                      <span className="text-red-500 text-xs">Offline</span>
                    </>
                  )}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>

              <Button onClick={() => setIsTaskFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <StatsCards analytics={analytics} />

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="glass">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <Kanban className="h-4 w-4" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Analytics Charts */}
                <div className="xl:col-span-2">
                  <AnalyticsCharts analytics={analytics} />
                </div>

                {/* Activity Feed */}
                <div className="xl:col-span-2">
                  <ActivityFeed />
                </div>
              </div>

              {/* Recent Tasks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Recent Tasks</h2>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.slice(0, 6).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={updateTaskStatus}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="kanban" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Kanban Board</h2>
                  <div className="text-sm text-muted-foreground">Drag and drop tasks between columns</div>
                </div>

                <div className="min-h-[600px]">
                  <KanbanBoard
                    tasks={filteredTasks}
                    onTaskStatusChange={updateTaskStatus}
                    onTaskEdit={handleEditTask}
                    onTaskDelete={handleDeleteTask}
                    onCreateTask={() => setIsTaskFormOpen(true)}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="list" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Task List</h2>
                  <div className="text-sm text-muted-foreground">Advanced filtering and sorting</div>
                </div>

                <ListView
                  tasks={tasks}
                  onTaskEdit={handleEditTask}
                  onTaskDelete={handleDeleteTask}
                  onTaskStatusChange={updateTaskStatus}
                />
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Calendar View</h2>
                  <div className="text-sm text-muted-foreground">View tasks by due date</div>
                </div>

                <CalendarView tasks={tasks} onTaskEdit={handleEditTask} onTaskStatusChange={updateTaskStatus} />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Detailed Analytics</h2>
                <AnalyticsCharts analytics={analytics} />
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Live Activity Feed</h2>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    Real-time collaboration updates
                    {isConnected && <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />}
                  </div>
                </div>

                <div className="max-w-4xl">
                  <ActivityFeed />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Task Form Modals */}
      <TaskForm
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        onSubmit={handleCreateTask}
        isLoading={isLoading}
      />

      <TaskForm
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(undefined)}
        onSubmit={handleUpdateTask}
        isLoading={isLoading}
      />
    </div>
  )
}

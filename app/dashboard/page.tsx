"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import { useSupabaseTasks } from "@/hooks/use-supabase-tasks"
import { useAnalytics } from "@/hooks/use-analytics"
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import {
  Plus,
  Search,
  Filter,
  BarChart3,
  List,
  Kanban,
  Calendar,
  Activity,
  Sparkles,
  Zap,
  AlertCircle,
} from "lucide-react"
import type { Task } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardPage() {
  const { tasks, isLoading, error, createTask, updateTask, deleteTask, updateTaskStatus } = useSupabaseTasks()
  const analytics = useAnalytics()
  const { user } = useSupabaseAuth()

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTasks =
    tasks?.filter(
      (task) =>
        task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task?.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || []

  const handleCreateTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">) => {
    const result = await createTask(taskData)
    if (result) {
      setIsTaskFormOpen(false)
    }
  }

  const handleUpdateTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">) => {
    if (editingTask) {
      const result = await updateTask(editingTask.id, taskData)
      if (result) {
        setEditingTask(undefined)
      }
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
  }

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId)
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-mesh p-6">
        <div className="container mx-auto max-w-2xl">
          <Alert className="border-destructive/50 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. Please try refreshing the page or contact support if the problem persists.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-strong border-b sticky top-0 z-50 backdrop-blur-2xl"
      >
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-background rounded-lg p-2">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  TaskFlow Pro
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">Next-generation task management</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-72 glass border-0 focus:ring-2 focus:ring-primary/20"
                />
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="glass border-0 hover:bg-primary/10 bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setIsTaskFormOpen(true)}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </motion.div>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-6 py-8">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="float"
          >
            <StatsCards analytics={analytics} />
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <TabsList className="glass-strong p-1 h-auto bg-gradient-to-r from-card/50 to-card/30">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="kanban"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <Kanban className="h-4 w-4" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <Calendar className="h-4 w-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <Zap className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <Activity className="h-4 w-4" />
                  Activity
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <AnimatePresence mode="wait">
              <TabsContent value="overview" className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 xl:grid-cols-4 gap-8"
                >
                  <motion.div
                    className="xl:col-span-2 hover-lift"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <AnalyticsCharts analytics={analytics} />
                  </motion.div>

                  <motion.div
                    className="xl:col-span-2 hover-lift"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <ActivityFeed />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      Recent Tasks
                    </h2>
                    <Button variant="outline" size="sm" className="glass border-0 hover:bg-primary/10 bg-transparent">
                      View All
                    </Button>
                  </div>

                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-48 bg-muted/20 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                      {(tasks || []).slice(0, 6).map((task, index) => (
                        <motion.div
                          key={task.id}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                          }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <TaskCard
                            task={task}
                            onStatusChange={updateTaskStatus}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
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
                    </div>
                  </div>

                  <div className="max-w-4xl">
                    <ActivityFeed />
                  </div>
                </div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
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

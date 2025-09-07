"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertTriangle, BarChart3, TrendingUp, TrendingDown, Target } from "lucide-react"
import type { TaskAnalytics } from "@/hooks/use-analytics"
import { cn } from "@/lib/utils"

interface StatsCardsProps {
  analytics: TaskAnalytics
}

export function StatsCards({ analytics }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Tasks",
      value: analytics.totalTasks,
      icon: BarChart3,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "+12%",
      trend: "up" as const,
    },
    {
      label: "In Progress",
      value: analytics.inProgressTasks,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      change: "+5%",
      trend: "up" as const,
    },
    {
      label: "Completed",
      value: analytics.completedTasks,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
      change: "+18%",
      trend: "up" as const,
    },
    {
      label: "Overdue",
      value: analytics.overdueTasks,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-600/10",
      change: "-8%",
      trend: "down" as const,
    },
    {
      label: "Completion Rate",
      value: `${Math.round(analytics.completionRate)}%`,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
      change: "+3%",
      trend: "up" as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="glass hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    stat.trend === "up"
                      ? "text-green-600 bg-green-100 dark:bg-green-900/20"
                      : "text-red-600 bg-red-100 dark:bg-red-900/20",
                  )}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  <span className={stat.color}>{stat.value}</span>
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

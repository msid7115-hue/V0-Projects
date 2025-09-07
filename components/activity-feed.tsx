"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRealtime } from "@/contexts/realtime-context"
import type { RealtimeEvent } from "@/lib/realtime"
import { formatDistanceToNow } from "date-fns"
import { Plus, Trash2, Edit, Users } from "lucide-react"

interface ActivityItem {
  id: string
  type: string
  message: string
  user: string
  timestamp: number
  icon: React.ReactNode
  color: string
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const { subscribe } = useRealtime()

  useEffect(() => {
    // Subscribe to all real-time events
    const unsubscribeTaskCreated = subscribe("task_created", (event: RealtimeEvent) => {
      addActivity({
        id: `${event.timestamp}-created`,
        type: "task_created",
        message: `created task "${event.data.title}"`,
        user: event.data.createdBy || "Unknown User",
        timestamp: event.timestamp,
        icon: <Plus className="h-4 w-4" />,
        color: "bg-green-500",
      })
    })

    const unsubscribeTaskUpdated = subscribe("task_updated", (event: RealtimeEvent) => {
      addActivity({
        id: `${event.timestamp}-updated`,
        type: "task_updated",
        message: `updated task "${event.data.title}"`,
        user: event.data.updatedBy || "Unknown User",
        timestamp: event.timestamp,
        icon: <Edit className="h-4 w-4" />,
        color: "bg-blue-500",
      })
    })

    const unsubscribeTaskDeleted = subscribe("task_deleted", (event: RealtimeEvent) => {
      addActivity({
        id: `${event.timestamp}-deleted`,
        type: "task_deleted",
        message: `deleted task "${event.data.title}"`,
        user: event.data.deletedBy || "Unknown User",
        timestamp: event.timestamp,
        icon: <Trash2 className="h-4 w-4" />,
        color: "bg-red-500",
      })
    })

    const unsubscribeUserJoined = subscribe("user_joined", (event: RealtimeEvent) => {
      addActivity({
        id: `${event.timestamp}-joined`,
        type: "user_joined",
        message: "joined the workspace",
        user: event.data.name || "Unknown User",
        timestamp: event.timestamp,
        icon: <Users className="h-4 w-4" />,
        color: "bg-purple-500",
      })
    })

    return () => {
      unsubscribeTaskCreated()
      unsubscribeTaskUpdated()
      unsubscribeTaskDeleted()
      unsubscribeUserJoined()
    }
  }, [subscribe])

  const addActivity = (activity: ActivityItem) => {
    setActivities((prev) => [activity, ...prev.slice(0, 49)]) // Keep only last 50 activities
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          Live Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
              <div className={`p-2 rounded-full ${activity.color} text-white`}>{activity.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-muted-foreground">{activity.message}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { RealtimeManager, type RealtimeEvent } from "@/lib/realtime"
import { useAuth } from "./auth-context"
import { toast } from "@/hooks/use-toast"

interface RealtimeContextType {
  isConnected: boolean
  subscribe: (eventType: string, callback: (event: RealtimeEvent) => void) => () => void
  emit: (event: RealtimeEvent) => void
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()
  const realtimeManager = RealtimeManager.getInstance()

  useEffect(() => {
    if (user) {
      // Connect to real-time service
      realtimeManager.connect(user.id)

      // Subscribe to connection events
      const unsubscribe = realtimeManager.subscribe("connected", () => {
        setIsConnected(true)
      })

      // Subscribe to notifications
      const unsubscribeNotifications = realtimeManager.subscribe("notification", (event) => {
        toast({
          title: event.data.title,
          description: event.data.message,
        })
      })

      return () => {
        unsubscribe()
        unsubscribeNotifications()
        realtimeManager.disconnect()
        setIsConnected(false)
      }
    }
  }, [user])

  const subscribe = (eventType: string, callback: (event: RealtimeEvent) => void) => {
    return realtimeManager.subscribe(eventType, callback)
  }

  const emit = (event: RealtimeEvent) => {
    realtimeManager.emit(event)
  }

  return <RealtimeContext.Provider value={{ isConnected, subscribe, emit }}>{children}</RealtimeContext.Provider>
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider")
  }
  return context
}

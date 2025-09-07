export interface RealtimeEvent {
  type: "task_created" | "task_updated" | "task_deleted" | "user_joined" | "user_left" | "notification"
  data: any
  timestamp: number
  userId?: string
}

export class RealtimeManager {
  private static instance: RealtimeManager
  private eventSource: EventSource | null = null
  private listeners: Map<string, Set<(event: RealtimeEvent) => void>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager()
    }
    return RealtimeManager.instance
  }

  connect(userId: string) {
    if (this.eventSource) {
      this.disconnect()
    }

    this.eventSource = new EventSource(`/api/realtime?userId=${userId}`)

    this.eventSource.onopen = () => {
      console.log("[v0] Real-time connection established")
      this.reconnectAttempts = 0
    }

    this.eventSource.onmessage = (event) => {
      try {
        const realtimeEvent: RealtimeEvent = JSON.parse(event.data)
        this.notifyListeners(realtimeEvent.type, realtimeEvent)
      } catch (error) {
        console.error("[v0] Error parsing real-time event:", error)
      }
    }

    this.eventSource.onerror = () => {
      console.error("[v0] Real-time connection error")
      this.handleReconnect(userId)
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  private handleReconnect(userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`[v0] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect(userId)
      }, Math.pow(2, this.reconnectAttempts) * 1000)
    }
  }

  subscribe(eventType: string, callback: (event: RealtimeEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(callback)

    return () => {
      const listeners = this.listeners.get(eventType)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(eventType)
        }
      }
    }
  }

  private notifyListeners(eventType: string, event: RealtimeEvent) {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.forEach((callback) => callback(event))
    }
  }

  emit(event: RealtimeEvent) {
    fetch("/api/realtime/emit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }).catch((error) => console.error("[v0] Error emitting real-time event:", error))
  }
}

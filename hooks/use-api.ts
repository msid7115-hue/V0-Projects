"use client"

import { useState, useEffect } from "react"

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl = "/api"
  private token: string | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth-token")
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth-token", token)
      } else {
        localStorage.removeItem("auth-token")
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: "Network error occurred",
      }
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(name: string, email: string, password: string) {
    return this.request<{ user: any; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  }

  async getMe() {
    return this.request<any>("/auth/me")
  }

  // Task methods
  async getTasks() {
    return this.request<any[]>("/tasks")
  }

  async createTask(taskData: any) {
    return this.request<any>("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    })
  }

  async updateTask(id: string, updates: any) {
    return this.request<any>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  async deleteTask(id: string) {
    return this.request<any>(`/tasks/${id}`, {
      method: "DELETE",
    })
  }

  // User methods
  async getUsers() {
    return this.request<any[]>("/users")
  }

  // Project methods
  async getProjects() {
    return this.request<any[]>("/projects")
  }
}

export const apiClient = new ApiClient()

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth-token")
      if (token) {
        apiClient.setToken(token)
        const response = await apiClient.getMe()
        if (response.success) {
          setUser(response.data)
        } else {
          apiClient.setToken(null)
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password)
    if (response.success && response.data) {
      apiClient.setToken(response.data.token)
      setUser(response.data.user)
    }
    return response
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await apiClient.register(name, email, password)
    if (response.success && response.data) {
      apiClient.setToken(response.data.token)
      setUser(response.data.user)
    }
    return response
  }

  const logout = () => {
    apiClient.setToken(null)
    setUser(null)
  }

  return {
    user,
    isLoading,
    login,
    register,
    logout,
  }
}

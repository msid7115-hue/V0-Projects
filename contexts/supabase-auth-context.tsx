"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { User as AppUser } from "@/lib/types"

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) throw error

        if (session?.user) {
          await fetchUserProfile(session.user)
        }
      } catch (error) {
        console.error("[v0] Error getting initial session:", error)
        setError("Failed to initialize authentication")
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state changed:", event)

      if (session?.user) {
        await fetchUserProfile(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", authUser.id).single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error
      }

      const appUser: AppUser = {
        id: authUser.id,
        email: authUser.email || "",
        name: data?.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
        avatar: data?.avatar_url || authUser.user_metadata?.avatar_url,
      }

      setUser(appUser)
    } catch (error) {
      console.error("[v0] Error fetching user profile:", error)
      // Fallback to basic user info
      const appUser: AppUser = {
        id: authUser.id,
        email: authUser.email || "",
        name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
        avatar: authUser.user_metadata?.avatar_url,
      }
      setUser(appUser)
    }
  }

  const signIn = async (email: string, password: string) => {
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return {}
    } catch (error: any) {
      const errorMessage = error.message || "Failed to sign in"
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error
      return {}
    } catch (error: any) {
      const errorMessage = error.message || "Failed to sign up"
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      console.error("[v0] Error signing out:", error)
      setError(error.message || "Failed to sign out")
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, error }}>{children}</AuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider")
  }
  return context
}

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Profile } from "@/types/database"

interface User extends Profile {
  // Extend with any additional fields needed
}

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const isAuthenticated = !!user && !!supabaseUser

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return profile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (!supabaseUser) return
    const profile = await fetchProfile(supabaseUser.id)
    if (profile) {
      setUser(profile)
    }
  }

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser()

        if (error || !authUser) {
          setUser(null)
          setSupabaseUser(null)
        } else {
          setSupabaseUser(authUser)
          const profile = await fetchProfile(authUser.id)
          if (profile) {
            setUser(profile)
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setUser(null)
        setSupabaseUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setSupabaseUser(session.user)
        const profile = await fetchProfile(session.user.id)
        if (profile) {
          setUser(profile)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setSupabaseUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Redirect logic for dashboard routes
  useEffect(() => {
    if (isLoading) return

    const isDashboardRoute = pathname.startsWith("/dashboard") && pathname !== "/dashboard"

    if (isDashboardRoute && !isAuthenticated) {
      // Redirect to login if trying to access dashboard without auth
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, pathname, router])

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        setSupabaseUser(data.user)
        const profile = await fetchProfile(data.user.id)
        if (profile) {
          setUser(profile)
          return {}
        } else {
          return { error: 'Profile not found' }
        }
      }

      return { error: 'Login failed' }
    } catch (error) {
      console.error("Error during login:", error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSupabaseUser(null)
      router.push("/dashboard")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const value: AuthContextType = {
    user,
    supabaseUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser, setCurrentUser } from "@/lib/auth"
import type { User } from "@/types/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User) => void
  logout: () => void
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
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = !!user

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      try {
        const authStatus = localStorage.getItem("dashboard-auth")
        const currentUser = getCurrentUser()

        if (authStatus === "true" && currentUser) {
          setUser(currentUser)
        } else {
          setUser(null)
          // Clear any stale auth data
          localStorage.removeItem("dashboard-auth")
          localStorage.removeItem("current-user")
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Redirect logic for dashboard routes
  useEffect(() => {
    if (isLoading) return

    const isDashboardRoute = pathname.startsWith("/dashboard")

    if (isDashboardRoute && !isAuthenticated) {
      // Redirect to login if trying to access dashboard without auth
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, pathname, router])

  const login = (userData: User) => {
    try {
      localStorage.setItem("dashboard-auth", "true")
      setCurrentUser(userData)
      setUser(userData)
    } catch (error) {
      console.error("Error during login:", error)
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem("dashboard-auth")
      localStorage.removeItem("current-user")
      localStorage.removeItem("selected-business")
      setCurrentUser(null)
      setUser(null)
      router.push("/dashboard")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

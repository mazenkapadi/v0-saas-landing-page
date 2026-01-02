"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types/database"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, companyName: string) => Promise<void>
  logout: () => Promise<void>
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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [useMockAuth, setUseMockAuth] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isAuthenticated = !!user || !!profile

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    }
  }

  // Check and restore session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const timeout = setTimeout(() => {
        console.error('Auth check timed out')
        setUser(null)
        setProfile(null)
        setIsLoading(false)
      }, 5000) // 5 second timeout

      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        clearTimeout(timeout)

        if (error) {
          console.error('Supabase auth error:', error)
          throw error
        }

        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        console.warn('Supabase connection failed, using mock authentication mode')
        setUseMockAuth(true)
        
        // Check for mock auth in localStorage
        const mockAuthStatus = localStorage.getItem('mock-dashboard-auth')
        const mockProfileStr = localStorage.getItem('mock-profile')
        
        if (mockAuthStatus === 'true' && mockProfileStr) {
          try {
            setProfile(JSON.parse(mockProfileStr))
          } catch (e) {
            console.error('Failed to parse mock profile')
          }
        }
        
        setUser(null)
      } finally {
        clearTimeout(timeout)
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    if (useMockAuth) {
      // Mock authentication for development
      const mockProfile: Profile = {
        id: 'mock-user-1',
        email: email,
        name: 'Test User',
        company_name: 'Test Company',
        phone: '+1 234 567 8900',
        address: '123 Test St\nTest City, TS 12345',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      localStorage.setItem('mock-dashboard-auth', 'true')
      localStorage.setItem('mock-profile', JSON.stringify(mockProfile))
      setProfile(mockProfile)
      router.push('/dashboard')
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        setUser(data.user)
        await fetchProfile(data.user.id)
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Failed to login')
    }
  }

  const signup = async (email: string, password: string, name: string, companyName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            company_name: companyName,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        // Profile is auto-created by database trigger
        setUser(data.user)
        
        // Wait a bit for trigger to complete, then fetch profile
        await new Promise(resolve => setTimeout(resolve, 500))
        await fetchProfile(data.user.id)
        
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      throw new Error(error.message || 'Failed to sign up')
    }
  }

  const logout = async () => {
    if (useMockAuth) {
      localStorage.removeItem('mock-dashboard-auth')
      localStorage.removeItem('mock-profile')
      setProfile(null)
      router.push('/dashboard')
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setProfile(null)
      router.push('/dashboard')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

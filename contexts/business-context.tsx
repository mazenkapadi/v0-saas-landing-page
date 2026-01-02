"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  getCurrentUser,
  getCurrentBusiness,
  setCurrentBusiness,
  getUserAccessibleBusinesses,
  businessProfiles,
} from "@/lib/auth"
import type { User, Business } from "@/types/auth"

interface BusinessContextType {
  currentBusiness: string
  currentUser: User | null
  availableBusinesses: Business[]
  isLoading: boolean
  switchBusiness: (businessId: string) => void
  refreshBusinessData: () => void
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider")
  }
  return context
}

interface BusinessProviderProps {
  children: ReactNode
}

export function BusinessProvider({ children }: BusinessProviderProps) {
  const [currentBusiness, setCurrentBusinessState] = useState<string>("")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [availableBusinesses, setAvailableBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadBusinessData = () => {
    try {
      const user = getCurrentUser()
      const business = getCurrentBusiness()

      setCurrentUser(user)
      setCurrentBusinessState(business)

      if (user) {
        const accessibleBusinessIds = getUserAccessibleBusinesses(user)
        const businesses = accessibleBusinessIds.map((id) => businessProfiles[id]).filter(Boolean)
        setAvailableBusinesses(businesses)
      } else {
        setAvailableBusinesses([])
      }
    } catch (error) {
      console.error("Error loading business data:", error)
      setCurrentUser(null)
      setAvailableBusinesses([])
    } finally {
      setIsLoading(false)
    }
  }

  const switchBusiness = (businessId: string) => {
    if (businessId === currentBusiness) return

    try {
      setCurrentBusiness(businessId)
      setCurrentBusinessState(businessId)

      // Trigger a custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("businessChanged", {
          detail: { businessId },
        }),
      )
    } catch (error) {
      console.error("Error switching business:", error)
    }
  }

  const refreshBusinessData = () => {
    loadBusinessData()
  }

  useEffect(() => {
    loadBusinessData()
  }, [])

  // Listen for storage changes (for cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selected-business" || e.key === "current-user") {
        loadBusinessData()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const value: BusinessContextType = {
    currentBusiness,
    currentUser,
    availableBusinesses,
    isLoading,
    switchBusiness,
    refreshBusinessData,
  }

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}

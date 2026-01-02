"use client"

import { useState, useEffect } from "react"
import { useBusiness } from "@/contexts/business-context"

export function useBusinessData<T>(fetchFunction: (businessId: string) => T, dependencies: any[] = []) {
  const { currentBusiness } = useBusiness()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!currentBusiness) {
      setData(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const result = fetchFunction(currentBusiness)
      setData(result)
    } catch (error) {
      console.error("Error fetching business data:", error)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [currentBusiness, fetchFunction, ...dependencies])

  // Listen for business changes
  useEffect(() => {
    const handleBusinessChange = () => {
      if (currentBusiness) {
        try {
          const result = fetchFunction(currentBusiness)
          setData(result)
        } catch (error) {
          console.error("Error refreshing business data:", error)
        }
      }
    }

    window.addEventListener("businessChanged", handleBusinessChange)
    return () => window.removeEventListener("businessChanged", handleBusinessChange)
  }, [currentBusiness, fetchFunction])

  return {
    data,
    isLoading,
    refresh: () => {
      if (currentBusiness) {
        const result = fetchFunction(currentBusiness)
        setData(result)
      }
    },
  }
}

"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { BusinessProvider } from "@/contexts/business-context"
import LoginForm from "@/components/login-form"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <BusinessProvider>{children}</BusinessProvider>
}

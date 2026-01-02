"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import LoginForm from "@/components/login-form"
import DashboardLayoutComponent from "@/components/dashboard-layout"

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

  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>
}

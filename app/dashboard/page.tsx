"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, TrendingUp, DollarSign, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/contexts/auth-context"
import type { InvoiceWithDetails } from "@/types/database"

export default function DashboardPage() {
  const { profile, isAuthenticated, isLoading } = useAuth()
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Not authenticated, stay on login page
      return
    }
    if (isAuthenticated) {
      fetchInvoices()
    }
  }, [isAuthenticated, isLoading])

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices")
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please log in</h1>
          <p className="text-muted-foreground">You need to be authenticated to access the dashboard</p>
        </div>
      </div>
    )
  }

  // Helper function to check if invoice is overdue
  const isInvoiceOverdue = (invoice: InvoiceWithDetails) => {
    if (invoice.status === "paid" || invoice.status === "cancelled") return false
    return new Date(invoice.due_date) < new Date()
  }

  // Calculate metrics
  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0)
  
  const pendingInvoices = invoices.filter((inv) => 
    inv.status === "sent" && !isInvoiceOverdue(inv)
  )
  const overdueInvoices = invoices.filter((inv) => 
    inv.status === "overdue" || isInvoiceOverdue(inv)
  )
  const paidInvoices = invoices.filter((inv) => inv.status === "paid")
  
  const pendingRevenue = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const overdueRevenue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0)
  
  const recentInvoices = [...invoices].sort(
    (a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
  ).slice(0, 5)

  const getInvoiceStatus = (invoice: InvoiceWithDetails) => {
    if (isInvoiceOverdue(invoice)) return "overdue"
    return invoice.status
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "sent":
        return "secondary"
      case "overdue":
        return "destructive"
      case "draft":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="p-6">
        <div className="max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {profile?.name}! Here's your business overview.</p>
            </div>
            <Button asChild>
              <Link href="/dashboard/invoice-generator">
                <Plus className="size-4 mr-2" />
                New Invoice
              </Link>
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">From paid invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${pendingRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{pendingInvoices.length} pending invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${overdueRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{overdueInvoices.length} overdue invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invoices.length}</div>
                <p className="text-xs text-muted-foreground">{paidInvoices.length} paid</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Invoices</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/invoices">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingInvoices ? (
                <div className="text-center py-8">Loading...</div>
              ) : recentInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No invoices yet. Create your first invoice to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Link 
                            href={`/dashboard/invoices/${invoice.id}`}
                            className="font-medium hover:underline"
                          >
                            {invoice.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.client?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {invoice.client?.company_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(invoice.issue_date).toLocaleDateString()}</TableCell>
                        <TableCell>${invoice.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(getInvoiceStatus(invoice))}>
                            {getInvoiceStatus(invoice)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  )
}

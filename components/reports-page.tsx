"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LogOut,
  FileText,
  BarChart,
  Users,
  Home,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import BusinessSelector from "@/components/business-selector"
import { getUserRoleInBusiness, businessProfiles, isSuperAdmin, hasPermission } from "@/lib/auth"
import { getInvoicesForBusiness } from "@/lib/invoices"
import { useAuth } from "@/contexts/auth-context"
import { useBusiness } from "@/contexts/business-context"
import { useBusinessData } from "@/hooks/use-business-data"

export default function ReportsPage() {
  const { user, logout } = useAuth()
  const { currentBusiness } = useBusiness()
  const { data: invoices } = useBusinessData(getInvoicesForBusiness)

  const [timeRange, setTimeRange] = useState("30")
  const [reportType, setReportType] = useState("overview")

  const userRole = getUserRoleInBusiness(user, currentBusiness)
  const isCurrentUserSuperAdmin = isSuperAdmin(user)
  const canViewReports = hasPermission(user, "canViewReports", currentBusiness)
  const canManageUsers = hasPermission(user, "canManageUsers", currentBusiness)

  // Check if user has access to reports
  if (!canViewReports) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to view reports. Contact your administrator for access.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate metrics
  const totalRevenue = invoices?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0
  const paidInvoices = invoices?.filter((invoice) => invoice.status === "paid") || []
  const pendingInvoices = invoices?.filter((invoice) => invoice.status === "pending") || []
  const overdueInvoices = invoices?.filter((invoice) => invoice.status === "overdue") || []

  const paidRevenue = paidInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
  const pendingRevenue = pendingInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)
  const overdueRevenue = overdueInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0)

  const averageInvoiceValue = invoices?.length ? totalRevenue / invoices.length : 0
  const paymentRate = invoices?.length ? (paidInvoices.length / invoices.length) * 100 : 0

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Sidebar */}
      <div className="w-56 bg-background border-r flex flex-col fixed left-0 top-0 h-screen z-10">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 font-bold">
            <div className="size-7 rounded-lg bg-foreground flex items-center justify-center text-background">Z</div>
            <span>ZaytoonTech</span>
          </div>
        </div>
        <div className="p-3 border-b relative z-40">
          <BusinessSelector />
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Home className="size-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <FileText className="size-4" />
            Invoices
          </Link>
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium bg-muted text-foreground"
          >
            <BarChart className="size-4" />
            Reports
          </Link>
          {canManageUsers && (
            <Link
              href="/dashboard/users"
              className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Users className="size-4" />
              User Management
            </Link>
          )}
        </nav>
        <div className="p-3 border-t">
          {user && (
            <div className="mb-3 p-2 bg-muted/50 rounded-md">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {isCurrentUserSuperAdmin ? "Super Admin" : userRole || "No access"}
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start">
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 ml-56">
        <div className="max-w-7xl">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Business Reports</h1>
              <p className="text-muted-foreground">
                Analytics and insights for {businessProfiles[currentBusiness]?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="size-4 mr-2" />
                Export
              </Button>
            </div>
          </header>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="size-3 mr-1" />
                    +12.5%
                  </span>
                  from last period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${paidRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{paidInvoices.length} paid invoices</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">${pendingRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{pendingInvoices.length} pending invoices</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Revenue</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${overdueRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{overdueInvoices.length} overdue invoices</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Average Invoice Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${averageInvoiceValue.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Per invoice</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{paymentRate.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground">Invoices paid on time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{invoices?.length || 0}</div>
                <p className="text-sm text-muted-foreground">This period</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Invoices Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Invoices</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="size-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices?.slice(0, 10).map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell>${invoice.total?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "default"
                              : invoice.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <BarChart className="size-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No invoices found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

"use client"

import Link from "next/link"
import {
  LogOut,
  FileText,
  BarChart,
  Users,
  Home,
  Plus,
  TrendingUp,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import BusinessSelector from "@/components/business-selector"
import { getUserRoleInBusiness, isSuperAdmin } from "@/lib/auth"
import { getInvoicesForBusiness } from "@/lib/invoices"
import { useAuth } from "@/contexts/auth-context"
import { useBusiness } from "@/contexts/business-context"
import { useBusinessData } from "@/hooks/use-business-data"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { currentBusiness, isLoading } = useBusiness()
  const { data: invoices } = useBusinessData(getInvoicesForBusiness)

  const userRole = getUserRoleInBusiness(user, currentBusiness)
  const isCurrentUserSuperAdmin = isSuperAdmin(user)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Calculate dashboard metrics
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const thisMonthInvoices =
    invoices?.filter((invoice) => {
      const invoiceDate = new Date(invoice.date)
      return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear
    }) || []

  const lastMonthInvoices =
    invoices?.filter((invoice) => {
      const invoiceDate = new Date(invoice.date)
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
      return invoiceDate.getMonth() === lastMonth && invoiceDate.getFullYear() === lastMonthYear
    }) || []

  const totalRevenue = invoices?.reduce((sum, invoice) => sum + (invoice.status === "paid" ? invoice.total : 0), 0) || 0
  const thisMonthRevenue = thisMonthInvoices.reduce(
    (sum, invoice) => sum + (invoice.status === "paid" ? invoice.total : 0),
    0,
  )
  const lastMonthRevenue = lastMonthInvoices.reduce(
    (sum, invoice) => sum + (invoice.status === "paid" ? invoice.total : 0),
    0,
  )
  const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

  const pendingInvoices = invoices?.filter((invoice) => invoice.status === "pending") || []
  const overdueInvoices = invoices?.filter((invoice) => invoice.status === "overdue") || []
  const recentInvoices = invoices?.slice(0, 5) || []

  const pendingRevenue = pendingInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const overdueRevenue = overdueInvoices.reduce((sum, invoice) => sum + invoice.total, 0)

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-300/50",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-300/50",
      overdue: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-300/50",
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 border-gray-300/50",
    }

    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants] || variants.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

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
            className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium bg-muted text-foreground"
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
          {(userRole === "owner" || isCurrentUserSuperAdmin) && (
            <>
              <Link
                href="/dashboard/reports"
                className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <BarChart className="size-4" />
                Reports
              </Link>
              <Link
                href="/dashboard/users"
                className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Users className="size-4" />
                User Management
              </Link>
            </>
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
      <main className="flex-1 p-6 ml-56">
        <div className="max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.name}! Here's your business overview.</p>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/dashboard/invoice-generator">
                  <Plus className="size-4 mr-2" />
                  New Invoice
                </Link>
              </Button>
            </div>
          </div>

          {userRole ? (
            <>
              {/* Key Metrics */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <TrendingUp className="size-3 mr-1" />
                      {revenueGrowth >= 0 ? "+" : ""}
                      {revenueGrowth.toFixed(1)}% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">${pendingRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      {pendingInvoices.length} pending invoice{pendingInvoices.length !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue Revenue</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">${overdueRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      {overdueInvoices.length} overdue invoice{overdueInvoices.length !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${thisMonthRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      {thisMonthInvoices.length} invoice{thisMonthInvoices.length !== 1 ? "s" : ""} this month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Action Items & Recent Activity */}
              <div className="grid gap-6 lg:grid-cols-2 mb-6">
                {/* Action Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="size-5 text-orange-500" />
                      Action Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {overdueInvoices.length > 0 && (
                      <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <XCircle className="size-5 text-red-500" />
                          <div>
                            <p className="font-medium text-sm">Overdue Invoices</p>
                            <p className="text-xs text-muted-foreground">
                              {overdueInvoices.length} invoice{overdueInvoices.length !== 1 ? "s" : ""} need attention
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/dashboard/invoices?status=overdue">Review</Link>
                        </Button>
                      </div>
                    )}

                    {pendingInvoices.length > 0 && (
                      <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="size-5 text-yellow-500" />
                          <div>
                            <p className="font-medium text-sm">Pending Payments</p>
                            <p className="text-xs text-muted-foreground">
                              ${pendingRevenue.toFixed(2)} awaiting payment
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/dashboard/invoices?status=pending">Follow Up</Link>
                        </Button>
                      </div>
                    )}

                    {overdueInvoices.length === 0 && pendingInvoices.length === 0 && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <CheckCircle className="size-5 text-green-500" />
                        <div>
                          <p className="font-medium text-sm">All caught up!</p>
                          <p className="text-xs text-muted-foreground">No urgent actions required</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payment Success Rate</span>
                        <span className="font-medium">
                          {invoices && invoices.length > 0
                            ? Math.round((invoices.filter((i) => i.status === "paid").length / invoices.length) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          invoices && invoices.length > 0
                            ? (invoices.filter((i) => i.status === "paid").length / invoices.length) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Invoice Value</span>
                        <span className="font-medium">
                          $
                          {invoices && invoices.length > 0
                            ? (invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {invoices?.filter((i) => i.status === "paid").length || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Paid</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{pendingInvoices.length}</div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{overdueInvoices.length}</div>
                        <div className="text-xs text-muted-foreground">Overdue</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Invoices */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Invoices</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/invoices">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentInvoices.length > 0 ? (
                        recentInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.id}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{invoice.clientName}</div>
                                <div className="text-sm text-muted-foreground">{invoice.clientBusiness}</div>
                              </div>
                            </TableCell>
                            <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                            <TableCell className="text-right font-medium">${invoice.total.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="size-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="size-8 text-muted-foreground" />
                              <p className="text-muted-foreground">No invoices yet</p>
                              <Button asChild size="sm">
                                <Link href="/dashboard/invoice-generator">Create your first invoice</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">No Access</h2>
              <p className="text-muted-foreground">
                You don't have access to the current business. Please contact your administrator.
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

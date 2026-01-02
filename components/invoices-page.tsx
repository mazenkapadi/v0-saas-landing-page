"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LogOut,
  FileText,
  BarChart,
  Users,
  Home,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import BusinessSelector from "@/components/business-selector"
import { getUserRoleInBusiness, businessProfiles, isSuperAdmin, hasPermission } from "@/lib/auth"
import { getInvoicesForBusiness } from "@/lib/invoices"
import { useAuth } from "@/contexts/auth-context"
import { useBusiness } from "@/contexts/business-context"
import { useBusinessData } from "@/hooks/use-business-data"

export default function InvoicesPage() {
  const { user, logout } = useAuth()
  const { currentBusiness } = useBusiness()
  const { data: invoices } = useBusinessData(getInvoicesForBusiness)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const userRole = getUserRoleInBusiness(user, currentBusiness)
  const isCurrentUserSuperAdmin = isSuperAdmin(user)
  const canCreateInvoices = hasPermission(user, "canCreateInvoices", currentBusiness)
  const canEditAllInvoices = hasPermission(user, "canEditAllInvoices", currentBusiness)
  const canDeleteInvoices = hasPermission(user, "canDeleteInvoices", currentBusiness)
  const canViewReports = hasPermission(user, "canViewReports", currentBusiness)
  const canManageUsers = hasPermission(user, "canManageUsers", currentBusiness)

  // Filter invoices based on search and status
  const filteredInvoices =
    invoices?.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

      return matchesSearch && matchesStatus
    }) || []

  // Calculate metrics
  const totalInvoices = invoices?.length || 0
  const paidInvoices = invoices?.filter((invoice) => invoice.status === "paid").length || 0
  const pendingInvoices = invoices?.filter((invoice) => invoice.status === "pending").length || 0
  const overdueInvoices = invoices?.filter((invoice) => invoice.status === "overdue").length || 0

  const totalRevenue = invoices?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0

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
            className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium bg-muted text-foreground"
          >
            <FileText className="size-4" />
            Invoices
          </Link>
          {canViewReports && (
            <Link
              href="/dashboard/reports"
              className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <BarChart className="size-4" />
              Reports
            </Link>
          )}
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
              <h1 className="text-3xl font-bold">Invoices</h1>
              <p className="text-muted-foreground">Manage invoices for {businessProfiles[currentBusiness]?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Download className="size-4 mr-2" />
                Export
              </Button>
              {canCreateInvoices && (
                <Button asChild>
                  <Link href="/dashboard/invoice-generator">
                    <Plus className="size-4 mr-2" />
                    Create Invoice
                  </Link>
                </Button>
              )}
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInvoices}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <div className="h-4 w-4 rounded-full bg-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{paidInvoices}</div>
                <p className="text-xs text-muted-foreground">Completed payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <div className="h-4 w-4 rounded-full bg-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingInvoices}</div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <div className="h-4 w-4 rounded-full bg-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{overdueInvoices}</div>
                <p className="text-xs text-muted-foreground">Past due date</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="size-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
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
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="size-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              {(canEditAllInvoices || invoice.createdBy === user?.id) && (
                                <DropdownMenuItem>
                                  <Edit className="size-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Download className="size-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {canDeleteInvoices && (
                                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                  <Trash2 className="size-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="size-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No invoices found</p>
                          {canCreateInvoices && (
                            <Button asChild size="sm">
                              <Link href="/dashboard/invoice-generator">Create your first invoice</Link>
                            </Button>
                          )}
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

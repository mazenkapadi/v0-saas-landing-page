"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  LogOut,
  FileText,
  BarChart,
  Users,
  Home,
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  User,
  Crown,
  UserX,
  UserCheck,
  MoreHorizontal,
  Phone,
  Mail,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import BusinessSelector from "@/components/business-selector"
import EnhancedUserDialog from "@/components/enhanced-user-dialog"
import {
  getUserRoleInBusiness,
  businessProfiles,
  addUser,
  updateUser,
  deleteUser as deleteUserFromAuth,
  getAllUsers,
  isSuperAdmin,
  getUserAccessibleBusinesses,
  getUsersForBusiness,
  toggleUserStatus,
  hasPermission,
} from "@/lib/auth"
import { getInvoicesForBusiness } from "@/lib/invoices"
import { useAuth } from "@/contexts/auth-context"
import { useBusiness } from "@/contexts/business-context"
import { useBusinessData } from "@/hooks/use-business-data"
import type { User as UserType } from "@/types/auth"

export default function UsersPage() {
  const { user, logout } = useAuth()
  const { currentBusiness, refreshBusinessData } = useBusiness()

  // Use getAllUsers for super admins, getUsersForBusiness for others
  const shouldShowAllUsers = isSuperAdmin(user)
  const { data: allUsers, refresh: refreshUsers } = useBusinessData(
    shouldShowAllUsers ? () => getAllUsers() : getUsersForBusiness,
  )
  const { data: invoices } = useBusinessData(getInvoicesForBusiness)

  // Memoize the filtered users to prevent infinite re-renders
  const users = useMemo(() => {
    if (!allUsers) return []

    if (shouldShowAllUsers) {
      // Super admins see all users including themselves
      return allUsers
    } else {
      // Regular users see all non-super admin users, but if they are a super admin, they should still see themselves
      return allUsers.filter((u) => !isSuperAdmin(u) || u.id === user?.id)
    }
  }, [allUsers, shouldShowAllUsers, user?.id])

  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")

  const userRole = getUserRoleInBusiness(user, currentBusiness)
  const isCurrentUserSuperAdmin = isSuperAdmin(user)
  const canManageUsers = hasPermission(user, "canManageUsers", currentBusiness)

  useEffect(() => {
    if (!users || users.length === 0) {
      setFilteredUsers([])
      return
    }

    let filtered = [...users] // Create a copy to avoid mutations

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by role
    if (roleFilter !== "all") {
      if (roleFilter === "super_admin") {
        filtered = filtered.filter((user) => isSuperAdmin(user))
      } else {
        filtered = filtered.filter((user) => getUserRoleInBusiness(user, currentBusiness) === roleFilter)
      }
    }

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter((user) => user.isActive !== false)
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter((user) => user.isActive === false)
      }
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter, currentBusiness])

  const handleCreateUser = () => {
    if (!canManageUsers) return
    setEditingUser(null)
    setDialogMode("create")
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: UserType) => {
    if (!canManageUsers) return
    setEditingUser(user)
    setDialogMode("edit")
    setIsDialogOpen(true)
  }

  const handleSaveUser = (userData: Partial<UserType>) => {
    if (!canManageUsers) return

    if (dialogMode === "create") {
      addUser(userData as UserType)
    } else if (editingUser) {
      updateUser(editingUser.id, userData)
    }

    refreshUsers()
    refreshBusinessData()
  }

  const handleDeleteUser = (userId: string) => {
    if (!canManageUsers) return
    deleteUserFromAuth(userId)
    refreshUsers()
    refreshBusinessData()
  }

  const handleToggleUserStatus = (userId: string) => {
    if (!canManageUsers) return
    toggleUserStatus(userId)
    refreshUsers()
  }

  const getUserInvoiceStats = (userId: string) => {
    if (!invoices) return { total: 0, revenue: 0 }
    const userInvoices = invoices.filter((invoice) => invoice.createdBy === userId)
    return {
      total: userInvoices.length,
      revenue: userInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0),
    }
  }

  const getRoleBadges = (user: UserType) => {
    const badges = []

    // Super admins only get the Super Admin badge
    if (isSuperAdmin(user)) {
      badges.push(
        <Badge
          key="super"
          variant="outline"
          className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300/50"
        >
          <Crown className="size-3 mr-1" />
          Super Admin
        </Badge>,
      )
      return badges
    }

    // Regular users get business role badges
    const accessibleBusinesses = getUserAccessibleBusinesses(user)
    accessibleBusinesses.forEach((businessId) => {
      const role = getUserRoleInBusiness(user, businessId)
      const business = businessProfiles[businessId]
      if (role && business) {
        badges.push(
          <Badge
            key={businessId}
            variant="outline"
            className={
              role === "owner"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300/50"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 border-gray-300/50"
            }
          >
            {business.logo} {role}
          </Badge>,
        )
      }
    })

    return badges
  }

  const getDepartmentBadge = (department?: string) => {
    if (!department) return null

    const colors = {
      engineering: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
      sales: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
      marketing: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
      finance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
      operations: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
      hr: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
      support: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
      executive: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    }

    return (
      <Badge
        variant="outline"
        className={
          colors[department as keyof typeof colors] ||
          "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300"
        }
      >
        {department.charAt(0).toUpperCase() + department.slice(1)}
      </Badge>
    )
  }

  // Check if user has access to user management
  if (!canManageUsers) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to manage users. Contact your administrator for access.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const ownerCount = filteredUsers.filter((u) => Object.values(u.businessRoles || {}).includes("owner")).length
  const employeeCount = filteredUsers.filter(
    (u) => Object.values(u.businessRoles || {}).includes("employee") && !isSuperAdmin(u),
  ).length
  const superAdminCount = filteredUsers.filter((u) => isSuperAdmin(u)).length
  const activeCount = filteredUsers.filter((u) => u.isActive !== false).length

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
          {hasPermission(user, "canViewReports", currentBusiness) && (
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
              className="flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium bg-muted text-foreground"
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
              <h1 className="text-3xl font-bold">Team Management</h1>
              <p className="text-muted-foreground">
                {isCurrentUserSuperAdmin
                  ? "Manage all users across all businesses"
                  : `Manage team members for ${businessProfiles[currentBusiness]?.name}`}
              </p>
            </div>
            <Button onClick={handleCreateUser} className="bg-primary hover:bg-primary/90" disabled={!canManageUsers}>
              <Plus className="size-4 mr-2" />
              Add Team Member
            </Button>
          </header>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredUsers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeCount} active, {filteredUsers.length - activeCount} inactive
                </p>
              </CardContent>
            </Card>
            {isCurrentUserSuperAdmin && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{superAdminCount}</div>
                  <p className="text-xs text-muted-foreground">System administrators</p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Business Owners</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{ownerCount}</div>
                <p className="text-xs text-muted-foreground">Full business access</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{employeeCount}</div>
                <p className="text-xs text-muted-foreground">Team members</p>
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
                    placeholder="Search by name, email, title, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {isCurrentUserSuperAdmin && <SelectItem value="super_admin">Super Admins</SelectItem>}
                    <SelectItem value="owner">Owners</SelectItem>
                    <SelectItem value="employee">Employees</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Business Access</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((userItem) => {
                      return (
                        <TableRow key={userItem.id} className={userItem.isActive === false ? "opacity-60" : ""}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium relative">
                                {userItem.name.charAt(0)}
                                {userItem.isActive === false && (
                                  <div className="absolute -bottom-1 -right-1 size-4 rounded-full bg-red-500 flex items-center justify-center">
                                    <UserX className="size-2 text-white" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {userItem.name}
                                  {userItem.isActive === false && (
                                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">{userItem.title || "No title"}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="size-3 text-muted-foreground" />
                                {userItem.email}
                              </div>
                              {userItem.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="size-3" />
                                  {userItem.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">{getRoleBadges(userItem)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {userItem.lastLogin && (
                                <div className="text-xs text-muted-foreground">
                                  {new Date(userItem.lastLogin).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={!canManageUsers}>
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditUser(userItem)} disabled={!canManageUsers}>
                                  <Edit2 className="size-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleToggleUserStatus(userItem.id)}
                                  disabled={!canManageUsers}
                                >
                                  {userItem.isActive !== false ? (
                                    <>
                                      <UserX className="size-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="size-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      disabled={userItem.id === user?.id || !canManageUsers}
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <Trash2 className="size-4 mr-2" />
                                      Delete User
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the user account for{" "}
                                        <span className="font-semibold">{userItem.name}</span> and remove all associated
                                        data.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteUser(userItem.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete User
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="size-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No users found</p>
                          {canManageUsers && (
                            <Button onClick={handleCreateUser} size="sm">
                              Add your first team member
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

      <EnhancedUserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
        mode={dialogMode}
      />
    </div>
  )
}

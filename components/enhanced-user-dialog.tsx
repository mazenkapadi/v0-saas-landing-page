"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Plus, X, Building2, User, Crown, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getAllBusinesses, isSuperAdmin, addBusiness, getUserAccessibleBusinesses } from "@/lib/auth"
import { useBusiness } from "@/contexts/business-context"
import { useAuth } from "@/contexts/auth-context"
import type { Business } from "@/types/auth"

interface EnhancedUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: Partial<any>) => void
  editingUser?: any | null
  mode: "create" | "edit"
}

export default function EnhancedUserDialog({ isOpen, onClose, onSave, editingUser, mode }: EnhancedUserDialogProps) {
  const { user: currentUser } = useAuth()
  const { currentBusiness } = useBusiness()

  // Basic Information
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formTitle, setFormTitle] = useState("")
  const [formDepartment, setFormDepartment] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [isActive, setIsActive] = useState(true)

  // Roles and Permissions
  const [businessRoles, setBusinessRoles] = useState<Record<string, "owner" | "employee" | null>>({})
  const [globalRole, setGlobalRole] = useState<"super_admin" | null>(null)
  const [permissions, setPermissions] = useState({
    canCreateInvoices: true,
    canEditAllInvoices: false,
    canDeleteInvoices: false,
    canViewReports: false,
    canManageUsers: false,
    canManageSettings: false,
  })

  // New business creation
  const [isAddingBusiness, setIsAddingBusiness] = useState(false)
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    id: "",
    email: "",
    phone: "",
    address: "",
    logo: "",
    prefix: "",
    website: "",
    taxId: "",
    industry: "",
  })

  const [formError, setFormError] = useState("")
  const [activeTab, setActiveTab] = useState("basic")

  const allBusinesses = getAllBusinesses()
  const isCurrentUserSuperAdmin = isSuperAdmin(currentUser)

  // Get businesses the current user can manage
  const currentUserAccessibleBusinesses = getUserAccessibleBusinesses(currentUser)
  const managedBusinesses = isCurrentUserSuperAdmin
    ? allBusinesses
    : allBusinesses.filter((business) => currentUserAccessibleBusinesses.includes(business.id))

  // Initialize form when editing
  useEffect(() => {
    if (mode === "edit" && editingUser) {
      setFormName(editingUser.name || "")
      setFormEmail(editingUser.email || "")
      setFormPhone(editingUser.phone || "")
      setFormTitle(editingUser.title || "")
      setFormDepartment(editingUser.department || "")
      setFormNotes(editingUser.notes || "")
      setIsActive(editingUser.isActive !== false)
      setBusinessRoles(editingUser.businessRoles || {})
      setGlobalRole(editingUser.globalRole || null)
      setPermissions(
        editingUser.permissions || {
          canCreateInvoices: true,
          canEditAllInvoices: false,
          canDeleteInvoices: false,
          canViewReports: false,
          canManageUsers: false,
          canManageSettings: false,
        },
      )
    } else {
      resetForm()
    }
  }, [mode, editingUser, isOpen])

  const resetForm = () => {
    setFormName("")
    setFormEmail("")
    setFormPhone("")
    setFormTitle("")
    setFormDepartment("")
    setFormNotes("")
    setIsActive(true)
    setBusinessRoles({})
    setGlobalRole(null)
    setPermissions({
      canCreateInvoices: true,
      canEditAllInvoices: false,
      canDeleteInvoices: false,
      canViewReports: false,
      canManageUsers: false,
      canManageSettings: false,
    })
    setFormError("")
    setIsAddingBusiness(false)
    setNewBusiness({
      name: "",
      id: "",
      email: "",
      phone: "",
      address: "",
      logo: "",
      prefix: "",
      website: "",
      taxId: "",
      industry: "",
    })
    setActiveTab("basic")
  }

  const validateForm = () => {
    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Name and email are required.")
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      setFormError("Please enter a valid email address.")
      return false
    }

    const hasAnyRole = Object.values(businessRoles).some((role) => role !== null) || globalRole === "super_admin"
    if (!hasAnyRole) {
      setFormError("User must have at least one role assigned.")
      return false
    }

    setFormError("")
    return true
  }

  const canAssignRole = (businessId: string, role: "owner" | "employee") => {
    if (isCurrentUserSuperAdmin) {
      return true // Super admins can assign any role
    }

    if (role === "owner") {
      return false // Only super admins can create owners
    }

    // Check if current user has access to this business
    return currentUserAccessibleBusinesses.includes(businessId)
  }

  const handleBusinessRoleChange = (businessId: string, role: "owner" | "employee" | null) => {
    // Check permissions before allowing the change
    if (role && !canAssignRole(businessId, role)) {
      setFormError("You don't have permission to assign this role.")
      return
    }

    setBusinessRoles((prev) => ({
      ...prev,
      [businessId]: role,
    }))

    // Auto-adjust permissions based on role
    if (role === "owner") {
      setPermissions((prev) => ({
        ...prev,
        canEditAllInvoices: true,
        canDeleteInvoices: true,
        canViewReports: true,
        canManageUsers: true,
        canManageSettings: true,
      }))
    } else if (role === "employee") {
      setPermissions((prev) => ({
        ...prev,
        canEditAllInvoices: false,
        canDeleteInvoices: false,
        canViewReports: false,
        canManageUsers: false,
        canManageSettings: false,
      }))
    }
  }

  const handleAddBusiness = () => {
    if (!newBusiness.name || !newBusiness.id || !newBusiness.email) {
      setFormError("Business name, ID, and email are required.")
      return
    }

    if (allBusinesses.some((b) => b.id === newBusiness.id)) {
      setFormError("Business ID already exists.")
      return
    }

    const businessToAdd: Business = {
      id: newBusiness.id,
      name: newBusiness.name,
      email: newBusiness.email,
      phone: newBusiness.phone,
      address: newBusiness.address,
      logo: newBusiness.logo || newBusiness.name.charAt(0).toUpperCase(),
      prefix: newBusiness.prefix || newBusiness.id.toUpperCase().slice(0, 2),
      website: newBusiness.website,
      taxId: newBusiness.taxId,
      industry: newBusiness.industry,
    }

    addBusiness(businessToAdd)
    setIsAddingBusiness(false)
    setNewBusiness({
      name: "",
      id: "",
      email: "",
      phone: "",
      address: "",
      logo: "",
      prefix: "",
      website: "",
      taxId: "",
      industry: "",
    })
    setFormError("")
  }

  const handleSave = () => {
    if (!validateForm()) return

    const userData: Partial<any> = {
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      title: formTitle.trim(),
      department: formDepartment.trim(),
      notes: formNotes.trim(),
      isActive,
      businessRoles,
      globalRole,
      permissions,
    }

    if (mode === "create") {
      userData.id = `user-${Date.now()}`
      userData.createdAt = new Date().toISOString().split("T")[0]
      userData.lastLogin = null
    }

    onSave(userData)
    onClose()
    resetForm()
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  const getPermissionDescription = (permission: string) => {
    const descriptions = {
      canCreateInvoices: "Create new invoices and quotes",
      canEditAllInvoices: "Edit any invoice in the business (not just own)",
      canDeleteInvoices: "Delete invoices permanently",
      canViewReports: "Access business reports and analytics",
      canManageUsers: "Add, edit, and remove team members",
      canManageSettings: "Modify business settings and preferences",
    }
    return descriptions[permission as keyof typeof descriptions] || ""
  }

  const getRoleOptions = (businessId: string) => {
    const options = [
      { value: "none", label: "No Access", disabled: false },
      { value: "employee", label: "Employee", disabled: !canAssignRole(businessId, "employee") },
      { value: "owner", label: "Owner", disabled: !canAssignRole(businessId, "owner") },
    ]

    return options
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "create" ? (
              <>
                <User className="size-5" />
                Add New Team Member
              </>
            ) : (
              <>
                <User className="size-5" />
                Edit Team Member
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new user account with appropriate business access and permissions."
              : "Update user information, business access, and permissions."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            {isCurrentUserSuperAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="john@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Software Developer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={formDepartment} onValueChange={setFormDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="support">Customer Support</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Account Status</Label>
                  <Select
                    value={isActive ? "active" : "inactive"}
                    onValueChange={(value) => setIsActive(value === "active")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Additional notes about this user..."
                rows={3}
              />
            </div>
            <Separator />
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Business Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Assign roles to grant access to specific businesses
                    {!isCurrentUserSuperAdmin && (
                      <span className="block text-xs text-amber-600 mt-1">
                        Note: Only super admins can create business owners
                      </span>
                    )}
                  </p>
                </div>
                {isCurrentUserSuperAdmin && (
                  <Button variant="outline" size="sm" onClick={() => setIsAddingBusiness(true)}>
                    <Building2 className="size-4 mr-2" />
                    Add Business
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {managedBusinesses.map((business) => {
                  const roleOptions = getRoleOptions(business.id)
                  return (
                    <div key={business.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {business.logo}
                        </div>
                        <div>
                          <div className="font-medium">{business.name}</div>
                          <div className="text-sm text-muted-foreground">{business.email}</div>
                          {business.industry && (
                            <div className="text-xs text-muted-foreground">{business.industry}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select
                          value={businessRoles[business.id] || "none"}
                          onValueChange={(value) =>
                            handleBusinessRoleChange(
                              business.id,
                              value === "none" ? null : (value as "owner" | "employee"),
                            )
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                                {option.value === "employee" && (
                                  <div className="flex items-center gap-2">
                                    <User className="size-4" />
                                    {option.label}
                                  </div>
                                )}
                                {option.value === "owner" && (
                                  <div className="flex items-center gap-2">
                                    <Shield className="size-4" />
                                    {option.label}
                                    {option.disabled && (
                                      <span className="text-xs text-muted-foreground">(Super Admin Only)</span>
                                    )}
                                  </div>
                                )}
                                {option.value === "none" && option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {businessRoles[business.id] && (
                          <Badge variant="outline" className="capitalize">
                            {businessRoles[business.id]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Add Business Form */}
              {isAddingBusiness && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Add New Business</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsAddingBusiness(false)}>
                      <X className="size-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Business Name *</Label>
                      <Input
                        value={newBusiness.name}
                        onChange={(e) => setNewBusiness((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Acme Corporation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Business ID *</Label>
                      <Input
                        value={newBusiness.id}
                        onChange={(e) =>
                          setNewBusiness((prev) => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, "") }))
                        }
                        placeholder="acmecorp"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={newBusiness.email}
                        onChange={(e) => setNewBusiness((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="billing@acmecorp.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={newBusiness.phone}
                        onChange={(e) => setNewBusiness((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        value={newBusiness.website}
                        onChange={(e) => setNewBusiness((prev) => ({ ...prev, website: e.target.value }))}
                        placeholder="https://acmecorp.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Select
                        value={newBusiness.industry}
                        onValueChange={(value) => setNewBusiness((prev) => ({ ...prev, industry: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Logo (1-2 chars)</Label>
                      <Input
                        value={newBusiness.logo}
                        onChange={(e) => setNewBusiness((prev) => ({ ...prev, logo: e.target.value.slice(0, 2) }))}
                        placeholder="AC"
                        maxLength={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Invoice Prefix</Label>
                      <Input
                        value={newBusiness.prefix}
                        onChange={(e) =>
                          setNewBusiness((prev) => ({ ...prev, prefix: e.target.value.slice(0, 3).toUpperCase() }))
                        }
                        placeholder="AC"
                        maxLength={3}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea
                      value={newBusiness.address}
                      onChange={(e) => setNewBusiness((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main St, City, State 12345"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tax ID</Label>
                    <Input
                      value={newBusiness.taxId}
                      onChange={(e) => setNewBusiness((prev) => ({ ...prev, taxId: e.target.value }))}
                      placeholder="12-3456789"
                    />
                  </div>
                  <Button onClick={handleAddBusiness} size="sm">
                    <Plus className="size-4 mr-2" />
                    Add Business
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-medium">Detailed Permissions</h3>
              <p className="text-sm text-muted-foreground">
                Fine-tune what this user can do within their assigned businesses
              </p>
            </div>
            <div className="space-y-4">
              {Object.entries(permissions).map(([key, value]) => (
                <div key={key} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => setPermissions((prev) => ({ ...prev, [key]: checked === true }))}
                  />
                  <div className="flex-1">
                    <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">{getPermissionDescription(key)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Permission Notes:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Business owners automatically get all permissions</li>
                <li>• Employees get limited permissions by default</li>
                <li>• Super admins override all permission restrictions</li>
              </ul>
            </div>
          </TabsContent>

          {isCurrentUserSuperAdmin && (
            <TabsContent value="admin" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-medium">Administrative Settings</h3>
                <p className="text-sm text-muted-foreground">Super admin only settings and global permissions</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <Checkbox
                    id="super-admin"
                    checked={globalRole === "super_admin"}
                    onCheckedChange={(checked) => setGlobalRole(checked ? "super_admin" : null)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="super-admin" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                      <Crown className="size-4 text-purple-600" />
                      Super Administrator
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Full access to all businesses, user management, and system settings
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">System Information</h4>
                {mode === "edit" && editingUser && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">User ID:</span>
                      <p className="font-mono">{editingUser.id}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p>{new Date(editingUser.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Login:</span>
                      <p>{editingUser.lastLogin ? new Date(editingUser.lastLogin).toLocaleDateString() : "Never"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p>{editingUser.isActive !== false ? "Active" : "Inactive"}</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {formError && (
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
            <AlertTriangle className="size-4" />
            {formError}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{mode === "create" ? "Create User" : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

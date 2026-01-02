export interface User {
  id: string
  email: string
  name: string
  phone?: string
  title?: string
  department?: string
  notes?: string
  isActive?: boolean
  businessRoles: Record<string, "owner" | "employee" | null>
  globalRole?: "super_admin" | null
  permissions?: {
    canCreateInvoices: boolean
    canEditAllInvoices: boolean
    canDeleteInvoices: boolean
    canViewReports: boolean
    canManageUsers: boolean
    canManageSettings: boolean
  }
  createdAt: string
  lastLogin?: string | null
}

export interface Business {
  id: string
  name: string
  address: string
  email: string
  phone: string
  logo: string
  prefix: string
  website?: string
  taxId?: string
  industry?: string
}

export interface Invoice {
  id: string
  businessId: string
  createdBy: string
  clientName: string
  clientBusiness: string
  amount: number
  status: "draft" | "pending" | "paid" | "overdue"
  date: string
  items: InvoiceItem[]
  taxRate: number
  discountRate: number
  total: number
  notes?: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

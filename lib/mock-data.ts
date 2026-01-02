import type { User, Business, Invoice } from "@/types/auth"

// Centralized mock data - single source of truth for all dummy data
// This can be easily replaced with real API calls later

export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "admin@zaytoona",
    name: "Zaytoon CEO",
    phone: "+1 (555) 123-4567",
    title: "Chief Executive Officer",
    department: "executive",
    isActive: true,
    businessRoles: {
      zaytoontech: "owner",
      ax2tech: null,
    },
    permissions: {
      canCreateInvoices: true,
      canEditAllInvoices: true,
      canDeleteInvoices: true,
      canViewReports: true,
      canManageUsers: true,
      canManageSettings: true,
    },
    createdAt: "2024-01-01",
    lastLogin: "2024-01-15",
  },
  {
    id: "user-2",
    email: "admin@ax2",
    name: "Ax2 CEO",
    phone: "+1 (555) 987-6543",
    title: "Chief Executive Officer",
    department: "executive",
    isActive: true,
    businessRoles: {
      zaytoontech: null,
      ax2tech: "owner",
    },
    permissions: {
      canCreateInvoices: true,
      canEditAllInvoices: true,
      canDeleteInvoices: true,
      canViewReports: true,
      canManageUsers: true,
      canManageSettings: true,
    },
    createdAt: "2024-01-01",
    lastLogin: "2024-01-14",
  },
  {
    id: "user-3",
    email: "emp@zaytoona",
    name: "Zaytoon Employee",
    phone: "+1 (555) 234-5678",
    title: "Software Developer",
    department: "engineering",
    isActive: true,
    businessRoles: {
      zaytoontech: "employee",
      ax2tech: null,
    },
    permissions: {
      canCreateInvoices: true,
      canEditAllInvoices: false,
      canDeleteInvoices: false,
      canViewReports: false,
      canManageUsers: false,
      canManageSettings: false,
    },
    createdAt: "2024-02-01",
    lastLogin: "2024-01-13",
  },
  {
    id: "user-4",
    email: "emp@ax2",
    name: "Ax2 Employee",
    phone: "+1 (555) 345-6789",
    title: "Sales Representative",
    department: "sales",
    isActive: true,
    businessRoles: {
      zaytoontech: null,
      ax2tech: "employee",
    },
    permissions: {
      canCreateInvoices: true,
      canEditAllInvoices: false,
      canDeleteInvoices: false,
      canViewReports: false,
      canManageUsers: false,
      canManageSettings: false,
    },
    createdAt: "2024-02-01",
    lastLogin: "2024-01-12",
  },
  {
    id: "user-5",
    email: "admin@admin",
    name: "Super Admin",
    phone: "+1 (555) 000-0000",
    title: "System Administrator",
    department: "operations",
    isActive: true,
    businessRoles: {
      zaytoontech: "owner",
      ax2tech: "owner",
    },
    globalRole: "super_admin",
    permissions: {
      canCreateInvoices: true,
      canEditAllInvoices: true,
      canDeleteInvoices: true,
      canViewReports: true,
      canManageUsers: true,
      canManageSettings: true,
    },
    createdAt: "2024-01-01",
    lastLogin: "2024-01-15",
  },
]

export const businessProfiles: Record<string, Business> = {
  zaytoontech: {
    id: "zaytoontech",
    name: "ZaytoonTech",
    address: "21 Alpine Lane\nHicksville, NY 11801",
    email: "billing@zaytoontech.com",
    phone: "+1 (555) 123-4567",
    logo: "Z",
    prefix: "ZT",
    website: "https://zaytoontech.com",
    taxId: "12-3456789",
    industry: "technology",
  },
  ax2tech: {
    id: "ax2tech",
    name: "Ax2 Tech",
    address: "370 Beebe Road\nMineola, NY 11501",
    email: "invoices@ax2tech.com",
    phone: "+1 (555) 987-6543",
    logo: "A2",
    prefix: "A2",
    website: "https://ax2tech.com",
    taxId: "98-7654321",
    industry: "technology",
  },
}

export const mockInvoices: Invoice[] = [
  {
    id: "ZT-001",
    businessId: "zaytoontech",
    createdBy: "user-1",
    clientName: "John Smith",
    clientBusiness: "Smith Corp",
    amount: 2500,
    status: "paid",
    date: "2024-01-15",
    items: [
      {
        id: "item-1",
        description: "Web Development Services",
        quantity: 1,
        rate: 2500,
        amount: 2500,
      },
    ],
    taxRate: 0.08,
    discountRate: 0,
    total: 2700,
    notes: "Payment received via bank transfer",
  },
  {
    id: "ZT-002",
    businessId: "zaytoontech",
    createdBy: "user-3",
    clientName: "Sarah Johnson",
    clientBusiness: "Johnson LLC",
    amount: 1800,
    status: "pending",
    date: "2024-01-20",
    items: [
      {
        id: "item-2",
        description: "Mobile App Development",
        quantity: 1,
        rate: 1800,
        amount: 1800,
      },
    ],
    taxRate: 0.08,
    discountRate: 0.05,
    total: 1854,
    notes: "Net 30 payment terms",
  },
  {
    id: "A2-001",
    businessId: "ax2tech",
    createdBy: "user-2",
    clientName: "Mike Davis",
    clientBusiness: "Davis Industries",
    amount: 3200,
    status: "paid",
    date: "2024-01-10",
    items: [
      {
        id: "item-3",
        description: "System Integration",
        quantity: 1,
        rate: 3200,
        amount: 3200,
      },
    ],
    taxRate: 0.08,
    discountRate: 0,
    total: 3456,
    notes: "Completed ahead of schedule",
  },
  {
    id: "A2-002",
    businessId: "ax2tech",
    createdBy: "user-4",
    clientName: "Lisa Wilson",
    clientBusiness: "Wilson Tech",
    amount: 2100,
    status: "overdue",
    date: "2024-01-05",
    items: [
      {
        id: "item-4",
        description: "Database Optimization",
        quantity: 1,
        rate: 2100,
        amount: 2100,
      },
    ],
    taxRate: 0.08,
    discountRate: 0,
    total: 2268,
    notes: "Follow up required",
  },
]

// Helper functions for data manipulation
export const addUserToMockData = (user: User) => {
  mockUsers.push(user)
}

export const updateUserInMockData = (userId: string, updates: Partial<User>): User | null => {
  const index = mockUsers.findIndex((user) => user.id === userId)
  if (index === -1) return null

  mockUsers[index] = { ...mockUsers[index], ...updates }
  return mockUsers[index]
}

export const deleteUserFromMockData = (userId: string): boolean => {
  const index = mockUsers.findIndex((user) => user.id === userId)
  if (index === -1) return false

  mockUsers.splice(index, 1)
  return true
}

export const addBusinessToMockData = (business: Business) => {
  businessProfiles[business.id] = business
}

export const addInvoiceToMockData = (invoice: Invoice) => {
  mockInvoices.push(invoice)
}

export const updateInvoiceInMockData = (id: string, updates: Partial<Invoice>): Invoice | null => {
  const index = mockInvoices.findIndex((invoice) => invoice.id === id)
  if (index === -1) return null

  mockInvoices[index] = { ...mockInvoices[index], ...updates }
  return mockInvoices[index]
}

export const deleteInvoiceFromMockData = (id: string): boolean => {
  const index = mockInvoices.findIndex((invoice) => invoice.id === id)
  if (index === -1) return false

  mockInvoices.splice(index, 1)
  return true
}

export const toggleUserStatusInMockData = (userId: string): boolean => {
  const user = mockUsers.find((u) => u.id === userId)
  if (!user) return false

  user.isActive = !user.isActive
  return true
}

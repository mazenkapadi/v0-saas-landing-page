import type { Invoice } from "@/types/auth"
import { canViewAllInvoices, getCurrentUser } from "@/lib/auth"
import {
  mockInvoices,
  businessProfiles,
  addInvoiceToMockData,
  updateInvoiceInMockData,
  deleteInvoiceFromMockData,
} from "@/lib/mock-data"

export const addDaysToInvoiceDate = (startDate: Date, daysToAdd: number): Date => {
  const date = new Date(startDate)

  // Add 1 day to the invoice date (exclusive)
  date.setDate(date.getDate() + 1)

  // Add the desired number of days
  let addedDays = 0
  while (addedDays < daysToAdd) {
    date.setDate(date.getDate() + 1)

    // Skip weekends (Saturday = 6, Sunday = 0)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      addedDays++
    }
  }

  return date
}

export const getInvoicesForBusiness = (businessId: string): Invoice[] => {
  const currentUser = getCurrentUser()
  const businessInvoices = mockInvoices.filter((invoice) => invoice.businessId === businessId)

  // If user can view all invoices (owner/super admin), return all
  if (canViewAllInvoices(currentUser, businessId)) {
    return businessInvoices
  }

  // Otherwise, only return invoices created by the current user
  return businessInvoices.filter((invoice) => invoice.createdBy === currentUser?.id)
}

export const getInvoiceById = (id: string): Invoice | undefined => {
  return mockInvoices.find((invoice) => invoice.id === id)
}

export const createInvoice = (invoice: Omit<Invoice, "id">): Invoice => {
  const businessProfile = businessProfiles[invoice.businessId]
  const prefix = businessProfile?.prefix || "INV"
  const count = mockInvoices.filter((inv) => inv.businessId === invoice.businessId).length + 1
  const newInvoice: Invoice = {
    ...invoice,
    id: `${prefix}-${count.toString().padStart(3, "0")}`,
  }
  addInvoiceToMockData(newInvoice)
  return newInvoice
}

export const updateInvoice = (id: string, updates: Partial<Invoice>): Invoice | null => {
  return updateInvoiceInMockData(id, updates)
}

export const deleteInvoice = (id: string): boolean => {
  return deleteInvoiceFromMockData(id)
}

// Export the centralized data for components that need direct access
export { mockInvoices }

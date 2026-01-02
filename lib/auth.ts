import type { User, Business } from "@/types/auth"
import {
  mockUsers,
  businessProfiles,
  addUserToMockData,
  updateUserInMockData,
  deleteUserFromMockData,
  addBusinessToMockData,
  toggleUserStatusInMockData,
} from "@/lib/mock-data"

export const authenticateUser = (email: string, password: string): User | null => {
  // Find user by email
  const user = mockUsers.find((u) => u.email === email)
  if (!user) return null

  // Check if user is active
  if (user.isActive === false) return null

  // Check password based on user type
  const isValidPassword =
    (email.startsWith("admin@") && password === "admin") ||
    (email.startsWith("emp@") && password === "emp") ||
    (email === "admin@admin" && password === "admin")

  if (isValidPassword) {
    // Update last login
    user.lastLogin = new Date().toISOString()
    return user
  }

  return null
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  try {
    const userData = localStorage.getItem("current-user")
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export const setCurrentUser = (user: User | null) => {
  if (typeof window === "undefined") return
  try {
    if (user) {
      localStorage.setItem("current-user", JSON.stringify(user))
    } else {
      localStorage.removeItem("current-user")
    }
  } catch (error) {
    console.error("Error setting current user:", error)
  }
}

export const getCurrentBusiness = (): string => {
  if (typeof window === "undefined") return "zaytoontech"
  try {
    const stored = localStorage.getItem("selected-business")
    // Ensure the stored business is valid
    if (stored && businessProfiles[stored]) {
      return stored
    }
    // Default fallback
    return "zaytoontech"
  } catch (error) {
    console.error("Error getting current business:", error)
    return "zaytoontech"
  }
}

export const setCurrentBusiness = (businessId: string) => {
  if (typeof window === "undefined") return
  try {
    // Validate the business ID exists
    if (businessProfiles[businessId]) {
      localStorage.setItem("selected-business", businessId)
    } else {
      console.error("Invalid business ID:", businessId)
    }
  } catch (error) {
    console.error("Error setting current business:", error)
  }
}

export const getUsersForBusiness = (businessId: string): User[] => {
  return mockUsers.filter((user) => {
    if (!user.businessRoles) return false
    const role = user.businessRoles[businessId]
    return role !== null && role !== undefined
  })
}

export const getAllUsers = (): User[] => {
  return mockUsers
}

export const getUserRoleInBusiness = (user: User | null, businessId: string): "owner" | "employee" | null => {
  if (!user || !user.businessRoles || !businessId) return null
  const role = user.businessRoles[businessId]
  return role || null
}

export const isOwnerOfBusiness = (user: User | null, businessId: string): boolean => {
  return getUserRoleInBusiness(user, businessId) === "owner"
}

export const isSuperAdmin = (user: User | null): boolean => {
  return user?.globalRole === "super_admin"
}

export const getUserAccessibleBusinesses = (user: User | null): string[] => {
  if (!user || !user.businessRoles) return []

  return Object.entries(user.businessRoles)
    .filter(([_, role]) => role !== null && role !== undefined)
    .map(([businessId, _]) => businessId)
}

export const canViewAllInvoices = (user: User | null, businessId: string): boolean => {
  if (!user) return false
  return isSuperAdmin(user) || isOwnerOfBusiness(user, businessId) || user.permissions?.canEditAllInvoices === true
}

export const hasPermission = (
  user: User | null,
  permission: keyof User["permissions"],
  businessId?: string,
): boolean => {
  if (!user) return false

  // Super admins have all permissions
  if (isSuperAdmin(user)) return true

  // Business owners have all permissions in their business
  if (businessId && isOwnerOfBusiness(user, businessId)) return true

  // Check specific permission
  return user.permissions?.[permission] === true
}

// Data manipulation functions - these now use the centralized mock data
export const addUser = (user: User) => {
  addUserToMockData(user)
}

export const updateUser = (userId: string, updates: Partial<User>): User | null => {
  return updateUserInMockData(userId, updates)
}

export const deleteUser = (userId: string): boolean => {
  return deleteUserFromMockData(userId)
}

export const addBusiness = (business: Business) => {
  addBusinessToMockData(business)
}

export const getAllBusinesses = (): Business[] => {
  return Object.values(businessProfiles)
}

export const toggleUserStatus = (userId: string): boolean => {
  return toggleUserStatusInMockData(userId)
}

// Export the centralized data for components that need direct access
export { mockUsers, businessProfiles }

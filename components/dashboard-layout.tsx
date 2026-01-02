"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, FileText, Users, Home, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, logout } = useAuth()
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
    { name: "Clients", href: "/dashboard/clients", icon: Users },
    { name: "Profile", href: "/dashboard/profile", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Sidebar */}
      <div className="w-56 bg-background border-r flex flex-col fixed left-0 top-0 h-screen z-10">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 font-bold">
            <div className="size-7 rounded-lg bg-foreground flex items-center justify-center text-background">
              Z
            </div>
            <span>ZaytoonTech</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 mt-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="size-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t">
          {profile && (
            <div className="mb-3 p-2 bg-muted/50 rounded-md">
              <div className="text-sm font-medium truncate">{profile.name}</div>
              <div className="text-xs text-muted-foreground truncate">{profile.email}</div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start">
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-56">{children}</main>
    </div>
  )
}

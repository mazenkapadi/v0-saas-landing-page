# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 14 SaaS landing page and multi-business invoice management dashboard built with TypeScript, React, and Tailwind CSS. The project is automatically synced with v0.app deployments and deployed on Vercel.

## Development Commands

### Core Commands
- `npm run dev` - Start development server (default: http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run lint` - Run ESLint

### Important Notes
- TypeScript errors are ignored during builds (`ignoreBuildErrors: true`)
- ESLint is ignored during builds (`ignoreDuringBuilds: true`)
- Images are unoptimized in the Next.js config

## Architecture

### Application Structure

**Dual-Mode Application:**
- **Landing Page** (`app/page.tsx`): Marketing site for ZaytoonTech showcasing services
- **Dashboard** (`app/dashboard/*`): Multi-business invoice management system with authentication

### Key Architectural Patterns

**Authentication System:**
- Client-side only authentication using `AuthContext` (contexts/auth-context.tsx)
- Persists to localStorage (`dashboard-auth`, `current-user`, `selected-business`)
- No backend API - authentication uses mock data
- Default credentials: `admin@zaytoona` / `admin`, `emp@zaytoona` / `emp`, `admin@admin` / `admin`
- User status checked via `isActive` flag

**Multi-Business Support:**
- Business selection persisted to localStorage
- Each user has `businessRoles` mapping business ID to role (`owner` | `employee` | `null`)
- Super admin role (`globalRole: "super_admin"`) has access to all businesses
- Business-specific permissions control invoice visibility and editing

**Data Management:**
- All data is mock/in-memory (lib/mock-data.ts)
- Single source of truth for Users, Businesses, and Invoices
- Helper functions in lib/auth.ts and lib/invoices.ts provide abstraction layer
- Ready for API replacement - just swap the lib/* implementations

**Permission System:**
- Role-based: `owner` vs `employee` at business level
- Permission flags: `canCreateInvoices`, `canEditAllInvoices`, `canDeleteInvoices`, `canViewReports`, `canManageUsers`, `canManageSettings`
- Business owners and super admins bypass permission checks
- Invoice visibility filtered by creator unless user has `canViewAllInvoices`

### Directory Structure

```
app/
  ├── page.tsx              # Landing page (marketing site)
  ├── layout.tsx            # Root layout with AuthProvider
  ├── globals.css           # Global styles with Tailwind
  └── dashboard/            # Protected dashboard routes
      ├── page.tsx          # Dashboard home (redirects to login if not auth)
      ├── layout.tsx        # Dashboard layout
      ├── invoice-generator/
      ├── invoices/
      ├── reports/
      └── users/

components/
  ├── ui/                   # shadcn/ui components (Radix UI + Tailwind)
  ├── dashboard.tsx         # Main dashboard shell
  ├── login-form.tsx        # Authentication form
  ├── business-selector.tsx # Business switcher dropdown
  ├── invoice-*.tsx         # Invoice-related components
  ├── users-page.tsx        # User management
  └── reports-page.tsx      # Business reports

contexts/
  └── auth-context.tsx      # AuthProvider and useAuth hook

lib/
  ├── auth.ts               # Authentication & user management logic
  ├── invoices.ts           # Invoice operations
  ├── mock-data.ts          # Centralized mock data store
  └── utils.ts              # Utility functions (cn, etc.)

types/
  └── auth.ts               # TypeScript types (User, Business, Invoice, etc.)
```

### Tech Stack Details

**UI Components:** shadcn/ui with Radix UI primitives
- Configured in components.json
- Icons: lucide-react
- Animations: framer-motion
- Path alias: `@/*` resolves to project root

**Styling:**
- Tailwind CSS with CSS variables for theming
- Dark mode by default (see app/layout.tsx)
- Custom animations via tailwindcss-animate

**Invoice Features:**
- PDF export via jspdf + html2canvas
- Business day calculation (skips weekends) for due dates
- Automatic invoice numbering with business prefix (e.g., ZT-001, A2-001)

## Working with This Codebase

### Adding New Features

**New Dashboard Routes:**
1. Create route under `app/dashboard/[route-name]/`
2. Add page.tsx with the route component
3. Import and use within dashboard layout navigation

**New Business:**
Add entry to `businessProfiles` in lib/mock-data.ts with unique `id` and `prefix`

**New User:**
Add to `mockUsers` array in lib/mock-data.ts with appropriate `businessRoles` and `permissions`

### Common Patterns

**Accessing Current User:**
```typescript
import { useAuth } from '@/contexts/auth-context'
const { user, isAuthenticated } = useAuth()
```

**Checking Permissions:**
```typescript
import { hasPermission, isOwnerOfBusiness } from '@/lib/auth'
if (hasPermission(user, 'canManageUsers', businessId)) { ... }
```

**Getting Business-Specific Data:**
```typescript
import { getInvoicesForBusiness } from '@/lib/invoices'
const invoices = getInvoicesForBusiness(businessId)
```

### Path Aliases

Use `@/*` for all imports:
- `@/components/ui/button` instead of `../../components/ui/button`
- `@/lib/auth` instead of `../lib/auth`

## Database & Backend

**Database:** Supabase (PostgreSQL)
- `profiles` table - User/company information
- `clients` table - Client/customer management
- `invoices` table - Invoice headers with auto-calculated totals
- `invoice_items` table - Line items for invoices

**API Routes:**
- `/api/clients` - Full CRUD for clients
- `/api/invoices` - Full CRUD for invoices with automatic calculation
- All routes protected with Supabase Auth
- Row-Level Security (RLS) ensures data isolation per user

**Setup:**
1. Create Supabase project at https://supabase.com
2. Run `supabase/schema.sql` in SQL Editor
3. Add credentials to `.env.local` (see `.env.local.example`)
4. Replace auth files:
   - `contexts/auth-context-new.tsx` → `contexts/auth-context.tsx`
   - `components/login-form-new.tsx` → `components/login-form.tsx`

**See:** `SETUP_GUIDE.md` for complete setup instructions and `FINAL_SUMMARY.md` for implementation details.

## Deployment

The repository auto-syncs with v0.app deployments. Changes pushed from v0.app are automatically deployed via Vercel.

**Live URL:** https://vercel.com/mazen-kapadis-projects/v0-saas-landing-page
**v0.app Chat:** https://v0.app/chat/8FR2DEEGceV

**Deployment with Supabase:**
Add these environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

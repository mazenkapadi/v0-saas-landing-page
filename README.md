# Invoice Management Dashboard

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/mazen-kapadis-projects/v0-saas-landing-page)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/8FR2DEEGceV)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

## Overview

A **production-ready invoice management system** built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

### Features

✅ **User Authentication** - Secure signup/login with Supabase Auth  
✅ **Client Management** - Store and manage customer information  
✅ **Invoice Creation** - Create invoices with line items  
✅ **Automatic Calculations** - Subtotal, tax, discount, and total calculated automatically  
✅ **Full CRUD Operations** - Create, read, update, and delete invoices and clients  
✅ **Data Security** - Row-Level Security ensures users only see their own data  
✅ **Type Safety** - Full TypeScript coverage with database-generated types  

## Quick Start

**📖 Read [GETTING_STARTED.md](./GETTING_STARTED.md) for 10-minute setup guide**

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (free tier works!)

### Setup (10 minutes)

1. **Create Supabase project** at https://supabase.com
2. **Run database schema**: Copy `supabase/schema.sql` to Supabase SQL Editor
3. **Configure environment**: Copy `.env.local.example` to `.env.local` and add your Supabase credentials
4. **Replace auth files**: Use new Supabase-based auth context and login form
5. **Start development server**:
   ```bash
   npm install
   npm run dev
   ```

📚 **See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions**

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Deployment**: Vercel

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── clients/           # Client CRUD endpoints
│   │   └── invoices/          # Invoice CRUD endpoints
│   ├── dashboard/             # Dashboard pages
│   └── page.tsx               # Landing page
├── components/                 # React components
├── contexts/                   # React contexts (Auth)
├── lib/
│   ├── supabase/              # Supabase client utilities
│   └── utils.ts               # Utility functions
├── supabase/
│   └── schema.sql             # Database schema
├── types/                      # TypeScript types
└── GETTING_STARTED.md         # Quick setup guide
```

## API Routes

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/[id]` - Get single client
- `PATCH /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

### Invoices
- `GET /api/invoices` - List all invoices (with client & items)
- `POST /api/invoices` - Create invoice with automatic calculations
- `GET /api/invoices/[id]` - Get single invoice
- `PATCH /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice

## Database Schema

- **profiles** - User account and company information
- **clients** - Customer/client records
- **invoices** - Invoice headers with totals
- **invoice_items** - Line items for each invoice

**Row-Level Security (RLS)** ensures each user can only access their own data.

## Documentation

- 📖 [GETTING_STARTED.md](./GETTING_STARTED.md) - 10-minute quick start
- 📚 [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup instructions
- 🎉 [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) - Complete feature overview
- 📋 [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Development roadmap
- 🛠️ [WARP.md](./WARP.md) - Development guidelines

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

Your project is live at:
**[https://vercel.com/mazen-kapadis-projects/v0-saas-landing-page](https://vercel.com/mazen-kapadis-projects/v0-saas-landing-page)**

## v0.app Integration

Continue building your app on:
**[https://v0.app/chat/8FR2DEEGceV](https://v0.app/chat/8FR2DEEGceV)**

### How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT

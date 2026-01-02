# Quick Start Guide

Get your invoice management system up and running in 5 minutes.

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)

## Setup Steps

### 1. Clone & Install (1 minute)
```bash
cd /Users/mazenkapadi/Desktop/v0-saas-landing-page
npm install
```

### 2. Set Up Supabase (2 minutes)
1. Go to https://supabase.com and create a new project
2. Wait for project creation (~2 minutes)
3. Go to SQL Editor and run the contents of `supabase/schema.sql`

### 3. Configure Environment (1 minute)
1. Copy `.env.local.example` to `.env.local`
2. Go to Supabase → Settings → API
3. Copy your Project URL and Anon Key to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create Your User (1 minute)
In Supabase:
1. Go to Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password
4. **Important:** Check "Auto Confirm User"
5. Click "Create user"
6. Go to Table Editor → profiles and update your name and company_name

### 5. Run the App
```bash
npm run dev
```

Visit http://localhost:3000/dashboard and log in with your credentials.

## What's Next?

1. **Create a Client** at http://localhost:3000/dashboard/clients
2. **Create an Invoice** at http://localhost:3000/dashboard/invoice-generator
3. **View Dashboard** to see your metrics update

## Need Help?

- Full setup guide: See `SUPABASE_SETUP.md`
- Implementation details: See `IMPLEMENTATION_SUMMARY.md`
- Database schema: See `supabase/schema.sql`

## Quick Test

To verify everything works:
1. Log in to the dashboard
2. Create a client (name, email, company)
3. Create an invoice selecting that client
4. Check that the invoice appears in the list
5. Click on the invoice to view details
6. Check that dashboard metrics show the invoice total

That's it! Your invoicing system is ready to use.

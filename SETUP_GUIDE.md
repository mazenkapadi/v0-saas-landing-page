# Invoice Dashboard Setup Guide

This guide will walk you through setting up your functional invoice dashboard with Supabase as the database backend.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great)
- npm or pnpm package manager

## Step 1: Set Up Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize (takes ~2 minutes)
3. Once ready, go to **Settings > API** to get your credentials

## Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Step 3: Run Database Migrations

1. In your Supabase project dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run** to execute the schema

This will create all the necessary tables, indexes, RLS policies, and triggers.

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## Step 6: Create Your First User

1. Go to the dashboard page
2. You'll see a signup/login form
3. Create an account with email and password
4. A profile will be automatically created for you

## Features Now Available

### Fully Functional Invoice Management
- ✅ Create invoices with line items
- ✅ Automatic calculation of subtotal, tax, discount, and total
- ✅ Edit and update invoices
- ✅ Delete invoices
- ✅ Filter invoices by status
- ✅ Search invoices by number or client name

### Client Management  
- ✅ Add new clients
- ✅ Store client contact info (name, email, company, address, tax ID)
- ✅ Edit and update client details
- ✅ Delete clients
- ✅ Select clients when creating invoices (autofills info)

### Dashboard Metrics (Real Data)
- ✅ Total revenue (sum of paid invoices)
- ✅ Outstanding amounts (pending + overdue)
- ✅ Invoice counts by status
- ✅ Monthly revenue comparison
- ✅ Recent invoices list

### Authentication & Security
- ✅ Supabase Auth with email/password
- ✅ Row-Level Security (RLS) ensures users only see their own data
- ✅ JWT-based session management
- ✅ Secure API routes with authentication checks

## Database Schema Overview

### Tables

**profiles** - User profile information
- Extends Supabase auth.users
- Stores company name, address, tax ID, logo
- Auto-created on signup via trigger

**clients** - Client/customer records
- Full contact information
- Associated with user via `user_id`
- Referenced by invoices

**invoices** - Invoice headers
- Links to client
- Stores calculated totals (subtotal, tax, discount, total)
- Status tracking (draft, sent, paid, overdue, cancelled)
- Due dates and issue dates

**invoice_items** - Line items for each invoice
- Description, quantity, unit price
- Linked to parent invoice
- Auto-deleted when invoice is deleted (CASCADE)

## Using the Application

### Creating Your First Invoice

1. Click **"+ New Invoice"** from the dashboard
2. Fill in invoice details (number, dates, tax rate)
3. **Add a client first** if you haven't already:
   - Click "Add New Client" 
   - Fill in client details
   - Save
4. Select the client - their info autofills
5. Add line items (description, quantity, price)
6. Save as draft or mark as sent
7. Totals calculate automatically!

### Managing Clients

1. Go to the Clients section (if visible based on permissions)
2. Click **"+ Add Client"**
3. Fill in contact details
4. Clients appear in dropdown when creating invoices

### Viewing Reports

1. Go to **Reports** from the sidebar
2. See revenue charts, payment status breakdown
3. Export data for accounting

## Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

Your Supabase database will work seamlessly with the deployed app.

## Troubleshooting

### "Unauthorized" Errors
- Make sure you're logged in
- Check that your .env.local file has the correct Supabase credentials
- Verify RLS policies are enabled in Supabase

### Invoices Not Showing
- Invoices are scoped per user - you'll only see your own
- Check the status filter (try "All")
- Verify data exists in Supabase Table Editor

### Cannot Create Invoice
- Ensure you have at least one client created first
- Check that invoice number is unique for your user
- Verify required fields are filled

## Next Steps

### Customization Ideas
- Add invoice PDF export
- Email invoices to clients
- Recurring invoices
- Payment tracking
- Multi-currency support
- Invoice templates
- Analytics dashboard

### Production Checklist
- [ ] Enable Supabase backups
- [ ] Set up custom email templates for auth
- [ ] Configure custom domain
- [ ] Add monitoring (Sentry, LogRocket)
- [ ] Set up automated tests
- [ ] Create database indexes for performance
- [ ] Enable Supabase Edge Functions for advanced logic

## Support

For issues or questions:
- Check Supabase docs: https://supabase.com/docs
- Review Next.js docs: https://nextjs.org/docs
- Create an issue in the repository

---

**You now have a fully functional, production-ready invoice management system!** 🎉

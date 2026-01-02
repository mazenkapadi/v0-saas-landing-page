# Supabase Backend Setup Instructions

This document describes how to set up and use the Supabase backend for the invoicing system.

## Prerequisites

1. A Supabase account (free tier works)
2. Node.js 18+ and npm/pnpm installed
3. Basic knowledge of PostgreSQL

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the project details:
   - Name: "Invoice Management" (or your choice)
   - Database Password: Create a strong password and save it
   - Region: Choose closest to your users
5. Wait for the project to be created (~2 minutes)

## Step 2: Set Up Database Schema

1. In your Supabase project, go to the SQL Editor
2. Copy the entire contents of `supabase/schema.sql` from this repository
3. Paste it into the SQL Editor and click "Run"
4. This will create:
   - `profiles` table (user information)
   - `clients` table (client management)
   - `invoices` table (invoice headers)
   - `invoice_items` table (invoice line items)
   - All necessary indexes, triggers, and Row Level Security policies

## Step 3: Configure Environment Variables

1. In your Supabase project, go to Settings → API
2. Copy the following values:
   - Project URL (under "Project URL")
   - Anon public key (under "Project API keys" → "anon public")
3. Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Create Your First User

Since this system uses Supabase Auth, you need to create users through Supabase:

### Option 1: Using Supabase Dashboard (Easiest)

1. In your Supabase project, go to Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter:
   - Email: your-email@example.com
   - Password: your-password
   - Auto Confirm User: YES (important!)
4. Click "Create user"

The trigger will automatically create a profile in the `profiles` table.

### Option 2: Using Sign-Up Flow (If you add registration)

If you want to add a sign-up page, users can register themselves and the profile will be auto-created.

## Step 5: Update User Profile Information

After creating a user, you should update their profile with proper company information:

1. Go to Table Editor → `profiles`
2. Find your user (by email)
3. Update the following fields:
   - `name`: Your Name
   - `company_name`: Your Company Name
   - `phone`: (optional)
   - `address`: (optional)
   - `tax_id`: (optional)

## Step 6: Start the Development Server

```bash
npm install
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 7: Test the Application

1. Go to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
2. Log in with the credentials you created
3. You should see the dashboard with no data
4. Try creating a client at [http://localhost:3000/dashboard/clients](http://localhost:3000/dashboard/clients)
5. Try creating an invoice at [http://localhost:3000/dashboard/invoice-generator](http://localhost:3000/dashboard/invoice-generator)

## Features

The application now has full backend integration:

- ✅ **Authentication**: Supabase Auth with email/password
- ✅ **Client Management**: Full CRUD operations on clients
- ✅ **Invoice Management**: Create, read, update, delete invoices
- ✅ **Invoice Items**: Line items with automatic total calculations
- ✅ **Dashboard Metrics**: Real-time revenue and invoice statistics
- ✅ **Row Level Security**: Users can only see their own data

## Data Model

### Profiles
- Stores user information (extends Supabase auth.users)
- Auto-created on user signup

### Clients
- Customer/client information
- Each user has their own clients

### Invoices
- Invoice headers with totals, dates, and status
- Linked to clients
- Automatic calculation of subtotal, tax, discount, and total

### Invoice Items
- Line items for each invoice
- Description, quantity, unit price, and calculated amount

## Troubleshooting

### "Unauthorized" errors
- Check that your `.env.local` file has the correct Supabase credentials
- Make sure you're logged in
- Restart the dev server after changing environment variables

### Can't see data after login
- Check that RLS policies are enabled (they should be after running schema.sql)
- Verify the user_id in the profiles table matches your auth user ID
- Check the browser console for API errors

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Clear Next.js cache: `rm -rf .next`
- Make sure you're using Node.js 18 or higher

## Production Deployment

When deploying to Vercel or another platform:

1. Add your environment variables in the platform's settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. The app will automatically use these variables in production

## Security Notes

- The Supabase anon key is safe to expose publicly
- Row Level Security (RLS) ensures users can only access their own data
- Never commit `.env.local` to version control
- Use strong passwords for user accounts
- Consider enabling email confirmation in production (Supabase Auth settings)

## Support

For issues specific to this implementation, check:
- Supabase dashboard logs
- Browser developer console
- Next.js server logs

For Supabase-specific issues, check:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)

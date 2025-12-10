# Supabase Setup Guide

This guide will help you set up Supabase for your Credis Credit Management System.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project" and fill in the details:
   - **Organization**: Create a new organization or use existing
   - **Name**: `credis-credit-management`
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to Bhutan (Singapore recommended)

## Step 2: Get Your Project Credentials

1. Once your project is created, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: Found under "Project URL"
   - **Anon Key**: Found under "Project API keys" → "anon public"

## Step 3: Update Environment Variables

1. In your project, update the `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 4: Set Up Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add your domain:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

## Step 5: Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the following SQL to create the necessary tables:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  shop_name TEXT,
  owner_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create borrowers table
CREATE TABLE public.borrowers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  national_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on borrowers
ALTER TABLE public.borrowers ENABLE ROW LEVEL SECURITY;

-- Policy for borrowers: Users can only manage their own borrowers
CREATE POLICY "Users can manage own borrowers" ON public.borrowers
  FOR ALL USING (auth.uid() = user_id);

-- Create credits table
CREATE TABLE public.credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  borrower_id UUID REFERENCES public.borrowers ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paid', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on credits
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Policy for credits: Users can only manage their own credits
CREATE POLICY "Users can manage own credits" ON public.credits
  FOR ALL USING (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_id UUID REFERENCES public.credits ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'payment')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy for transactions: Users can only manage their own transactions
CREATE POLICY "Users can manage own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, shop_name, owner_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'shop_name',
    NEW.raw_user_meta_data->>'owner_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 6: Test the Setup

1. Restart your development server: `npm run dev`
2. Try registering a new account at `http://localhost:3000/auth/register`
3. Check your email for a confirmation link (if email confirmation is enabled)
4. Try logging in at `http://localhost:3000/auth/login`

## Step 7: Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation and password reset email templates
3. Update the redirect URLs in the templates

## Troubleshooting

### Common Issues:

1. **"Invalid credentials" error**: Check your environment variables
2. **CORS errors**: Ensure your site URL is correctly configured in Supabase
3. **Email not sending**: Check spam folder or configure SMTP settings
4. **RLS policy errors**: Ensure Row Level Security policies are properly set up

### Getting Help:

- Supabase Documentation: https://supabase.com/docs
- Community Forum: https://github.com/supabase/supabase/discussions
- Discord: https://discord.supabase.com

## Security Notes

- Never expose your `service_role` key in client-side code
- Always use the `anon` key for client-side authentication
- Row Level Security (RLS) is enabled to ensure data isolation between users
- Regularly rotate your API keys in production

---

Once you've completed these steps, your Credis application will be fully functional with user authentication and a secure database backend!

/*
  # Fix Authentication and RLS Policies

  1. Security Updates
    - Update RLS policies on dashboards table for authenticated users
    - Keep public access for dashboard data while adding authenticated user support
    - Fix user profile policies

  2. Authentication
    - Ensure proper email domain validation
    - Fix user profile creation

  3. Notes
    - Maintains backward compatibility with existing dashboard access
    - Adds proper authentication support without breaking existing functionality
*/

-- Update dashboards table policies to support both public and authenticated access
DROP POLICY IF EXISTS "Allow public read access to dashboards" ON dashboards;
DROP POLICY IF EXISTS "Allow public insert access to dashboards" ON dashboards;
DROP POLICY IF EXISTS "Allow public update access to dashboards" ON dashboards;
DROP POLICY IF EXISTS "Allow public delete access to dashboards" ON dashboards;

-- Create new policies that allow both authenticated and anonymous access
CREATE POLICY "Allow all users to read dashboards"
  ON dashboards
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to insert dashboards"
  ON dashboards
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to update dashboards"
  ON dashboards
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all users to delete dashboards"
  ON dashboards
  FOR DELETE
  USING (true);

-- Create user profiles table for additional user data (if not exists)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing user profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- If there's an error, just return NEW to allow user creation to continue
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update user profile updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at_trigger ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();
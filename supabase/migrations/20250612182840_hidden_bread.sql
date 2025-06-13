/*
  # Configure Authentication with Owner Role

  1. Security Updates
    - Drop and recreate RLS policies with proper owner permissions
    - Enable RLS on all tables
    - Add policies for authenticated users and service role
    
  2. Authentication Setup
    - Configure auth.users access
    - Set up proper user profile policies
    - Enable dashboard access for all users
    
  3. Owner Role Configuration
    - Ensure owner can bypass RLS when needed
    - Maintain data accessibility
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON dashboards;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON dashboards;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON dashboards;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Ensure RLS is enabled on all tables
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Dashboard policies - allow all access for now to maintain functionality
CREATE POLICY "Allow all dashboard access"
  ON dashboards
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- User profile policies - restrict to authenticated users
CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role (owner) to bypass RLS
CREATE POLICY "Service role full access to dashboards"
  ON dashboards
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to user_profiles"
  ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure auth schema access
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Grant necessary permissions
GRANT ALL ON dashboards TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON dashboards TO service_role;
GRANT ALL ON user_profiles TO service_role;
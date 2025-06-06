/*
  # Remove Row Level Security policies

  1. Security Changes
    - Drop all existing RLS policies on dashboards table
    - Disable Row Level Security on dashboards table
    - Allow unrestricted access until authentication is implemented

  2. Notes
    - This is a temporary measure for development
    - RLS should be re-enabled when authentication is added
*/

-- Drop all existing policies on dashboards table
DROP POLICY IF EXISTS "Allow authenticated users to read dashboards" ON dashboards;
DROP POLICY IF EXISTS "Allow authenticated users to insert dashboards" ON dashboards;
DROP POLICY IF EXISTS "Allow authenticated users to update dashboards" ON dashboards;
DROP POLICY IF EXISTS "Anonymous users can read dashboard data" ON dashboards;
DROP POLICY IF EXISTS "Users can manage dashboard data" ON dashboards;

-- Disable Row Level Security on dashboards table
ALTER TABLE dashboards DISABLE ROW LEVEL SECURITY;
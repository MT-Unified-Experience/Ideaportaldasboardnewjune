/*
  # Remove Row Level Security policies

  1. Security Changes
    - Drop all existing RLS policies on dashboards table
    - Disable Row Level Security on dashboards table
    - Allow public access to all dashboard data until authentication is implemented

  This migration removes all security restrictions to allow the application to function
  without authentication. RLS should be re-enabled when user authentication is added.
*/

-- Drop all existing policies on dashboards table
DROP POLICY IF EXISTS "Allow authenticated users to read dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Allow authenticated users to insert dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Allow authenticated users to update dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Users can manage dashboard data" ON public.dashboards;
DROP POLICY IF EXISTS "Anonymous users can read dashboard data" ON public.dashboards;

-- Disable Row Level Security on dashboards table
ALTER TABLE public.dashboards DISABLE ROW LEVEL SECURITY;
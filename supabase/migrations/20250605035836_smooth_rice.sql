/*
  # Fix Dashboards Table Migration
  
  1. Changes
    - Add existence checks for policies before creation
    - Maintain all existing table structure and functionality
    - Keep RLS and trigger functionality
    
  2. Security
    - Maintain existing security policies for authenticated users
    - Keep RLS enabled
*/

-- Create the dashboards table
CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product TEXT NOT NULL,
  quarter TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (product, quarter)
);

-- Enable Row Level Security
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.dashboards;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.dashboards;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.dashboards;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users"
  ON public.dashboards
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON public.dashboards
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON public.dashboards
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_dashboards_updated_at ON public.dashboards;
CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON public.dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
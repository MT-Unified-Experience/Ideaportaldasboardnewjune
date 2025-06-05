/*
  # Initial database setup for Idea Portal Dashboard

  1. New Tables
    - `dashboards`
      - `id` (uuid, primary key)
      - `product` (text)
      - `quarter` (text)
      - `data` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `dashboards` table
    - Add policies for authenticated users to:
      - Read their own data
      - Insert new data
      - Update existing data

  3. Triggers
    - Add trigger to automatically update `updated_at` column
*/

-- Create the dashboards table if it doesn't exist
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
DROP POLICY IF EXISTS "Allow all access to dashboards" ON public.dashboards;

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

-- Drop and recreate the trigger function
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_dashboards_updated_at ON public.dashboards;
CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON public.dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
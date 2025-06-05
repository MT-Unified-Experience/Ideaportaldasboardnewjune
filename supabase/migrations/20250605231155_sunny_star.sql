/*
  # Create dashboards table with updated trigger handling

  1. Table Structure
    - Creates dashboards table with UUID primary key
    - Includes product, quarter, data (JSONB), and timestamps
    - Adds unique constraint on product/quarter combination

  2. Security
    - Enables RLS
    - Sets up policies for authenticated users (read, insert, update)

  3. Trigger Management
    - Drops existing trigger and function
    - Recreates trigger function for timestamp updates
    - Creates new trigger for automatic timestamp updates
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

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS update_dashboards_updated_at ON public.dashboards;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Create the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger
CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON public.dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
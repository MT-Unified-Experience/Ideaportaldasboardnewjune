/*
  # Create dashboards table with policies

  1. New Tables
    - `dashboards`
      - `id` (uuid, primary key)
      - `product` (text)
      - `quarter` (text)
      - `data` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on dashboards table
    - Add policies for authenticated users to:
      - Read dashboards
      - Insert dashboards
      - Update dashboards
    - Add trigger for updating updated_at column
*/

-- Create dashboards table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  quarter text NOT NULL,
  data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index for product and quarter combination if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS unique_product_quarter ON public.dashboards (product, quarter);

-- Enable RLS
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow authenticated users to read dashboards" ON public.dashboards;
  DROP POLICY IF EXISTS "Allow authenticated users to insert dashboards" ON public.dashboards;
  DROP POLICY IF EXISTS "Allow authenticated users to update dashboards" ON public.dashboards;
END $$;

-- Create policies
CREATE POLICY "Allow authenticated users to read dashboards"
  ON public.dashboards
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert dashboards"
  ON public.dashboards
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update dashboards"
  ON public.dashboards
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create or replace function for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_dashboards_updated_at ON public.dashboards;
CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON public.dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
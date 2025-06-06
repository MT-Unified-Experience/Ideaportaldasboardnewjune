/*
  # Create dashboards table with proper constraints and policies

  1. New Tables
    - `dashboards`
      - `id` (uuid, primary key)
      - `product` (text, not null)
      - `quarter` (text, not null)
      - `data` (jsonb)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `dashboards` table
    - Add policies for authenticated users to read, insert, and update

  3. Constraints
    - Unique constraint on product and quarter combination

  4. Triggers
    - Auto-update trigger for updated_at column
*/

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create dashboards table
CREATE TABLE IF NOT EXISTS dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  quarter text NOT NULL,
  data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_product_quarter' 
    AND table_name = 'dashboards'
  ) THEN
    ALTER TABLE dashboards ADD CONSTRAINT unique_product_quarter UNIQUE (product, quarter);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Allow authenticated users to read dashboards" ON dashboards;
DROP POLICY IF EXISTS "Allow authenticated users to insert dashboards" ON dashboards;
DROP POLICY IF EXISTS "Allow authenticated users to update dashboards" ON dashboards;
DROP POLICY IF EXISTS "Anonymous users can read dashboard data" ON dashboards;
DROP POLICY IF EXISTS "Users can manage dashboard data" ON dashboards;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read dashboards"
  ON dashboards
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert dashboards"
  ON dashboards
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update dashboards"
  ON dashboards
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy for anonymous users to read data
CREATE POLICY "Anonymous users can read dashboard data"
  ON dashboards
  FOR SELECT
  TO anon
  USING (true);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_dashboards_updated_at ON dashboards;

-- Create trigger to automatically update updated_at column
CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
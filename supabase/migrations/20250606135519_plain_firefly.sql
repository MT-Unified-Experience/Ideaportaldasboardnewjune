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
    - Add policy for anonymous users to read data

  3. Constraints
    - Unique constraint on (product, quarter) combination

  4. Triggers
    - Auto-update `updated_at` column on updates
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

-- Handle unique constraint more carefully
DO $$
BEGIN
  -- First, try to drop the constraint if it exists
  BEGIN
    ALTER TABLE dashboards DROP CONSTRAINT IF EXISTS unique_product_quarter;
  EXCEPTION
    WHEN undefined_object THEN
      -- Constraint doesn't exist, which is fine
      NULL;
  END;
  
  -- Now add the constraint
  BEGIN
    ALTER TABLE dashboards ADD CONSTRAINT unique_product_quarter UNIQUE (product, quarter);
  EXCEPTION
    WHEN duplicate_table THEN
      -- Constraint already exists with this name, which is fine
      NULL;
  END;
END $$;

-- Also handle the index separately
DO $$
BEGIN
  -- Drop index if it exists
  DROP INDEX IF EXISTS idx_dashboards_product_quarter;
  
  -- Create the index
  CREATE INDEX idx_dashboards_product_quarter ON dashboards USING btree (product, quarter);
EXCEPTION
  WHEN duplicate_table THEN
    -- Index already exists, which is fine
    NULL;
END $$;

-- Enable Row Level Security
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
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

-- Handle trigger creation
DROP TRIGGER IF EXISTS update_dashboards_updated_at ON dashboards;

CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
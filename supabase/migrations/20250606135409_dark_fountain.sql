/*
  # Create dashboards table

  1. New Tables
    - `dashboards`
      - `id` (uuid, primary key, auto-generated)
      - `product` (text, required) - Product identifier
      - `quarter` (text, required) - Quarter identifier (e.g., "FY25 Q1")
      - `data` (jsonb, optional) - Dashboard data in JSON format
      - `created_at` (timestamptz, auto-generated) - Record creation timestamp
      - `updated_at` (timestamptz, auto-generated) - Record update timestamp

  2. Security
    - Enable RLS on `dashboards` table
    - Add policies for authenticated users to read, insert, and update their data

  3. Constraints
    - Unique constraint on (product, quarter) combination
    - Trigger to automatically update `updated_at` timestamp

  4. Functions
    - Create function to update `updated_at` column automatically
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

-- Create unique constraint on product and quarter combination
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_product_quarter'
  ) THEN
    ALTER TABLE dashboards ADD CONSTRAINT unique_product_quarter UNIQUE (product, quarter);
  END IF;
END $$;

-- Create unique index if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'unique_product_quarter'
  ) THEN
    CREATE UNIQUE INDEX unique_product_quarter ON dashboards USING btree (product, quarter);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
DO $$
BEGIN
  -- Policy for SELECT operations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dashboards' AND policyname = 'Allow authenticated users to read dashboards'
  ) THEN
    CREATE POLICY "Allow authenticated users to read dashboards"
      ON dashboards
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Policy for INSERT operations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dashboards' AND policyname = 'Allow authenticated users to insert dashboards'
  ) THEN
    CREATE POLICY "Allow authenticated users to insert dashboards"
      ON dashboards
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  -- Policy for UPDATE operations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dashboards' AND policyname = 'Allow authenticated users to update dashboards'
  ) THEN
    CREATE POLICY "Allow authenticated users to update dashboards"
      ON dashboards
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create trigger to automatically update updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_dashboards_updated_at'
  ) THEN
    CREATE TRIGGER update_dashboards_updated_at
      BEFORE UPDATE ON dashboards
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
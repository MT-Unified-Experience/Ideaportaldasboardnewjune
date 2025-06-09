/*
  # Create dashboards table with proper conflict handling

  1. New Tables
    - `dashboards`
      - `id` (uuid, primary key)
      - `product` (text, not null)
      - `quarter` (text, not null)
      - `data` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - Unique constraint on (product, quarter)

  2. Security
    - Enable RLS on `dashboards` table
    - Add policies for authenticated users to read, insert, and update

  3. Triggers
    - Create update trigger function if not exists
    - Create trigger to auto-update updated_at timestamp
*/

-- Create the dashboards table
CREATE TABLE IF NOT EXISTS public.dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  quarter text NOT NULL,
  data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_product_quarter UNIQUE (product, quarter)
);

-- Enable Row Level Security
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- Create policies with proper conflict handling
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dashboards' 
    AND policyname = 'Allow authenticated users to read dashboards'
  ) THEN
    CREATE POLICY "Allow authenticated users to read dashboards"
      ON public.dashboards
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dashboards' 
    AND policyname = 'Allow authenticated users to insert dashboards'
  ) THEN
    CREATE POLICY "Allow authenticated users to insert dashboards"
      ON public.dashboards
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dashboards' 
    AND policyname = 'Allow authenticated users to update dashboards'
  ) THEN
    CREATE POLICY "Allow authenticated users to update dashboards"
      ON public.dashboards
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create the update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_dashboards_updated_at'
  ) THEN
    CREATE TRIGGER update_dashboards_updated_at
      BEFORE UPDATE
      ON public.dashboards
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
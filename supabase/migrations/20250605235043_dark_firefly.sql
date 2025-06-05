/*
  # Create Dashboards Table
  
  1. New Tables
    - `dashboards`
      - `id` (uuid, primary key): Unique identifier for each dashboard entry
      - `product` (text): Product name
      - `quarter` (text): Quarter identifier
      - `data` (jsonb): JSON data containing dashboard metrics and information
      - `created_at` (timestamptz): Timestamp of creation
      - `updated_at` (timestamptz): Timestamp of last update
  
  2. Constraints
    - Primary key on `id`
    - Unique constraint on product and quarter combination
    - Enable RLS
  
  3. Security
    - Enable Row Level Security
    - Add policies for authenticated users to read and modify data
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

-- Create an update trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE
  ON public.dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
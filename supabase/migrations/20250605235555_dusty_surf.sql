/*
  # Create dashboards table and policies

  1. New Tables
    - `dashboards`
      - `id` (uuid, primary key)
      - `product` (text, not null)
      - `quarter` (text, not null)
      - `data` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Indexes
    - Unique index on (product, quarter) combination

  3. Security
    - Enable RLS
    - Add policies for authenticated users to:
      - Read all dashboards
      - Insert new dashboards
      - Update existing dashboards
*/

-- Create dashboards table
CREATE TABLE IF NOT EXISTS public.dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  quarter text NOT NULL,
  data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index for product and quarter combination
CREATE UNIQUE INDEX IF NOT EXISTS unique_product_quarter ON public.dashboards (product, quarter);

-- Enable RLS
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

-- Create trigger for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON public.dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
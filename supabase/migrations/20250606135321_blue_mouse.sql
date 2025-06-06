/*
  # Create dashboards table

  1. New Tables
    - `dashboards`
      - `id` (uuid, primary key)
      - `product` (text, not null)
      - `quarter` (text, not null) 
      - `data` (jsonb, not null) - stores dashboard data structure
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `dashboards` table
    - Add policy for authenticated users to manage dashboard data

  3. Constraints
    - Unique constraint on (product, quarter) combination
    - Indexes for better query performance
*/

-- Create dashboards table
CREATE TABLE IF NOT EXISTS public.dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product TEXT NOT NULL,
    quarter TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint for product-quarter combination
ALTER TABLE public.dashboards 
ADD CONSTRAINT IF NOT EXISTS dashboards_product_quarter_unique 
UNIQUE (product, quarter);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboards_product ON public.dashboards(product);
CREATE INDEX IF NOT EXISTS idx_dashboards_quarter ON public.dashboards(quarter);
CREATE INDEX IF NOT EXISTS idx_dashboards_product_quarter ON public.dashboards(product, quarter);

-- Enable Row Level Security
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage dashboard data
CREATE POLICY "Users can manage dashboard data"
    ON public.dashboards
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy for anonymous users to read dashboard data (if needed)
CREATE POLICY "Anonymous users can read dashboard data"
    ON public.dashboards
    FOR SELECT
    TO anon
    USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER IF NOT EXISTS update_dashboards_updated_at
    BEFORE UPDATE ON public.dashboards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
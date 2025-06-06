/*
  # Create dashboards table

  1. New Tables
    - `dashboards`
      - `id` (uuid, primary key)
      - `product` (text, not null)
      - `quarter` (text, not null) 
      - `data` (jsonb, not null, default empty object)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `dashboards` table
    - Add policy for authenticated users to manage all dashboard data
    - Add policy for anonymous users to read dashboard data

  3. Constraints & Indexes
    - Unique constraint on (product, quarter) combination
    - Performance indexes on product, quarter, and combined fields

  4. Triggers
    - Auto-update trigger for updated_at timestamp
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

-- Add unique constraint for product-quarter combination using DO block
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'dashboards_product_quarter_unique' 
        AND table_name = 'dashboards'
    ) THEN
        ALTER TABLE public.dashboards 
        ADD CONSTRAINT dashboards_product_quarter_unique 
        UNIQUE (product, quarter);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboards_product ON public.dashboards(product);
CREATE INDEX IF NOT EXISTS idx_dashboards_quarter ON public.dashboards(quarter);
CREATE INDEX IF NOT EXISTS idx_dashboards_product_quarter ON public.dashboards(product, quarter);

-- Enable Row Level Security
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage dashboard data
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'dashboards' 
        AND policyname = 'Users can manage dashboard data'
    ) THEN
        CREATE POLICY "Users can manage dashboard data"
            ON public.dashboards
            FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Create policy for anonymous users to read dashboard data
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'dashboards' 
        AND policyname = 'Anonymous users can read dashboard data'
    ) THEN
        CREATE POLICY "Anonymous users can read dashboard data"
            ON public.dashboards
            FOR SELECT
            TO anon
            USING (true);
    END IF;
END $$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_dashboards_updated_at'
    ) THEN
        CREATE TRIGGER update_dashboards_updated_at
            BEFORE UPDATE ON public.dashboards
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
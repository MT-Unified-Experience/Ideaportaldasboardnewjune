/*
  # Ensure features table exists with all required components

  1. Tables
    - Recreate `features` table if it doesn't exist
    - Add all necessary columns and constraints

  2. Security
    - Enable RLS on `features` table
    - Add policies for authenticated users

  3. Triggers
    - Add trigger for updated_at column
*/

-- Create features table if it doesn't exist
CREATE TABLE IF NOT EXISTS features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  quarter text NOT NULL,
  feature_name text NOT NULL,
  vote_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'Under Review',
  status_updated_at date,
  client_voters text[] DEFAULT '{}',
  estimated_impact text,
  resource_requirement text,
  strategic_alignment integer,
  risks text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product, quarter, feature_name)
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'features' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE features ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies if they don't exist
DO $$
BEGIN
  -- Check and create SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'features' 
    AND policyname = 'Authenticated users can read features'
  ) THEN
    CREATE POLICY "Authenticated users can read features"
      ON features
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Check and create INSERT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'features' 
    AND policyname = 'Authenticated users can insert features'
  ) THEN
    CREATE POLICY "Authenticated users can insert features"
      ON features
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  -- Check and create UPDATE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'features' 
    AND policyname = 'Authenticated users can update features'
  ) THEN
    CREATE POLICY "Authenticated users can update features"
      ON features
      FOR UPDATE
      TO authenticated
      USING (true);
  END IF;

  -- Check and create DELETE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'features' 
    AND policyname = 'Authenticated users can delete features'
  ) THEN
    CREATE POLICY "Authenticated users can delete features"
      ON features
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_features_updated_at'
  ) THEN
    CREATE TRIGGER update_features_updated_at
      BEFORE UPDATE ON features
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_features_product_quarter ON features(product, quarter);
CREATE INDEX IF NOT EXISTS idx_features_vote_count ON features(vote_count DESC);
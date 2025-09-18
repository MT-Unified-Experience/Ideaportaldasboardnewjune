/*
  # Create features table

  1. New Tables
    - `features`
      - `id` (uuid, primary key)
      - `product` (text)
      - `quarter` (text)
      - `feature_name` (text)
      - `vote_count` (integer)
      - `status` (text)
      - `status_updated_at` (date)
      - `client_voters` (text array)
      - `estimated_impact` (text, optional)
      - `resource_requirement` (text, optional)
      - `strategic_alignment` (integer, optional)
      - `risks` (text array, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `features` table
    - Add policy for authenticated users to read all features
    - Add policy for authenticated users to insert/update features
*/

-- Create features table
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

-- Enable RLS
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read features"
  ON features
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert features"
  ON features
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update features"
  ON features
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete features"
  ON features
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_features_updated_at
  BEFORE UPDATE ON features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_features_product_quarter ON features(product, quarter);
CREATE INDEX IF NOT EXISTS idx_features_vote_count ON features(vote_count DESC);
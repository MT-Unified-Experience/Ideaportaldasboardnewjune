/*
  # Create commitment_trends table

  1. New Tables
    - `commitment_trends`
      - `id` (uuid, primary key)
      - `product` (text)
      - `year` (text)
      - `committed` (integer, optional)
      - `delivered` (integer, optional)
      - `quarter` (text, optional)
      - `quarterly_delivered` (integer, optional)
      - `idea_id` (text, optional)
      - `idea_summary` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `commitment_trends` table
    - Add policy for authenticated users to read all commitment trends
    - Add policy for authenticated users to insert/update commitment trends
*/

-- Create commitment_trends table
CREATE TABLE IF NOT EXISTS commitment_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  year text NOT NULL,
  committed integer,
  delivered integer,
  quarter text,
  quarterly_delivered integer,
  idea_id text,
  idea_summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE commitment_trends ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read commitment trends"
  ON commitment_trends
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert commitment trends"
  ON commitment_trends
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update commitment trends"
  ON commitment_trends
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete commitment trends"
  ON commitment_trends
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_commitment_trends_updated_at
  BEFORE UPDATE ON commitment_trends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_commitment_trends_product_year ON commitment_trends(product, year);
CREATE INDEX IF NOT EXISTS idx_commitment_trends_product_quarter ON commitment_trends(product, quarter);
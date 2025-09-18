/*
  # Create responsiveness_trends table

  1. New Tables
    - `responsiveness_trends`
      - `id` (uuid, primary key)
      - `product` (text)
      - `quarter` (text)
      - `percentage` (integer)
      - `total_ideas` (integer)
      - `ideas_moved_out_of_review` (integer)
      - `ideas_list` (text array, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `responsiveness_trends` table
    - Add policy for authenticated users to read all responsiveness trends
    - Add policy for authenticated users to insert/update responsiveness trends
*/

-- Create responsiveness_trends table
CREATE TABLE IF NOT EXISTS responsiveness_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  quarter text NOT NULL,
  percentage integer NOT NULL DEFAULT 0,
  total_ideas integer NOT NULL DEFAULT 0,
  ideas_moved_out_of_review integer NOT NULL DEFAULT 0,
  ideas_list text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product, quarter)
);

-- Enable RLS
ALTER TABLE responsiveness_trends ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read responsiveness trends"
  ON responsiveness_trends
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert responsiveness trends"
  ON responsiveness_trends
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update responsiveness trends"
  ON responsiveness_trends
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete responsiveness trends"
  ON responsiveness_trends
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_responsiveness_trends_updated_at
  BEFORE UPDATE ON responsiveness_trends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_responsiveness_trends_product_quarter ON responsiveness_trends(product, quarter);
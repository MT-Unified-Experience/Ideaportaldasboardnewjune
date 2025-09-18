/*
  # Create continued_engagement table

  1. New Tables
    - `continued_engagement`
      - `id` (uuid, primary key)
      - `product` (text)
      - `quarter` (text)
      - `rate` (integer)
      - `numerator` (integer)
      - `denominator` (integer)
      - `idea_id` (text, optional)
      - `idea_name` (text, optional)
      - `initial_status_change` (date, optional)
      - `subsequent_changes` (jsonb, optional)
      - `days_between` (integer, optional)
      - `included` (boolean, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `continued_engagement` table
    - Add policy for authenticated users to read all continued engagement data
    - Add policy for authenticated users to insert/update continued engagement data
*/

-- Create continued_engagement table
CREATE TABLE IF NOT EXISTS continued_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  quarter text NOT NULL,
  rate integer NOT NULL DEFAULT 0,
  numerator integer NOT NULL DEFAULT 0,
  denominator integer NOT NULL DEFAULT 0,
  idea_id text,
  idea_name text,
  initial_status_change date,
  subsequent_changes jsonb,
  days_between integer,
  included boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE continued_engagement ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read continued engagement"
  ON continued_engagement
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert continued engagement"
  ON continued_engagement
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update continued engagement"
  ON continued_engagement
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete continued engagement"
  ON continued_engagement
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_continued_engagement_updated_at
  BEFORE UPDATE ON continued_engagement
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_continued_engagement_product_quarter ON continued_engagement(product, quarter);
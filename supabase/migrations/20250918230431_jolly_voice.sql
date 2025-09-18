/*
  # Create data_socialization_forums table

  1. New Tables
    - `data_socialization_forums`
      - `id` (uuid, primary key)
      - `product` (text)
      - `forum_name` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `data_socialization_forums` table
    - Add policy for authenticated users to read all forums
    - Add policy for authenticated users to insert/update forums
*/

-- Create data_socialization_forums table
CREATE TABLE IF NOT EXISTS data_socialization_forums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  forum_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product, forum_name)
);

-- Enable RLS
ALTER TABLE data_socialization_forums ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read forums"
  ON data_socialization_forums
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert forums"
  ON data_socialization_forums
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update forums"
  ON data_socialization_forums
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete forums"
  ON data_socialization_forums
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_data_socialization_forums_updated_at
  BEFORE UPDATE ON data_socialization_forums
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_data_socialization_forums_product ON data_socialization_forums(product);
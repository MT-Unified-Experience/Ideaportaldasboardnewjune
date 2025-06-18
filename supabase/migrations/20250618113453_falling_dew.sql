/*
  # Create action items table

  1. New Tables
    - `action_items`
      - `id` (uuid, primary key)
      - `product` (text, not null)
      - `quarter` (text, not null)
      - `text` (text, not null)
      - `completed` (boolean, default false)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `action_items` table
    - Add policies for public access (matching dashboard pattern)

  3. Indexes
    - Index on (product, quarter) for efficient querying
    - Index on created_at for ordering
*/

-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  quarter text NOT NULL,
  text text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_action_items_product_quarter ON action_items(product, quarter);
CREATE INDEX IF NOT EXISTS idx_action_items_created_at ON action_items(created_at);

-- Enable Row Level Security
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Create policies that allow public access (matching dashboard pattern)
CREATE POLICY "Allow all users to read action items"
  ON action_items
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all users to insert action items"
  ON action_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all users to update action items"
  ON action_items
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all users to delete action items"
  ON action_items
  FOR DELETE
  USING (true);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON action_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
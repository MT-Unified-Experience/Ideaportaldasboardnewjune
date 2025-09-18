/*
  # Create action_items table

  1. New Tables
    - `action_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `product` (text)
      - `quarter` (text)
      - `text` (text)
      - `completed` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `action_items` table
    - Add policy for users to read their own action items
    - Add policy for users to insert/update/delete their own action items
*/

-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product text NOT NULL,
  quarter text NOT NULL,
  text text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own action items"
  ON action_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own action items"
  ON action_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own action items"
  ON action_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own action items"
  ON action_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON action_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_action_items_user_product_quarter ON action_items(user_id, product, quarter);
CREATE INDEX IF NOT EXISTS idx_action_items_completed ON action_items(completed);
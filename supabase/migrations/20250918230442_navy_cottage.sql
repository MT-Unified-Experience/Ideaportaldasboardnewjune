/*
  # Create dashboard_configs table

  1. New Tables
    - `dashboard_configs`
      - `id` (uuid, primary key)
      - `product` (text)
      - `quarter` (text)
      - `user_id` (uuid, foreign key to profiles, optional)
      - `widget_settings` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `dashboard_configs` table
    - Add policy for users to read their own dashboard configs
    - Add policy for users to insert/update their own dashboard configs
*/

-- Create dashboard_configs table
CREATE TABLE IF NOT EXISTS dashboard_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  quarter text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  widget_settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product, quarter, user_id)
);

-- Enable RLS
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own dashboard configs"
  ON dashboard_configs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own dashboard configs"
  ON dashboard_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own dashboard configs"
  ON dashboard_configs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own dashboard configs"
  ON dashboard_configs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_dashboard_configs_updated_at
  BEFORE UPDATE ON dashboard_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_user_product_quarter ON dashboard_configs(user_id, product, quarter);
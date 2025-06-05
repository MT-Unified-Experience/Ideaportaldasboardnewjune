/*
  # Complete Database Schema Setup

  1. Tables
    - `dashboards`: Stores dashboard data for each product and quarter
      - `id` (uuid, primary key)
      - `product` (text)
      - `quarter` (text)
      - `data` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Functions
    - `update_updated_at_column`: Updates the updated_at timestamp
    
  3. Security
    - Enable RLS on dashboards table
    - Add policies for authenticated users
*/

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create dashboards table
CREATE TABLE IF NOT EXISTS dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  quarter text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product, quarter)
);

-- Enable RLS
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all access to dashboards"
  ON dashboards
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON dashboards
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users"
  ON dashboards
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable update access for authenticated users"
  ON dashboards
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
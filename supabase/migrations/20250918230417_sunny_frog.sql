/*
  # Create client_submissions table

  1. New Tables
    - `client_submissions`
      - `id` (uuid, primary key)
      - `product` (text)
      - `quarter` (text)
      - `clients_representing` (integer, optional)
      - `client_names` (text array, optional)
      - `idea_id` (text, optional)
      - `idea_summary` (text, optional)
      - `idea_client_name` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `client_submissions` table
    - Add policy for authenticated users to read all client submissions
    - Add policy for authenticated users to insert/update client submissions
*/

-- Create client_submissions table
CREATE TABLE IF NOT EXISTS client_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  quarter text NOT NULL,
  clients_representing integer,
  client_names text[] DEFAULT '{}',
  idea_id text,
  idea_summary text,
  idea_client_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE client_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read client submissions"
  ON client_submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert client submissions"
  ON client_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update client submissions"
  ON client_submissions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete client submissions"
  ON client_submissions
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_client_submissions_updated_at
  BEFORE UPDATE ON client_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_submissions_product_quarter ON client_submissions(product, quarter);
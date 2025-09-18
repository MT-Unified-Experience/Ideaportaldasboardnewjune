/*
  # Create cross_client_collaboration table

  1. New Tables
    - `cross_client_collaboration`
      - `id` (uuid, primary key)
      - `product` (text)
      - `quarter` (text)
      - `year` (text, optional)
      - `collaborative_ideas_count` (integer, optional)
      - `total_ideas_count` (integer, optional)
      - `collaboration_rate` (integer, optional)
      - `idea_id` (text, optional)
      - `idea_name` (text, optional)
      - `original_submitter` (text, optional)
      - `contributors` (text array, optional)
      - `submission_date` (date, optional)
      - `collaboration_score` (integer, optional)
      - `status` (text, optional)
      - `comments` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `cross_client_collaboration` table
    - Add policy for authenticated users to read all collaboration data
    - Add policy for authenticated users to insert/update collaboration data
*/

-- Create cross_client_collaboration table
CREATE TABLE IF NOT EXISTS cross_client_collaboration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product text NOT NULL,
  quarter text NOT NULL,
  year text,
  collaborative_ideas_count integer,
  total_ideas_count integer,
  collaboration_rate integer,
  idea_id text,
  idea_name text,
  original_submitter text,
  contributors text[] DEFAULT '{}',
  submission_date date,
  collaboration_score integer,
  status text,
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cross_client_collaboration ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read collaboration data"
  ON cross_client_collaboration
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert collaboration data"
  ON cross_client_collaboration
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update collaboration data"
  ON cross_client_collaboration
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete collaboration data"
  ON cross_client_collaboration
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_cross_client_collaboration_updated_at
  BEFORE UPDATE ON cross_client_collaboration
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cross_client_collaboration_product_quarter ON cross_client_collaboration(product, quarter);
/*
  # Enable Dashboard Access with RLS

  1. Security Changes
    - Enable RLS on `dashboards` table
    - Add policy for public read access to dashboard data
    - Add policy for public write access to dashboard data

  2. Notes
    - Since this appears to be a dashboard application without user authentication,
      we're allowing public access to the dashboards table
    - This enables the application to read and write dashboard data without authentication errors
*/

-- Enable Row Level Security on dashboards table
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to dashboards
CREATE POLICY "Allow public read access to dashboards"
  ON dashboards
  FOR SELECT
  TO public
  USING (true);

-- Create policy to allow public insert access to dashboards
CREATE POLICY "Allow public insert access to dashboards"
  ON dashboards
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy to allow public update access to dashboards
CREATE POLICY "Allow public update access to dashboards"
  ON dashboards
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policy to allow public delete access to dashboards
CREATE POLICY "Allow public delete access to dashboards"
  ON dashboards
  FOR DELETE
  TO public
  USING (true);
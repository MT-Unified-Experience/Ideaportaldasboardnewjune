/*
  # Create update_updated_at_column function

  1. Functions
    - `update_updated_at_column()` - Trigger function to automatically update updated_at timestamps

  2. Purpose
    - This function is used by triggers to automatically set updated_at columns when rows are updated
    - Required by the features table trigger
*/

-- Create the update function for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';
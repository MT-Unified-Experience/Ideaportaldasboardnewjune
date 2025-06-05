/*
  # Add ping function for connection testing
  
  1. New Functions
    - `ping()`: Returns 'pong' if database is accessible
    
  2. Security
    - Function is accessible to all authenticated users
    - Safe, read-only operation
*/

CREATE OR REPLACE FUNCTION ping()
RETURNS text AS $$
BEGIN
  RETURN 'pong';
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;
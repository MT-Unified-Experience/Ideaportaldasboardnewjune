/*
  # Password Reset Rate Limiting

  1. New Tables
    - `password_reset_attempts`
      - `id` (uuid, primary key)
      - `email` (text, not null)
      - `ip_address` (text, not null)
      - `attempted_at` (timestamp)
      - `success` (boolean, default false)

  2. Security
    - Enable RLS on `password_reset_attempts` table
    - Add policies for rate limiting checks
    - Add function to clean up old attempts

  3. Rate Limiting
    - Maximum 5 attempts per email per hour
    - Maximum 10 attempts per IP per hour
    - Automatic cleanup of attempts older than 24 hours
*/

-- Create password reset attempts table
CREATE TABLE IF NOT EXISTS password_reset_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text NOT NULL,
  attempted_at timestamptz DEFAULT now(),
  success boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE password_reset_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow service role full access to password_reset_attempts"
  ON password_reset_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION check_password_reset_rate_limit(
  user_email text,
  user_ip text
) RETURNS boolean AS $$
DECLARE
  email_attempts integer;
  ip_attempts integer;
BEGIN
  -- Count attempts by email in the last hour
  SELECT COUNT(*)
  INTO email_attempts
  FROM password_reset_attempts
  WHERE email = user_email
    AND attempted_at > now() - interval '1 hour';

  -- Count attempts by IP in the last hour
  SELECT COUNT(*)
  INTO ip_attempts
  FROM password_reset_attempts
  WHERE ip_address = user_ip
    AND attempted_at > now() - interval '1 hour';

  -- Return false if rate limits exceeded
  IF email_attempts >= 5 OR ip_attempts >= 10 THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log password reset attempt
CREATE OR REPLACE FUNCTION log_password_reset_attempt(
  user_email text,
  user_ip text,
  attempt_success boolean DEFAULT false
) RETURNS void AS $$
BEGIN
  INSERT INTO password_reset_attempts (email, ip_address, success)
  VALUES (user_email, user_ip, attempt_success);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up old attempts
CREATE OR REPLACE FUNCTION cleanup_old_password_reset_attempts() RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_attempts
  WHERE attempted_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_email_time 
  ON password_reset_attempts (email, attempted_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_ip_time 
  ON password_reset_attempts (ip_address, attempted_at);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_password_reset_rate_limit(text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION log_password_reset_attempt(text, text, boolean) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_old_password_reset_attempts() TO service_role;
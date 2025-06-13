/*
  # Create rate limiting functions for password reset

  1. New Functions
    - `check_password_reset_rate_limit` - Checks if a user/IP has exceeded rate limits
    - `log_password_reset_attempt` - Logs password reset attempts
    - `cleanup_old_password_reset_attempts` - Cleans up old attempt records

  2. Rate Limiting Rules
    - Maximum 5 attempts per email per hour
    - Maximum 10 attempts per IP per hour
    - Cleanup attempts older than 24 hours

  3. Security
    - Functions are accessible to authenticated and anonymous users
    - Uses existing password_reset_attempts table
*/

-- Function to check rate limits for password reset
CREATE OR REPLACE FUNCTION check_password_reset_rate_limit(
  user_email text,
  user_ip text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_attempts integer;
  ip_attempts integer;
  rate_limit_window interval := '1 hour';
  max_email_attempts integer := 5;
  max_ip_attempts integer := 10;
BEGIN
  -- Count recent attempts by email
  SELECT COUNT(*)
  INTO email_attempts
  FROM password_reset_attempts
  WHERE email = user_email
    AND attempted_at > (now() - rate_limit_window);

  -- Count recent attempts by IP
  SELECT COUNT(*)
  INTO ip_attempts
  FROM password_reset_attempts
  WHERE ip_address = user_ip
    AND attempted_at > (now() - rate_limit_window);

  -- Return false if either limit is exceeded
  IF email_attempts >= max_email_attempts OR ip_attempts >= max_ip_attempts THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- Function to log password reset attempts
CREATE OR REPLACE FUNCTION log_password_reset_attempt(
  user_email text,
  user_ip text,
  attempt_success boolean DEFAULT false
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO password_reset_attempts (email, ip_address, success, attempted_at)
  VALUES (user_email, user_ip, attempt_success, now());
END;
$$;

-- Function to cleanup old password reset attempts
CREATE OR REPLACE FUNCTION cleanup_old_password_reset_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM password_reset_attempts
  WHERE attempted_at < (now() - interval '24 hours');
END;
$$;

-- Grant execute permissions to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION check_password_reset_rate_limit(text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION log_password_reset_attempt(text, text, boolean) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_old_password_reset_attempts() TO authenticated, anon;
/*
  # Password Reset Rate Limiting Functions

  1. Functions
    - `check_password_reset_rate_limit` - Check if user has exceeded rate limits
    - `log_password_reset_attempt` - Log password reset attempts
    - `cleanup_old_password_reset_attempts` - Clean up old attempts

  2. Security
    - Functions are security definer to allow access to password_reset_attempts table
    - Rate limiting based on email and IP address
    - Configurable time windows and attempt limits
*/

-- Function to check password reset rate limiting
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
  email_limit integer := 5; -- Max 5 attempts per email per hour
  ip_limit integer := 10; -- Max 10 attempts per IP per hour
  time_window interval := '1 hour';
BEGIN
  -- Count recent attempts by email
  SELECT COUNT(*)
  INTO email_attempts
  FROM password_reset_attempts
  WHERE email = lower(user_email)
    AND attempted_at > (now() - time_window);

  -- Count recent attempts by IP
  SELECT COUNT(*)
  INTO ip_attempts
  FROM password_reset_attempts
  WHERE ip_address = user_ip
    AND attempted_at > (now() - time_window);

  -- Return false if either limit is exceeded
  IF email_attempts >= email_limit OR ip_attempts >= ip_limit THEN
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
  INSERT INTO password_reset_attempts (
    email,
    ip_address,
    success,
    attempted_at
  ) VALUES (
    lower(user_email),
    user_ip,
    attempt_success,
    now()
  );
END;
$$;

-- Function to cleanup old password reset attempts
CREATE OR REPLACE FUNCTION cleanup_old_password_reset_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete attempts older than 24 hours
  DELETE FROM password_reset_attempts
  WHERE attempted_at < (now() - interval '24 hours');
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION check_password_reset_rate_limit(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION log_password_reset_attempt(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_password_reset_attempts() TO authenticated;

-- Grant execute permissions to anon users for rate limiting
GRANT EXECUTE ON FUNCTION check_password_reset_rate_limit(text, text) TO anon;
GRANT EXECUTE ON FUNCTION log_password_reset_attempt(text, text, boolean) TO anon;
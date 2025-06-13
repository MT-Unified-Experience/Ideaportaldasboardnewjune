import { supabase } from './supabaseClient';

/**
 * Rate limiting utilities for password reset functionality
 */

// Get client IP address (fallback for development)
export const getClientIP = (): string => {
  // In a real production environment, you would get this from headers
  // For now, we'll use a fallback approach
  return 'unknown-ip';
};

/**
 * Check if password reset is rate limited for the given email and IP
 */
export const checkPasswordResetRateLimit = async (
  email: string,
  ipAddress: string = getClientIP()
): Promise<{ allowed: boolean; message?: string }> => {
  try {
    const { data, error } = await supabase.rpc('check_password_reset_rate_limit', {
      user_email: email.toLowerCase(),
      user_ip: ipAddress
    });

    if (error) {
      console.error('Rate limit check error:', error);
      
      // If the function doesn't exist, allow the request but log it
      if (error.message?.includes('function') && error.message?.includes('does not exist')) {
        console.warn('Rate limiting function not available, allowing request');
        return { allowed: true };
      }
      
      // For other errors, be conservative and allow the request
      return { allowed: true };
    }

    // If data is false, rate limit is exceeded
    if (data === false) {
      return {
        allowed: false,
        message: 'Too many password reset attempts. Please try again later.'
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Allow the request if rate limiting fails
    return { allowed: true };
  }
};

/**
 * Log a password reset attempt
 */
export const logPasswordResetAttempt = async (
  email: string,
  success: boolean = false,
  ipAddress: string = getClientIP()
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('log_password_reset_attempt', {
      user_email: email.toLowerCase(),
      user_ip: ipAddress,
      attempt_success: success
    });

    if (error) {
      console.error('Failed to log password reset attempt:', error);
      
      // If the function doesn't exist, just log it but don't throw
      if (error.message?.includes('function') && error.message?.includes('does not exist')) {
        console.warn('Password reset logging function not available');
        return;
      }
    }
  } catch (error) {
    console.error('Failed to log password reset attempt:', error);
    // Don't throw errors for logging failures
  }
};

/**
 * Clean up old password reset attempts (should be called periodically)
 */
export const cleanupOldPasswordResetAttempts = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('cleanup_old_password_reset_attempts');

    if (error) {
      console.error('Failed to cleanup old password reset attempts:', error);
      
      if (error.message?.includes('function') && error.message?.includes('does not exist')) {
        console.warn('Password reset cleanup function not available');
        return;
      }
    }
  } catch (error) {
    console.error('Failed to cleanup old password reset attempts:', error);
  }
};

/**
 * Password strength validation
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
} => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const score = Object.values(requirements).filter(Boolean).length;
  const isValid = score >= 4 && requirements.length;
  
  return { requirements, score, isValid };
};

/**
 * Generate a secure random token (client-side utility)
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomArray[i] % chars.length);
  }
  
  return result;
};
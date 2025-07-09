import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../lib/utils';

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Check if we have the required tokens from the URL
  useEffect(() => {
    const validateResetToken = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('Reset password URL validation:', {
        accessToken: accessToken ? 'present' : 'missing',
        refreshToken: refreshToken ? 'present' : 'missing',
        type,
        error,
        errorDescription,
        fullUrl: window.location.href
      });

      // Check for error parameters first
      if (error) {
        console.error('Password reset error from URL:', error, errorDescription);
        setError(`Password reset failed: ${errorDescription || error}`);
        setTokenValid(false);
        setValidatingToken(false);
        return;
      }

      // Check for required parameters
      if (type !== 'recovery') {
        console.error('Invalid type parameter:', type);
        setError('Invalid reset link type. Please request a new password reset.');
        setTokenValid(false);
        setValidatingToken(false);
        return;
      }

      if (!accessToken || !refreshToken) {
        console.error('Missing tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
        setError('Invalid reset link format. Missing authentication tokens.');
        setTokenValid(false);
        setValidatingToken(false);
        return;
      }

      // Try to set the session with the tokens
      if (supabase) {
        try {
          console.log('Setting session with recovery tokens...');
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Error setting session:', sessionError);
            setError(`Invalid or expired reset link: ${sessionError.message}`);
            setTokenValid(false);
          } else if (data.session) {
            console.log('Session set successfully for password recovery');
            setTokenValid(true);
          } else {
            console.error('No session returned after setting tokens');
            setError('Failed to establish recovery session. Please request a new password reset.');
            setTokenValid(false);
          }
        } catch (err) {
          console.error('Exception during session setup:', err);
          setError('An error occurred while validating the reset link.');
          setTokenValid(false);
        }
      } else {
        setError('Authentication service not available');
        setTokenValid(false);
      }

      setValidatingToken(false);
    };

    validateResetToken();
  }, [searchParams]);

  const onSubmit = async (formData: ResetPasswordFormValues) => {
    if (!supabase) {
      setError('Authentication service not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting to update password...');
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        console.error('Password update error:', error);
        setError(error.message || 'Failed to update password');
        return;
      }

      console.log('Password updated successfully');
      setSuccess(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password updated successfully. Please sign in with your new password.' 
          } 
        });
      }, 2000);

    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Validating Reset Link</h2>
            <p className="text-gray-600">Please wait while we verify your password reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl">
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            {/* Debug Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Debug Information:</h3>
              <div className="text-xs text-gray-600 space-y-1 font-mono">
                <p><strong>Expected URL format:</strong> /reset-password?access_token=...&refresh_token=...&type=recovery</p>
                <p><strong>Current URL:</strong> {window.location.href}</p>
                <p><strong>Access Token:</strong> {searchParams.get('access_token') ? 'Present' : 'Missing'}</p>
                <p><strong>Refresh Token:</strong> {searchParams.get('refresh_token') ? 'Present' : 'Missing'}</p>
                <p><strong>Type:</strong> {searchParams.get('type') || 'Missing'}</p>
                <p><strong>Error:</strong> {searchParams.get('error') || 'None'}</p>
                <p><strong>Error Description:</strong> {searchParams.get('error_description') || 'None'}</p>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded text-xs">
                <p><strong>Troubleshooting:</strong></p>
                <div className="space-y-1 mt-1">
                  <p>1. Check Supabase Dashboard → Authentication → URL Configuration</p>
                  <p>2. Verify Site URL matches your deployed domain</p>
                  <p>3. Ensure redirect URL includes /reset-password</p>
                  <p>4. Check email template uses {`{{ .RedirectTo }}`} (not ConfirmationURL)</p>
                  <p>5. Try requesting a fresh password reset</p>
                </div>
              </div>
            </div>
            
            <Button onClick={handleBackToLogin} className="w-full">
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Password Updated!</h2>
            <p className="text-gray-600 mb-6">Your password has been successfully updated. You will be redirected to the login page shortly.</p>
            <Button onClick={handleBackToLogin} className="w-full">
              Continue to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://zeroheight.com/uploads/bTrE5GlYoF0YjoTaTAKJZQ.svg')] bg-cover bg-center bg-no-repeat opacity-40"></div>
      
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img 
              src="https://i.postimg.cc/ncRCb0XK/Mitratech-CLC.png" 
              alt="Mitratech" 
              className="mx-auto h-12 w-auto mb-4"
            />
            <h1 className="text-2xl font-semibold text-gray-900">Reset Your Password</h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password below
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  disabled={isLoading}
                  className={cn(errors.password && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                  className={cn(errors.confirmPassword && "border-red-500 focus:ring-red-500 focus:border-red-500")}
                  {...register("confirmPassword")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={handleBackToLogin}
              disabled={isLoading}
              className="text-sm"
            >
              Back to Login
            </Button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>© 2025 Mitratech. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
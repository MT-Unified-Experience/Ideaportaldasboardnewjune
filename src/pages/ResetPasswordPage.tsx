import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
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
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (formData: ResetPasswordFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate password reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Password updated successfully (demo mode)');
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
              Enter your new password below (Demo Mode)
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50">
              <div className="flex items-center">
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
                "Update Password (Demo)"
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
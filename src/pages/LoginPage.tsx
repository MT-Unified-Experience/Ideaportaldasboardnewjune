import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Auth } from '../components/ui/auth-form-1';

const LoginPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }
  
  // If already authenticated, redirect to dashboard or return url
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://zeroheight.com/uploads/bTrE5GlYoF0YjoTaTAKJZQ.svg')] bg-cover bg-center bg-no-repeat opacity-40"></div>
      
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Auth Component */}
        <Auth />
        
        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>© 2024 Mitratech. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
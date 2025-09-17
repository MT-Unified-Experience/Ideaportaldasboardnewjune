import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              } 
            />
            {/* Catch all other routes */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                  <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                  <a href="/login" className="text-blue-600 hover:text-blue-800">Go to Login</a>
                </div>
              </div>
            } />
          </Routes>
        </DataProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for stored user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('demo-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.warn('Error parsing stored user:', error);
        localStorage.removeItem('demo-user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Only allow specific credentials
      if (email !== 'unifiedux@mitratech.com') {
        return { success: false, error: 'Invalid email address' };
      }
      
      if (password !== 'Test123') {
        return { success: false, error: 'Invalid password' };
      }
      
      // Create demo user
      const demoUser: User = {
        id: 'demo-user-id',
        email: 'unifiedux@mitratech.com',
        user_metadata: {
          full_name: 'Unified UX'
        }
      };
      
      setUser(demoUser);
      localStorage.setItem('demo-user', JSON.stringify(demoUser));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Demo validation
      if (!email.endsWith('@mitratech.com')) {
        return { success: false, error: 'Only @mitratech.com email addresses are allowed' };
      }
      
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }
      
      // Create demo user
      const demoUser: User = {
        id: 'demo-user-id',
        email: email,
        user_metadata: {
          full_name: fullName || email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())
        }
      };
      
      setUser(demoUser);
      localStorage.setItem('demo-user', JSON.stringify(demoUser));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      localStorage.removeItem('demo-user');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo validation
      if (!email.endsWith('@mitratech.com')) {
        return { success: false, error: 'Only @mitratech.com email addresses are allowed' };
      }
      
      // In demo mode, always return success
      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      login, 
      signup, 
      logout, 
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
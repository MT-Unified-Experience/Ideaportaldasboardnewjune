import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
import { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        if (!supabase) {
          console.warn('Supabase not available, using offline mode');
          setLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase) {
        // Fallback for offline mode - use the previous mock logic
        if (email.endsWith('@mitratech.com') && password.length >= 8) {
          // Create a mock user for offline mode
          const mockUser = {
            id: 'mock-user-id',
            email: email,
            user_metadata: {
              full_name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
          } as User;
          
          setUser(mockUser);
          setSession({ user: mockUser } as Session);
          return { success: true };
        }
        return { success: false, error: 'Invalid email or password' };
      }

      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('Login error:', error);
        return { 
          success: false, 
          error: getAuthErrorMessage(error)
        };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Unexpected login error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase) {
        return { success: false, error: 'Authentication service not available' };
      }

      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { 
          success: false, 
          error: getAuthErrorMessage(error)
        };
      }

      if (data.user) {
        // Note: User might need to confirm email depending on Supabase settings
        return { success: true };
      }

      return { success: false, error: 'Signup failed' };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (!supabase) {
        // Offline mode logout
        setUser(null);
        setSession(null);
        return;
      }

      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Clear state regardless of error
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Unexpected logout error:', error);
      // Clear state even if there's an error
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!supabase) {
        return { success: false, error: 'Authentication service not available' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        return { 
          success: false, 
          error: getAuthErrorMessage(error)
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected password reset error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      session, 
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

// Helper function to convert Supabase auth errors to user-friendly messages
const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'Email not confirmed':
      return 'Please check your email and click the confirmation link before signing in.';
    case 'User not found':
      return 'No account found with this email address.';
    case 'Invalid email':
      return 'Please enter a valid email address.';
    case 'Password should be at least 6 characters':
      return 'Password must be at least 6 characters long.';
    case 'User already registered':
      return 'An account with this email already exists. Please sign in instead.';
    case 'Signup is disabled':
      return 'Account registration is currently disabled. Please contact your administrator.';
    case 'Only @mitratech.com email addresses are allowed':
      return 'Only Mitratech email addresses (@mitratech.com) are allowed to register.';
    default:
      // Check if the error message contains the domain restriction
      if (error.message?.includes('@mitratech.com')) {
        return 'Only Mitratech email addresses (@mitratech.com) are allowed to register.';
      }
      // Return the original error message if we don't have a specific mapping
      return error.message || 'An authentication error occurred. Please try again.';
  }
};
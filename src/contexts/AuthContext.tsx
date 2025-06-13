import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
import { User, AuthState, SignUpData, SignInData, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Validate Mitratech email domain
  const validateMitratechEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith('@mitratech.com');
  };

  // Clear error state
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Sign up function
  const signUp = async (data: SignUpData): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Validate email domain
      if (!validateMitratechEmail(data.email)) {
        throw new Error('Only @mitratech.com email addresses are allowed');
      }

      // Validate password strength
      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      console.log('Attempting to sign up user:', data.email);

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/reset-password`,
          data: {
            full_name: data.fullName || '',
          },
        },
      });

      if (error) {
        console.error('Supabase sign up error:', error);
        throw error;
      }

      console.log('Sign up response:', authData);

      if (authData.user && !authData.session) {
        // Email confirmation required
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Account created successfully! You can now sign in with your credentials.',
        }));
      } else if (authData.user && authData.session) {
        // User is immediately signed in
        console.log('User signed up and logged in:', authData.user);
        setAuthState(prev => ({
          ...prev,
          user: authData.user as User,
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred during sign up',
      }));
      throw error;
    }
  };

  // Sign in function
  const signIn = async (data: SignInData): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Validate email domain
      if (!validateMitratechEmail(data.email)) {
        throw new Error('Only @mitratech.com email addresses are allowed');
      }

      console.log('Attempting to sign in user:', data.email);

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('Supabase sign in error:', error);
        throw error;
      }

      console.log('Sign in response:', authData);

      if (authData.user) {
        console.log('User signed in successfully:', authData.user);
        setAuthState(prev => ({
          ...prev,
          user: authData.user as User,
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred during sign in',
      }));
      throw error;
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred during sign out',
      }));
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    let mounted = true;
    
    console.log('Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        
        if (session?.user) {
          // Validate that the user has a Mitratech email
          if (!validateMitratechEmail(session.user.email || '')) {
            console.warn('Invalid email domain, signing out:', session.user.email);
            await supabase.auth.signOut();
            setAuthState({
              user: null,
              loading: false,
              error: 'Only @mitratech.com email addresses are allowed',
            });
            return;
          }

          console.log('Setting authenticated user:', session.user.email);
          setAuthState({
            user: session.user as User,
            loading: false,
            error: null,
          });
        } else {
          console.log('No session, setting user to null');
          setAuthState({
            user: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      mounted = false;
      console.log('Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  // Check initial session
  useEffect(() => {
    let mounted = true;
    
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          throw error;
        }

        if (!mounted) return;
        
        if (session?.user) {
          // Validate that the user has a Mitratech email
          if (!validateMitratechEmail(session.user.email || '')) {
            console.warn('Invalid email domain in initial session, signing out:', session.user.email);
            await supabase.auth.signOut();
            setAuthState({
              user: null,
              loading: false,
              error: 'Only @mitratech.com email addresses are allowed',
            });
            return;
          }

          console.log('Initial session found for user:', session.user.email);
          setAuthState({
            user: session.user as User,
            loading: false,
            error: null,
          });
        } else {
          console.log('No initial session found');
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        if (!mounted) return;
        
        console.error('Error in getInitialSession:', error);
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to get session',
        });
      }
    };

    getInitialSession();
    
    return () => {
      mounted = false;
    };
  }, []);

  const value: AuthContextType = {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signUp,
    signIn,
    signOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
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
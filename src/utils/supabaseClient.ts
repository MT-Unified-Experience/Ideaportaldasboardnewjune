import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';

// Helper function to validate and format Supabase URL
const validateSupabaseUrl = (url: string): string => {
  if (!url) {
    console.warn('VITE_SUPABASE_URL is not defined in environment variables');
    return '';
  }
  const trimmedUrl = url.trim().replace(/\/+$/, '');
  return trimmedUrl;
};

// Use proxy URL in development, direct URL in production
const getSupabaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  
  // In development, use the proxy with absolute URL
  if (import.meta.env.DEV) {
    return `${window.location.origin}/api`;
  }
  
  // In production, use the direct URL
  return validateSupabaseUrl(envUrl);
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Application will work in offline mode.');
}

const supabaseOptions: SupabaseClientOptions<any> = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth-token',
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    },
    fetch: (url, options = {}) => {
      // Add timeout and better error handling to all requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn('⏰ Request timeout for:', url);
        controller.abort();
      }, 30000); // 30 second timeout

      // Ensure proper headers for auth requests
      const headers = {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
        ...options.headers
      };

      return fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      }).then(response => {
        clearTimeout(timeoutId);
        
        // Handle auth-specific errors
        if (!response.ok && url.includes('/auth/')) {
          console.warn(`🔐 Auth request failed: ${response.status} ${response.statusText} for ${url}`);
          
          if (response.status === 403) {
            console.warn('💡 403 Forbidden - This might be due to:');
            console.warn('1. Incorrect API key configuration');
            console.warn('2. Missing CORS settings in Supabase dashboard');
            console.warn('3. Supabase project not properly configured');
            console.warn('4. Check your .env file for correct VITE_SUPABASE_ANON_KEY');
          }
        }
        
        return response;
      }).catch(error => {
        clearTimeout(timeoutId);
        
        // Handle specific error types gracefully
        if (error.name === 'AbortError') {
          console.warn('🔥 Request aborted due to timeout:', url);
          throw new Error('Request timeout - please check your connection');
        }
        
        if (error.message?.includes('Failed to fetch')) {
          console.warn('🔥 Network error for:', url);
          throw new Error('Network error - please check your connection');
        }
        
        throw error;
      });
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
};

// Create a safe Supabase client that won't throw errors if env vars are missing
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, supabaseOptions)
  : null as any; // Fallback for when Supabase is not configured

// Helper function to get the correct API URL for direct fetch calls
export const getApiUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (import.meta.env.DEV) {
    // In development, use the proxy
    return `/api/${cleanPath}`;
  } else {
    // In production, use the direct Supabase URL
    const directUrl = validateSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || '');
    return `${directUrl}/${cleanPath}`;
  }
};

// Helper function to create headers for direct API calls
export const getApiHeaders = (): HeadersInit => {
  return {
    'apikey': supabaseAnonKey,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
    'Connection': 'keep-alive'
  };
};

// Enhanced auth-specific helper functions
export const signOut = async (): Promise<{ error: any }> => {
  try {
    if (!supabase) {
      return { error: new Error('Supabase client not initialized') };
    }
    
    console.log('🔐 Attempting to sign out...');
    
    // Clear local storage first to prevent token conflicts
    const storageKeys = ['sb-auth-token', 'mitratech-dashboard-auth'];
    storageKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.warn('🔐 Sign out error:', error.message);
      
      // Handle specific auth errors
      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        console.warn('💡 Sign out failed due to authorization issue. This might be due to:');
        console.warn('1. Incorrect API key in .env file');
        console.warn('2. Missing CORS configuration in Supabase dashboard');
        console.warn('3. Supabase project configuration issues');
        return { error: null }; // Treat as successful local sign out
      }
      
      // For refresh token errors, clear storage and treat as success
      if (error.message?.includes('refresh') || error.message?.includes('token')) {
        console.warn('💡 Token-related error during sign out, clearing local storage');
        return { error: null };
      }
      
      return { error };
    }
    
    console.log('✅ Successfully signed out');
    return { error: null };
  } catch (error: any) {
    console.warn('🔥 Unexpected error during sign out:', error.message);
    
    // Clear local session as fallback
    const storageKeys = ['sb-auth-token', 'mitratech-dashboard-auth'];
    storageKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    return { error: null }; // Treat as successful local sign out
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }
    
    console.log('🔐 Attempting to sign in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.warn('🔐 Sign in error:', error.message);
      return { data: null, error };
    }
    
    console.log('✅ Successfully signed in');
    return { data, error: null };
  } catch (error: any) {
    console.warn('🔥 Unexpected error during sign in:', error.message);
    return { data: null, error };
  }
};

// Enhanced fetch wrapper for Supabase REST API calls with retry logic
export const supabaseFetch = async (
  path: string, 
  options: RequestInit = {},
  retries: number = 3
): Promise<Response> => {
  const url = getApiUrl(path);
  const headers = {
    ...getApiHeaders(),
    ...options.headers
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn(`⏰ Request timeout (attempt ${attempt}/${retries}):`, url);
        controller.abort();
      }, 30000); // 30 second timeout

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle specific HTTP errors
        if (response.status === 503) {
          throw new Error('Service temporarily unavailable');
        }
        if (response.status === 403) {
          throw new Error('Access forbidden - check API key and CORS settings');
        }
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error: any) {
      console.warn(`🔥 Supabase fetch error (attempt ${attempt}/${retries}):`, error.message);
      
      // Don't retry on certain errors
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        if (attempt === retries) {
          throw new Error('Request timeout - please check your connection and try again');
        }
      } else if (error.message?.includes('Failed to fetch')) {
        if (attempt === retries) {
          throw new Error('Network error - please check your connection and try again');
        }
      } else if (error.message?.includes('HTTP error! status: 4')) {
        // Don't retry 4xx errors
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max retries exceeded');
};

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return false;
    }
    
    if (!supabaseAnonKey) {
      console.warn('Supabase environment variables not configured');
      return false;
    }
    
    // Test connection with a simple query and timeout
    const response = await supabaseFetch('rest/v1/dashboards?select=id&limit=1');
    
    console.log('✅ Supabase connection successful');
    return true;
      
  } catch (error: any) {
    // Handle all types of errors gracefully
    const errorMessage = error?.message || 'Unknown error';
    
    console.warn('🔥 Failed to connect to Supabase:', errorMessage);
    
    // Provide helpful debugging information
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network error')) {
      console.warn('💡 To fix this issue:');
      console.warn('1. Check your internet connection');
      console.warn('2. Verify your Supabase project is active');
      console.warn('3. Go to your Supabase project dashboard');
      console.warn('4. Navigate to Settings > API');
      console.warn('5. Add "http://localhost:5173" to the CORS allowed origins');
      console.warn('6. Save the settings and refresh this page');
    }
    
    if (errorMessage.includes('Access forbidden') || errorMessage.includes('403')) {
      console.warn('💡 Access forbidden - this might be due to:');
      console.warn('1. Incorrect VITE_SUPABASE_ANON_KEY in .env file');
      console.warn('2. Missing CORS configuration in Supabase dashboard');
      console.warn('3. Supabase project not properly configured');
      console.warn('4. API key might be expired or invalid');
    }
    
    if (errorMessage.includes('timeout')) {
      console.warn('💡 Connection timeout - this might be due to:');
      console.warn('1. Slow internet connection');
      console.warn('2. Supabase service temporarily overloaded');
      console.warn('3. Network firewall blocking the connection');
    }
    
    // Additional debugging information
    console.warn('🔍 Debug Information:');
    console.warn('- Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing');
    console.warn('- Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
    console.warn('- Environment:', import.meta.env.DEV ? 'Development' : 'Production');
    
    console.warn('Working in offline mode.');
    return false;
  }
};

// Helper function to check if user is authenticated with error handling
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    if (!supabase) return false;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Authentication check error:', error.message);
      return false;
    }
    return !!session;
  } catch (error) {
    console.warn('Error checking authentication, assuming not authenticated:', error);
    return false;
  }
};

// Helper function to get current user with error handling
export const getCurrentUser = async () => {
  try {
    if (!supabase) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.warn('Get user error:', error.message);
      return null;
    }
    return user;
  } catch (error) {
    console.warn('Error getting current user:', error);
    return null;
  }
};
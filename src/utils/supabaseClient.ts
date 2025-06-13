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

const supabaseUrl = validateSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Application will work in offline mode.');
}

const supabaseOptions: SupabaseClientOptions<any> = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'mitratech-dashboard-auth',
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
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

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return false;
    }
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
    
    // Test connection with a simple query - wrap in additional error handling
    const connectionPromise = supabase
      .from('dashboards')
      .select('id')
      .limit(1)
      .then(result => result)
      .catch(error => {
        // Handle fetch errors specifically
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
          throw new Error('Network connection failed');
        }
        throw error;
      });
      
    const { data, error } = await Promise.race([connectionPromise, timeoutPromise]);
      
    if (error) {
      console.warn('Database connection issue:', error.message);
      
      // If it's an RLS error, try to handle it gracefully
      if (error.message.includes('RLS') || error.message.includes('policy')) {
        console.warn('RLS policy issue detected, but connection is working');
        return true;
      }
      
      // For other errors, still consider connection as working but log the issue
      console.warn('Supabase connection has issues but will continue in offline mode');
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error: any) {
    // Handle network errors gracefully
    if (error.message === 'Connection timeout') {
      console.warn('Supabase connection timed out. Working in offline mode.');
    } else if (error.message === 'Network connection failed' || error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.warn('Network error connecting to Supabase. Working in offline mode.');
    } else if (error.message.includes('fetch')) {
      console.warn('Network fetch error connecting to Supabase. Working in offline mode.');
    } else {
      console.warn('Failed to connect to Supabase:', error.message);
    }
    return false;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    if (!supabase) return false;
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.warn('Error checking authentication, assuming not authenticated:', error);
    return false;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.warn('Error getting current user:', error);
    return null;
  }
};
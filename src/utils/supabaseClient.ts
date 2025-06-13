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
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables not configured');
      return false;
    }
    
    // Create a more robust timeout mechanism
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 2000); // Reduced timeout
    });
    
    // Test connection with a simple query - wrap in comprehensive error handling
    const connectionPromise = new Promise((resolve, reject) => {
      supabase
        .from('dashboards')
        .select('id')
        .limit(1)
        .then(result => {
          // Even if there's an error, if we get a response structure, connection is working
          resolve(result);
        })
        .catch(error => {
          // Reject all errors to be handled in the outer catch
          reject(error);
        });
    });
      
    await Promise.race([connectionPromise, timeoutPromise]);
    
    // If we got here, the connection worked
    console.log('Supabase connection successful');
    return true;
    
  } catch (error: any) {
    // Handle all types of connection errors gracefully
    const errorMessage = error?.message || 'Unknown error';
    const errorName = error?.name || '';
    
    // More comprehensive error detection
    if (errorMessage.includes('Connection timeout')) {
      console.warn('Supabase connection timed out. Working in offline mode.');
    } else if (
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('ERR_NETWORK') ||
      errorMessage.includes('network') ||
      errorName === 'TypeError' ||
      errorName === 'NetworkError' ||
      error?.code === 'NETWORK_ERROR'
    ) {
      console.warn('Network error connecting to Supabase. Working in offline mode.');
    } else {
      console.warn('Failed to connect to Supabase:', errorMessage, 'Working in offline mode.');
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
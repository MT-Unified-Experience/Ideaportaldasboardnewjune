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
    },
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
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };
};

// Enhanced fetch wrapper for Supabase REST API calls
export const supabaseFetch = async (
  path: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const url = getApiUrl(path);
  const headers = {
    ...getApiHeaders(),
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Supabase fetch error:', error);
    throw error;
  }
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      // Use the enhanced fetch for testing connection
      const response = await supabaseFetch('rest/v1/dashboards?select=id&limit=1', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Supabase connection successful');
      return true;
      
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle specific network errors
      if (fetchError.name === 'AbortError') {
        console.warn('Supabase connection timeout. Please check your network connection.');
        return false;
      }
      
      if (fetchError.message?.includes('Failed to fetch')) {
        console.warn('Network error connecting to Supabase. This might be due to:');
        console.warn('1. CORS configuration - ensure your development URL is added to Supabase allowed origins');
        console.warn('2. Network connectivity issues');
        console.warn('3. Incorrect Supabase URL or API key');
        console.warn('Working in offline mode.');
        return false;
      }
      
      throw fetchError; // Re-throw if it's not a network error
    }
    
  } catch (error: any) {
    // Handle all other types of errors gracefully
    const errorMessage = error?.message || 'Unknown error';
    
    console.warn('Failed to connect to Supabase:', errorMessage);
    
    // Provide helpful debugging information
    if (errorMessage.includes('Failed to fetch')) {
      console.warn('💡 To fix this issue:');
      console.warn('1. Go to your Supabase project dashboard');
      console.warn('2. Navigate to Settings > API');
      console.warn('3. Add "http://localhost:5173" to the CORS allowed origins');
      console.warn('4. Save the settings and refresh this page');
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
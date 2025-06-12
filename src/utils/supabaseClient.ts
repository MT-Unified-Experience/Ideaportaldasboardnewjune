import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';

// Helper function to validate and format Supabase URL
const validateSupabaseUrl = (url: string): string => {
  if (!url) {
    throw new Error('VITE_SUPABASE_URL is not defined in environment variables');
  }
  const trimmedUrl = url.trim().replace(/\/+$/, '');
  return trimmedUrl;
};

const supabaseUrl = validateSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

if (!supabaseAnonKey.trim()) {
  throw new Error('VITE_SUPABASE_ANON_KEY is empty in environment variables');
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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('dashboards')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Database connection error:', error.message);
      
      // If it's an RLS error, try to handle it gracefully
      if (error.message.includes('RLS') || error.message.includes('policy')) {
        console.warn('RLS policy issue detected, but connection is working');
        return true;
      }
      
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return false;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
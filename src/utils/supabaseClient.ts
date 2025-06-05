import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import type { Database } from '../types/supabase'; 

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

const supabaseOptions: SupabaseClientOptions<Database> = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'supabase.auth.token'
  },
  db: {
    schema: 'public'
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, supabaseOptions);

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('dashboards')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Database connection error:', error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return false;
  }
};
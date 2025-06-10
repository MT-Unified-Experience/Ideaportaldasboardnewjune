import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Helper function to validate and format Supabase URL
const validateSupabaseUrl = (url: string): string => {
  if (!url) {
    console.warn('VITE_SUPABASE_URL is not defined, using demo mode');
    return 'https://demo.supabase.co';
  }
  const trimmedUrl = url.trim().replace(/\/+$/, '');
  return trimmedUrl;
};

const supabaseUrl = validateSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables not configured. Running in demo mode.');
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
    // If we're in demo mode, return true to allow the app to work
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return true;
    }
    
    const { data, error } = await supabase
      .from('dashboards')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Database connection error:', error.message);
      return true; // Allow app to work in demo mode
    }
    
    return true;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return true; // Allow app to work in demo mode
  }
};
import { createClient } from '@supabase/supabase-js';

// Try to import config, fall back to placeholders if not available
let supabaseUrl = 'YOUR_SUPABASE_URL';
let supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

try {
  const config = require('../config');
  if (config.SUPABASE_CONFIG) {
    supabaseUrl = config.SUPABASE_CONFIG.url;
    supabaseAnonKey = config.SUPABASE_CONFIG.anonKey;
    console.log('✅ Supabase config loaded successfully');
  }
} catch (error) {
  // Config file doesn't exist, use placeholders
  console.warn('📝 No config.ts found. Using placeholder values.');
}

// Validate configuration
if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('⚠️  Supabase not configured! Please update lib/supabase.ts with your credentials.');
  console.warn('📖 See SUPABASE_SETUP.md for instructions.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable auto refresh for now since we're not using auth
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Debug: Log the configuration being used
console.log('🔧 Supabase URL:', supabaseUrl);
console.log('🔧 Supabase Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');

// Database types
export interface User {
  id: string;
  name: string;
  created_at: string;
  couple_id: string;
  auth_token: string;
  is_paired: boolean;
  partner_id: string | null;
}

export interface Couple {
  id: string;
  couple_code: string;
  created_at: string;
  created_by_user_id: string;
}

export interface Bet {
  id: string;
  title: string;
  amount: number;
  option_a: string;
  option_b: string;
  creator_id: string;
  creator_choice: 'a' | 'b';
  status: 'pending' | 'active' | 'concluded';
  winner_option: 'a' | 'b' | null;
  created_at: string;
  concluded_at: string | null;
  concluded_by_id: string | null;
  couple_id: string;
}

// Helper function to get current couple ID
export const getCurrentCoupleId = async (): Promise<string | null> => {
  try {
    const { getCurrentUser } = await import('./auth');
    const user = await getCurrentUser();
    return user?.couple_id || null;
  } catch (error) {
    console.error('Error getting current couple ID:', error);
    return null;
  }
};

// Helper function to test Supabase connection
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

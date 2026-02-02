import { createClient } from '@supabase/supabase-js';
import { environment } from './environment';

// Only warn when not using Railway API (Supabase would be used for auth)
if (!environment.apiUrl && (!environment.supabaseUrl || !environment.supabaseKey)) {
  console.warn('Supabase env not set. Set VITE_API_URL for Railway, or VITE_SUPABASE_URL + VITE_SUPABASE_KEY for Supabase.');
}

export const supabase = createClient(
  environment.supabaseUrl || 'https://placeholder.supabase.co',
  environment.supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'biochar-management-system'
      }
    }
  }
);

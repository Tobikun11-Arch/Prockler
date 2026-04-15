import {createClient, type SupabaseClient} from '@supabase/supabase-js';
import {supabaseEnv} from './env';

export function getSupabaseRouteClient(accessToken: string): SupabaseClient {
  if (!supabaseEnv.url || !supabaseEnv.anonKey) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createClient(supabaseEnv.url, supabaseEnv.anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

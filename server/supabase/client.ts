import {createClient, type SupabaseClient} from '@supabase/supabase-js';
import {supabaseEnv} from './env';

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;
  if (!supabaseEnv.url || !supabaseEnv.anonKey) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }
  browserClient = createClient(supabaseEnv.url, supabaseEnv.anonKey);
  return browserClient;
}

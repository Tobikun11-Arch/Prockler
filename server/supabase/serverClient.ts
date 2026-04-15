import {createClient, type SupabaseClient} from '@supabase/supabase-js';
import {cookies} from 'next/headers';
import {supabaseEnv} from './env';

let cached: SupabaseClient | null = null;

export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  if (cached) return cached;
  if (!supabaseEnv.url || !supabaseEnv.serviceRoleKey) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  const cookieStore = await cookies();

  cached = createClient(supabaseEnv.url, supabaseEnv.serviceRoleKey, {
    global: {
      headers: {
        Authorization: `Bearer ${cookieStore.get('sb-access-token')?.value ?? ''}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return cached;
}

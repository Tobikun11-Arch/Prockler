import {getSupabaseBrowserClient} from './client';

export async function getSupabaseAccessToken(): Promise<string | null> {
  try {
    const supabase = getSupabaseBrowserClient();
    const {data} = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

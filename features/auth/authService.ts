import {getSupabaseBrowserClient} from '@/server/supabase/client';
import type {AuthResult} from './types';

export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<AuthResult<null>> {
  const supabase = getSupabaseBrowserClient();

  const {error} = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password
  });

  if (error) return {ok: false, errorMessage: error.message};
  return {ok: true, data: null};
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
}): Promise<AuthResult<null>> {
  const supabase = getSupabaseBrowserClient();

  const {error} = await supabase.auth.signUp({
    email: input.email,
    password: input.password
  });

  if (error) return {ok: false, errorMessage: error.message};
  return {ok: true, data: null};
}

export async function sendPasswordResetEmail(input: {
  email: string;
}): Promise<AuthResult<null>> {
  const supabase = getSupabaseBrowserClient();

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/`
      : undefined;

  const {error} = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo
  });

  if (error) return {ok: false, errorMessage: error.message};
  return {ok: true, data: null};
}

export async function signOut(): Promise<AuthResult<null>> {
  const supabase = getSupabaseBrowserClient();
  const {error} = await supabase.auth.signOut();
  if (error) return {ok: false, errorMessage: error.message};
  return {ok: true, data: null};
}

'use client';

import {create} from 'zustand';
import type {StateCreator} from 'zustand';
import type {AuthChangeEvent, Session, User} from '@supabase/supabase-js';
import {
  sendPasswordResetEmail,
  signInWithPassword,
  signOut,
  signUpWithPassword
} from './authService';
import {getSupabaseBrowserClient} from '@/server/supabase/client';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export type AuthState = {
  status: AuthStatus;
  user: User | null;
  errorMessage: string | null;

  hydrate: () => Promise<void>;
  signIn: (input: {email: string; password: string}) => Promise<boolean>;
  signUp: (input: {email: string; password: string}) => Promise<boolean>;
  forgotPassword: (input: {email: string}) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const creator: StateCreator<AuthState> = (set, get) => ({
  status: 'idle',
  user: null,
  errorMessage: null,

  clearError: () => set({errorMessage: null}),

  hydrate: async () => {
    const supabase = getSupabaseBrowserClient();

    set({status: 'loading'});

    const {data} = await supabase.auth.getUser();
    const user = data.user ?? null;

    set({
      user,
      status: user ? 'authenticated' : 'unauthenticated'
    });

    supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        const nextUser = session?.user ?? null;
        set({
          user: nextUser,
          status: nextUser ? 'authenticated' : 'unauthenticated'
        });
      }
    );
  },

  signIn: async (input: {email: string; password: string}) => {
    set({status: 'loading', errorMessage: null});
    const res = await signInWithPassword(input);
    if (!res.ok) {
      set({
        status: 'unauthenticated',
        errorMessage: res.errorMessage
      });
      return false;
    }

    await get().hydrate();
    return true;
  },

  signUp: async (input: {email: string; password: string}) => {
    set({status: 'loading', errorMessage: null});
    const res = await signUpWithPassword(input);
    if (!res.ok) {
      set({status: 'unauthenticated', errorMessage: res.errorMessage});
      return false;
    }

    await get().hydrate();
    return true;
  },

  forgotPassword: async (input: {email: string}) => {
    set({status: 'loading', errorMessage: null});
    const res = await sendPasswordResetEmail(input);
    if (!res.ok) {
      set({status: 'unauthenticated', errorMessage: res.errorMessage});
      return false;
    }

    set({status: 'unauthenticated'});
    return true;
  },

  signOut: async () => {
    set({status: 'loading', errorMessage: null});
    await signOut();
    set({user: null, status: 'unauthenticated'});
  }
});

export const useAuthStore = create<AuthState>()(creator);

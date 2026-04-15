'use client';

import {useEffect, useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import type {AuthMode} from '../types';
import {useAuthStore, type AuthState} from '../authStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

export default function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const status = useAuthStore((s: AuthState) => s.status);
  const errorMessage = useAuthStore((s: AuthState) => s.errorMessage);
  const clearError = useAuthStore((s: AuthState) => s.clearError);
  const hydrate = useAuthStore((s: AuthState) => s.hydrate);
  const signIn = useAuthStore((s: AuthState) => s.signIn);
  const signUp = useAuthStore((s: AuthState) => s.signUp);
  const forgotPassword = useAuthStore((s: AuthState) => s.forgotPassword);

  const user = useAuthStore((s: AuthState) => s.user);

  const [signupDialogOpen, setSignupDialogOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  useEffect(() => {
    clearError();
  }, [mode, clearError]);

  const submitLabel = useMemo(() => {
    if (mode === 'signin') return 'Sign in';
    if (mode === 'signup') return 'Create account';
    return 'Send reset link';
  }, [mode]);

  function onKeyDownSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    if (isBusy) return;
    if (mode === 'signup' && password !== confirmPassword) return;
    e.currentTarget.form?.requestSubmit();
  }

  const title = useMemo(() => {
    if (mode === 'signin') return 'Sign in';
    if (mode === 'signup') return 'Create account';
    return 'Reset password';
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === 'signin') return 'Welcome back. Please sign in to continue.';
    if (mode === 'signup')
      return 'Create an account to start tracking your day.';
    return 'Enter your email and we’ll send a reset link.';
  }, [mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    if (mode === 'signup') {
      if (!password) return;
      if (password !== confirmPassword) return;
      const ok = await signUp({email: cleanEmail, password});
      if (ok) {
        setPassword('');
        setConfirmPassword('');
        setSignupDialogOpen(true);
      }
      return;
    }

    if (mode === 'signin') {
      if (!password) return;
      const ok = await signIn({email: cleanEmail, password});
      if (ok) router.replace('/dashboard');
      return;
    }

    await forgotPassword({email: cleanEmail});
  }

  const isBusy = status === 'loading';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md border border-border bg-card p-6">
        <div className="mb-6">
          <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Prockler
          </div>
          <h1 className="text-3xl font-black mt-2">{title}</h1>
          <div className="text-sm text-muted-foreground mt-2">{subtitle}</div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`border border-border px-3 py-2 text-xs tracking-[0.18em] uppercase ${
              mode === 'signin'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`border border-border px-3 py-2 text-xs tracking-[0.18em] uppercase ${
              mode === 'signup'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card'
            }`}
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={() => setMode('forgot')}
            className={`border border-border px-3 py-2 text-xs tracking-[0.18em] uppercase ${
              mode === 'forgot'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card'
            }`}
          >
            Forgot
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Email
            </label>
            <input
              className="w-full border border-border bg-background px-3 py-2"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={onKeyDownSubmit}
              autoComplete="email"
              required
              disabled={isBusy}
            />
          </div>

          {mode !== 'forgot' ? (
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Password
              </label>
              <input
                className="w-full border border-border bg-background px-3 py-2"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={onKeyDownSubmit}
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                required
                disabled={isBusy}
              />
            </div>
          ) : null}

          {mode === 'signup' ? (
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Confirm password
              </label>
              <input
                className="w-full border border-border bg-background px-3 py-2"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={onKeyDownSubmit}
                autoComplete="new-password"
                required
                disabled={isBusy}
              />
              {confirmPassword && password !== confirmPassword ? (
                <div className="text-xs text-destructive mt-1">
                  Passwords do not match.
                </div>
              ) : null}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="text-xs text-destructive">{errorMessage}</div>
          ) : null}

          <button
            type="submit"
            disabled={
              isBusy || (mode === 'signup' && password !== confirmPassword)
            }
            className="w-full px-4 py-2 bg-primary text-primary-foreground text-xs tracking-[0.18em] uppercase disabled:opacity-60"
          >
            {isBusy ? 'Please wait…' : submitLabel}
          </button>
        </form>
      </div>

      <Dialog open={signupDialogOpen} onOpenChange={setSignupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your email</DialogTitle>
            <DialogDescription>
              We sent a verification email to{' '}
              <span className="font-medium text-foreground">
                {email.trim()}
              </span>
              . Please check your inbox (and spam) and follow the instructions
              to finish setting up your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className="px-4 py-2 bg-primary text-primary-foreground text-xs tracking-[0.18em] uppercase"
              onClick={() => {
                setSignupDialogOpen(false);
                setMode('signin');
              }}
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

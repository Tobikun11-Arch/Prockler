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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
              <div className="relative">
                <input
                  className="w-full border border-border bg-background px-3 py-2 pr-10"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={onKeyDownSubmit}
                  autoComplete={
                    mode === 'signin' ? 'current-password' : 'new-password'
                  }
                  required
                  disabled={isBusy}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground disabled:opacity-60"
                  disabled={isBusy}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a17.5 17.5 0 0 1-2.16 3.19" />
                      <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a10.94 10.94 0 0 0 5.91-1.68" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {mode === 'signup' ? (
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Confirm password
              </label>
              <div className="relative">
                <input
                  className="w-full border border-border bg-background px-3 py-2 pr-10"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={onKeyDownSubmit}
                  autoComplete="new-password"
                  required
                  disabled={isBusy}
                />
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground disabled:opacity-60"
                  disabled={isBusy}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => setShowConfirmPassword(v => !v)}
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a17.5 17.5 0 0 1-2.16 3.19" />
                      <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a10.94 10.94 0 0 0 5.91-1.68" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
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

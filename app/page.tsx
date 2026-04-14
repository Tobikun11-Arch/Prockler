'use client';

import {useState} from 'react';

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function HomePage() {
  const [mode, setMode] = useState<AuthMode>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md border border-border bg-card p-6">
        <div className="mb-6">
          <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Prockler
          </div>
          <h1 className="text-3xl font-black mt-2">
            {mode === 'signin'
              ? 'Sign in'
              : mode === 'signup'
                ? 'Create account'
                : 'Reset password'}
          </h1>
          <div className="text-sm text-muted-foreground mt-2">
            {mode === 'signin'
              ? 'Welcome back. Please sign in to continue.'
              : mode === 'signup'
                ? 'Create an account to start tracking your day.'
                : 'Enter your email and we’ll send a reset link.'}
          </div>
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
              autoComplete="email"
              required
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
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                required
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
                autoComplete="new-password"
                required
              />
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground text-xs tracking-[0.18em] uppercase"
          >
            {mode === 'signin'
              ? 'Sign in'
              : mode === 'signup'
                ? 'Create account'
                : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 text-xs text-muted-foreground">
          Dashboard is now available at{' '}
          <a className="underline underline-offset-2" href="/dashboard">
            /dashboard
          </a>
          .
        </div>
      </div>
    </div>
  );
}

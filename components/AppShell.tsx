'use client';

import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import type {ReactNode} from 'react';
import {useEffect} from 'react';
import {useAuthStore, type AuthState} from '@/features/auth/authStore';

const nav = [
  {href: '/dashboard', label: 'Log Task'},
  {href: '/daily', label: 'Daily View'},
  {href: '/tasks', label: 'Task List'},
  {href: '/analytics', label: 'Analytics'},
  {href: '/search', label: 'Search'}
];

export default function AppShell({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const router = useRouter();

  const hydrate = useAuthStore((s: AuthState) => s.hydrate);
  const status = useAuthStore((s: AuthState) => s.status);
  const user = useAuthStore((s: AuthState) => s.user);
  const signOut = useAuthStore((s: AuthState) => s.signOut);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status === 'unauthenticated' && !user) {
      router.replace('/');
    }
  }, [status, user, router]);

  if (!user && (status === 'idle' || status === 'loading')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user && status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="border-r border-border bg-primary text-primary-foreground">
        <div className="p-5 border-b border-border/30">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-black tracking-tight">Prockler</div>
            {user ? (
              <button
                type="button"
                className="text-xs tracking-[0.12em] uppercase underline underline-offset-4"
                onClick={async () => {
                  await signOut();
                  router.replace('/');
                }}
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
        <nav className="p-3">
          <div className="flex md:flex-col gap-2 overflow-auto">
            {nav.map(item => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded text-xs tracking-[0.12em] uppercase transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-secondary text-secondary-foreground'
                      : 'hover:bg-secondary/20'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      <main className="bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

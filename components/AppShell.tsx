"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const nav = [
  { href: "/", label: "Log Task" },
  { href: "/daily", label: "Daily View" },
  { href: "/tasks", label: "Task List" },
  { href: "/analytics", label: "Analytics" },
  { href: "/search", label: "Search" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="border-r border-border bg-primary text-primary-foreground">
        <div className="p-5 border-b border-border/30">
          <div className="text-lg font-black tracking-tight">Prockler</div>
        </div>
        <nav className="p-3">
          <div className="flex md:flex-col gap-2 overflow-auto">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded text-xs tracking-[0.12em] uppercase transition-colors whitespace-nowrap ${
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-secondary/20"
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

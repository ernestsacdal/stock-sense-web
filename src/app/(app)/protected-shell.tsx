"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth";

export function ProtectedShell({ children }: { children: ReactNode }) {
  const { status, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-subtle)]">
          {status === "loading" ? "Restoring session…" : "Redirecting…"}
        </div>
      </div>
    );
  }

  return (
    <AppShell user={user ?? undefined} onLogout={() => void logout()}>
      {children}
    </AppShell>
  );
}

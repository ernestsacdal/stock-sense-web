"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth";

/**
 * Wraps /login and /register. Authenticated users get bounced back
 * to / and never see the form — the only ways out of an authed
 * session are explicit logout or token expiry.
 */
export function PublicShell({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  // While we're checking the cookie or about to redirect, render a
  // neutral placeholder instead of the login/register form. Prevents
  // the brief flash of the public page that would otherwise appear
  // before the useEffect fires.
  if (status === "loading" || status === "authenticated") {
    return (
      <div
        className="relative z-10 flex min-h-screen items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-subtle)]">
          {status === "loading" ? "Restoring session…" : "Redirecting…"}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative z-10 flex min-h-screen items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse 600px 400px at 50% 50%, rgba(245, 158, 11, 0.08), transparent), var(--bg)",
      }}
    >
      {children}
    </div>
  );
}

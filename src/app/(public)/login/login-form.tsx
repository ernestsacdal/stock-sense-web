"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Brand } from "@/components/brand";
import { useAuth } from "@/lib/auth";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-[420px] rounded-[var(--r-xl)] border border-[color:var(--border-strong)] bg-[color:var(--surface-glass)] p-12 backdrop-blur-3xl"
      style={{ boxShadow: "0 40px 80px -40px rgba(0,0,0,0.6)" }}
    >
      <div className="mb-10 flex flex-col items-center gap-4">
        <Brand size="lg" />
        <div className="text-center text-[13px] text-[color:var(--text-muted)]">
          Inventory intelligence for everyone.
        </div>
      </div>

      <Field
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        required
      />
      <Field
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
        required
      />

      {error && (
        <div className="mt-2 text-[12px] text-[color:var(--danger)]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--r-md)] py-3 text-[13px] font-medium text-[#1a1300] transition-colors disabled:opacity-60"
        style={{
          background: "var(--accent)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px var(--accent-glow)",
        }}
      >
        {submitting ? "Signing in…" : "Sign in"}
        {!submitting && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        )}
      </button>

      <div className="mt-6 text-center text-[12px] text-[color:var(--text-muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[color:var(--accent-bright)] no-underline hover:underline">
          Create one
        </Link>
      </div>
    </form>
  );
}

function Field(props: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
        {props.label}
      </label>
      <input
        type={props.type}
        autoComplete={props.autoComplete}
        required={props.required}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-[var(--r-md)] border border-[color:var(--border-strong)] bg-[color:var(--bg)] px-3.5 py-3 text-[14px] text-[color:var(--text)] outline-none transition-colors focus:border-[color:var(--accent)]"
      />
    </div>
  );
}

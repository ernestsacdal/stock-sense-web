"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Brand } from "@/components/brand";
import { useAuth } from "@/lib/auth";

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    try {
      await register(email, password, businessName);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
          Create your StockSense account.
        </div>
      </div>

      <Field
        label="Business name"
        type="text"
        autoComplete="organization"
        value={businessName}
        onChange={setBusinessName}
        hint='e.g. "Joe&apos;s Coffee Shop", "Westmead Clinic", "Acme Hardware"'
      />
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
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        required
        hint="At least 8 characters."
      />
      <Field
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        required
      />

      {error && (
        <div className="mt-2 text-[12px] text-[color:var(--danger)]">{error}</div>
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
        {submitting ? "Creating account…" : "Create account"}
      </button>

      <div className="mt-6 text-center text-[12px] text-[color:var(--text-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[color:var(--accent-bright)] no-underline hover:underline">
          Sign in
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
  hint?: string;
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
      {props.hint && (
        <div className="mt-1.5 text-[11px] text-[color:var(--text-faint)]">{props.hint}</div>
      )}
    </div>
  );
}

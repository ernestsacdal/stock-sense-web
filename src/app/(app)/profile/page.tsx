"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";
import { useAuth } from "@/lib/auth";
import { useUpdateProfile } from "@/lib/queries";

const INPUT =
  "w-full rounded-[var(--r-md)] border border-[color:var(--border-strong)] bg-[color:var(--bg)] px-3 py-2 text-[13px] outline-none focus:border-[color:var(--accent)]";

export default function ProfilePage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [businessName, setBusinessName] = useState(user?.business_name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setBusinessName(user.business_name ?? "");
  }, [user]);

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    try {
      await updateProfile.mutateAsync({ business_name: businessName });
      toast("Profile saved.", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setProfileError(msg);
      toast(msg, "error");
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast("Password changed.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Password change failed";
      setPasswordError(msg);
      toast(msg, "error");
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader crumb="Account · Profile" title="Edit profile" />

      <div className="mb-6 rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] p-6">
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Meta label="Email" value={user?.email ?? "—"} />
          <Meta label="Role" value={user?.role ?? "—"} mono />
        </div>
        <p className="text-[12px] text-[color:var(--text-faint)]">
          Email is the key you use to sign in and can&apos;t be changed
          here. Role changes require an admin.
        </p>
      </div>

      <form
        onSubmit={onSaveProfile}
        className="mb-6 rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] p-6"
      >
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-[22px] italic">
          Business name
        </h2>
        <p className="mb-4 text-[13px] text-[color:var(--text-muted)]">
          Shown in the dashboard topbar. Pick whatever your workspace
          should be called.
        </p>
        <Field label="Business name">
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className={INPUT}
            placeholder="e.g. Joe's Coffee Shop"
            maxLength={160}
          />
        </Field>
        {profileError && (
          <div className="mt-2 text-[12px] text-[color:var(--danger)]">{profileError}</div>
        )}
        <div className="mt-4">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="rounded-[var(--r-md)] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {updateProfile.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>

      <form
        onSubmit={onChangePassword}
        className="rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] p-6"
      >
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-[22px] italic">
          Change password
        </h2>
        <div className="space-y-4">
          <Field label="Current password" required>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={INPUT}
              required
            />
          </Field>
          <Field label="New password" required hint="At least 8 characters.">
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={INPUT}
              required
            />
          </Field>
          <Field label="Confirm new password" required>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={INPUT}
              required
            />
          </Field>
        </div>
        {passwordError && (
          <div className="mt-2 text-[12px] text-[color:var(--danger)]">{passwordError}</div>
        )}
        <div className="mt-4">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="rounded-[var(--r-md)] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {updateProfile.isPending ? "Changing…" : "Change password"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--text-faint)]">
        {label}
      </div>
      <div
        className={`text-[14px] font-medium text-[color:var(--text)]${mono ? " font-mono" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
        {label}
        {required && <span className="ml-1 text-[color:var(--accent)]">*</span>}
      </label>
      {children}
      {hint && (
        <div className="mt-1.5 text-[11px] text-[color:var(--text-faint)]">{hint}</div>
      )}
    </div>
  );
}

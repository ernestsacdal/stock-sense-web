"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string;
};

type NavSection = { label: string; items: NavItem[] };

const NAV: NavSection[] = [
  {
    label: "Workspace",
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        ),
      },
      {
        label: "Inventory",
        href: "/inventory",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.5 7.5l-9-5-9 5m18 0l-9 5m9-5v9l-9 5m0-14l-9-5v9m9 5L3.5 12" />
          </svg>
        ),
      },
      {
        label: "Movements",
        href: "/movements",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12l5 5L20 7" />
          </svg>
        ),
      },
      {
        label: "Categories",
        href: "/categories",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        ),
      },
      {
        label: "Suppliers",
        href: "/suppliers",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        ),
      },
      {
        label: "Locations",
        href: "/locations",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        label: "Ask StockSense",
        href: "/ask",
        badge: "AI",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
          </svg>
        ),
      },
    ],
  },
];

type AppShellProps = {
  children: ReactNode;
  user?: { email: string; role: string };
  onLogout?: () => void;
};

export function AppShell({ children, user, onLogout }: AppShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile drawer whenever the route changes (i.e. user
  // clicked a nav link). Desktop sidebar ignores this since it's
  // always visible at lg+.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open so the page
  // underneath doesn't scroll when the user swipes inside the drawer.
  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  return (
    <div className="relative z-10 grid min-h-screen w-full grid-cols-1 bg-[color:var(--bg)] lg:grid-cols-[240px_1fr]">
      {/* ---------- Mobile topbar (visible < lg) ---------- */}
      <div className="flex items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--bg-2)] px-4 py-3 lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileNavOpen}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] text-[color:var(--text)] transition-colors hover:bg-white/[0.05]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* ---------- Desktop sidebar (visible lg+) ---------- */}
      <aside className="sticky top-0 hidden h-screen flex-col overflow-y-auto border-r border-[color:var(--border)] bg-[color:var(--bg-2)] px-4 py-6 lg:flex [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[color:var(--border-strong)]">
        <SidebarContents pathname={pathname} user={user} onLogout={onLogout} />
      </aside>

      {/* ---------- Mobile drawer (visible < lg, when open) ---------- */}
      {mobileNavOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-[color:var(--border)] bg-[color:var(--bg-2)] px-4 py-6 shadow-2xl lg:hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[color:var(--border-strong)]">
            <div className="mb-2 flex items-center justify-between px-3">
              <Brand />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-[var(--r-md)] text-[color:var(--text-muted)] transition-colors hover:bg-white/[0.05] hover:text-[color:var(--text)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4 flex flex-1 flex-col">
              <SidebarContents pathname={pathname} user={user} onLogout={onLogout} />
            </div>
          </aside>
        </>
      )}

      {/* ---------- Main content ---------- */}
      <main className="min-w-0 overflow-x-hidden p-4 lg:p-8">{children}</main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar contents — rendered identically in both the desktop sticky
// aside and the mobile slide-in drawer. Single source of truth for the
// nav structure + user menu.
// ---------------------------------------------------------------------------

function SidebarContents({
  pathname,
  user,
  onLogout,
}: {
  pathname: string;
  user?: { email: string; role: string };
  onLogout?: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <>
      {/* Brand is shown by the parent on mobile (in the drawer header)
          and by the desktop sidebar (here). Hide on mobile drawer to
          avoid duplication. */}
      <div className="mb-8 hidden px-3 lg:block">
        <Brand />
      </div>

      {NAV.map((section) => (
        <div key={section.label} className="mb-6">
          <div className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
            {section.label}
          </div>
          {section.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-[var(--r-md)] px-3 py-3 text-[13.5px] font-medium transition-colors",
                  active
                    ? "text-[color:var(--text)] bg-[color:var(--surface-glass)] shadow-[inset_0_0_0_1px_var(--border-strong)]"
                    : "text-[color:var(--text-muted)] hover:bg-white/[0.03] hover:text-[color:var(--text)]"
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute -left-4 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-[2px] bg-[color:var(--accent)]"
                  />
                )}
                <span className="h-4 w-4 flex-shrink-0 opacity-80">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto rounded font-mono text-[10px] bg-[color:var(--accent-soft)] px-1.5 py-0.5 text-[color:var(--accent-bright)]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      <div ref={menuRef} className="relative mt-auto border-t border-[color:var(--border)] pt-6">
        {user ? (
          <>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex w-full items-center gap-3 rounded-[var(--r-md)] p-3 text-left transition-colors hover:bg-white/[0.03]"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
              >
                {user.email.slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-[color:var(--text)]">
                  {user.email}
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--text-faint)]">
                  {user.role}
                </span>
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={cn(
                  "h-3.5 w-3.5 text-[color:var(--text-faint)] transition-transform",
                  menuOpen && "-rotate-180"
                )}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-[var(--r-md)] border border-[color:var(--border-strong)] bg-[color:var(--bg-elevated)] py-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[color:var(--text)] hover:bg-[color:var(--surface-glass)]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Edit profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[color:var(--danger)] hover:bg-[color:var(--surface-glass)]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--text-faint)]">
            Not signed in
          </div>
        )}
      </div>
    </>
  );
}

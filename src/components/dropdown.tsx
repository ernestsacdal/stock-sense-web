"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type DropdownOption<T> = {
  value: T;
  label: string;
};

type DropdownProps<T> = {
  value: T | null;
  options: DropdownOption<T>[];
  placeholder: string;
  onChange: (value: T | null) => void;
  /** When true, a 'Clear' entry appears at the top of the list. */
  nullable?: boolean;
  /** Sharp toolbar filter size (sm) vs full form-control size (md). */
  size?: "sm" | "md";
  /** When true, the dropdown won't allow null to be selected and shows
   * an asterisk-style placeholder treatment matching other required form
   * controls. (Validation is the caller's job — required just gates the
   * 'Clear' entry.) */
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

/**
 * Sharp, glass-styled dropdown. Looks identical whether open or closed
 * — native <select> open menus pick up OS chrome (rounded corners, OS
 * blue highlight) that doesn't match the rest of the app; this rolls
 * its own popover so the open state stays on-brand.
 *
 * The click-outside + Escape handling mirrors the user-menu popover in
 * src/components/app-shell.tsx so the behaviour is consistent.
 */
export function Dropdown<T extends string | number>({
  value,
  options,
  placeholder,
  onChange,
  nullable = false,
  size = "md",
  required = false,
  disabled = false,
  className,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Click-outside: copy of the pattern in app-shell.tsx.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Reset highlight to the currently-selected option (or top) each time
  // the popover opens. Without this, the arrow-key cursor can drift.
  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setHighlighted(idx >= 0 ? idx : 0);
  }, [open, options, value]);

  const selectedLabel = useMemo(() => {
    const match = options.find((o) => o.value === value);
    return match?.label ?? null;
  }, [options, value]);

  const showClear = nullable && !required && value !== null;

  function commit(v: T | null) {
    onChange(v);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(options.length - 1, i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[highlighted];
      if (opt) commit(opt.value);
    }
  }

  const triggerSize =
    size === "sm"
      ? "px-3 py-1.5 text-[12px]"
      : "px-3 py-2 text-[13px]";
  const triggerBorder =
    size === "sm"
      ? "border-[color:var(--border)]"
      : "border-[color:var(--border-strong)]";

  return (
    <div
      ref={wrapRef}
      className={cn("relative inline-block", className)}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-[var(--r-md)] border bg-[color:var(--bg)] text-left text-[color:var(--text)] outline-none transition-colors",
          triggerSize,
          triggerBorder,
          "focus:border-[color:var(--accent)]",
          open && "border-[color:var(--accent)]",
          disabled && "opacity-60",
        )}
      >
        <span
          className={cn(
            "truncate",
            !selectedLabel && "text-[color:var(--text-faint)]",
          )}
        >
          {selectedLabel ?? placeholder}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn(
            "h-3 w-3 flex-shrink-0 text-[color:var(--text-faint)] transition-transform",
            open && "-rotate-180",
          )}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 max-h-72 min-w-[180px] overflow-auto rounded-[var(--r-md)] border border-[color:var(--border-strong)] bg-[color:var(--bg-elevated)] py-1 shadow-lg"
        >
          {showClear && (
            <button
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => commit(null)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[12px] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-glass)]"
            >
              <span>Clear</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--text-faint)]">
                ×
              </span>
            </button>
          )}
          {options.length === 0 && (
            <div className="px-3 py-2 text-[12px] text-[color:var(--text-faint)]">
              No options
            </div>
          )}
          {options.map((opt, i) => {
            const selected = opt.value === value;
            const active = i === highlighted;
            return (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => commit(opt.value)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[12px]",
                  selected
                    ? "text-[color:var(--accent-bright)]"
                    : "text-[color:var(--text)]",
                  active && "bg-[color:var(--surface-glass)]",
                )}
              >
                <span className="truncate">{opt.label}</span>
                {selected && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="h-3 w-3 flex-shrink-0"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

export const PAGE_SIZE = 10;

type PaginationProps = {
  page: number; // current 1-based page
  /** Whether the next page might have rows. Caller usually computes
   * this from `lastResponse.length === PAGE_SIZE` — i.e. the last
   * page came back full. When false we know we're on the last page
   * and the Next button disables. */
  hasMore: boolean;
  onChange: (page: number) => void;
  className?: string;
};

/**
 * Sharp right-aligned pagination: Previous · Page N · Next.
 *
 * No total count (we don't query one — keeps things cheap). Renders
 * nothing when on page 1 and there's no next page (single-page
 * dataset → no clutter).
 */
export function Pagination({ page, hasMore, onChange, className }: PaginationProps) {
  if (page === 1 && !hasMore) return null;

  const canPrev = page > 1;
  const canNext = hasMore;

  return (
    <div
      className={cn(
        "mt-3 flex items-center justify-end gap-2 font-mono text-[11px] uppercase tracking-[0.15em]",
        className,
      )}
    >
      <PaginationButton
        onClick={() => onChange(page - 1)}
        disabled={!canPrev}
        label="Previous"
      />
      <span className="px-1 text-[color:var(--text-faint)]">·</span>
      <span className="px-1 text-[color:var(--text-muted)]">
        Page <span className="text-[color:var(--text)]">{page}</span>
      </span>
      <span className="px-1 text-[color:var(--text-faint)]">·</span>
      <PaginationButton
        onClick={() => onChange(page + 1)}
        disabled={!canNext}
        label="Next"
      />
    </div>
  );
}

function PaginationButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-[var(--r-md)] border px-2.5 py-1 transition-colors",
        disabled
          ? "cursor-not-allowed border-transparent text-[color:var(--text-faint)] opacity-50"
          : "border-[color:var(--border)] bg-white/[0.03] text-[color:var(--text-muted)] hover:bg-white/[0.06] hover:text-[color:var(--text)]",
      )}
    >
      {label}
    </button>
  );
}

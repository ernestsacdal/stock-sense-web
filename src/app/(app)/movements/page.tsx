"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Pagination, PAGE_SIZE } from "@/components/pagination";
import { MOVEMENT_LABEL } from "@/lib/movement-labels";
import { useItems, useMovements } from "@/lib/queries";
import type { MovementType } from "@/lib/types";
import { cn } from "@/lib/utils";

// Only types creatable through the UI surface as chips. The manual
// /api/movements endpoint can still insert disposed / adjusted /
// transferred rows; those still appear under the "All" filter and
// render correctly via MOVEMENT_LABEL.
const TYPES: MovementType[] = ["added", "received", "issued"];

export default function MovementsPage() {
  const [type, setType] = useState<MovementType | undefined>(undefined);
  const [page, setPage] = useState(1);
  // Reset to first page when the type filter changes.
  useEffect(() => {
    setPage(1);
  }, [type]);
  const movements = useMovements({ type }, page);
  // We only use items for the name lookup, so fetch the full list once.
  const items = useItems();

  const itemById = useMemo(() => {
    const m = new Map<number, { name: string; sku: string }>();
    for (const i of items.data ?? []) m.set(i.id, { name: i.name, sku: i.sku });
    return m;
  }, [items.data]);

  return (
    <div>
      <PageHeader crumb="Workspace · Movements" title="Movements" />

      <p className="mb-5 max-w-2xl text-[13px] text-[color:var(--text-muted)]">
        Append-only audit log of every stock change. Reversals are recorded
        as compensating entries with the opposite-sign delta — nothing here
        is ever edited or deleted.
      </p>

      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
          Filter:
        </span>
        <Chip label="All" active={type === undefined} onClick={() => setType(undefined)} />
        {TYPES.map((t) => (
          <Chip
            key={t}
            label={MOVEMENT_LABEL[t]}
            active={type === t}
            onClick={() => setType(t)}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)]">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <thead>
            <tr>
              <Th>When</Th>
              <Th>Type</Th>
              <Th>Item</Th>
              <Th>Delta</Th>
              <Th>Notes</Th>
            </tr>
          </thead>
          <tbody>
            {movements.isLoading && (
              <tr>
                <Td colSpan={5}>
                  <div className="py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
                    Loading…
                  </div>
                </Td>
              </tr>
            )}
            {!movements.isLoading && movements.data && movements.data.length === 0 && (
              <tr>
                <Td colSpan={5}>
                  <div className="py-12 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
                    No movements logged yet — they appear when you Restock
                    or Issue stock from an item&apos;s page.
                  </div>
                </Td>
              </tr>
            )}
            {(movements.data ?? []).map((m) => {
              const item = itemById.get(m.item_id);
              return (
                <tr key={m.id} className="border-b border-[color:var(--border)] last:border-0">
                  <Td>
                    <span className="font-mono text-[12px] text-[color:var(--text-muted)]">
                      {m.created_at.split("T")[0]}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-[11px] uppercase tracking-wider">
                      {MOVEMENT_LABEL[m.type]}
                    </span>
                  </Td>
                  <Td>
                    <Link
                      href={`/inventory/${m.item_id}`}
                      className="font-medium text-[color:var(--text)] hover:underline"
                    >
                      {item?.name ?? `Item #${m.item_id}`}
                    </Link>
                  </Td>
                  <Td>
                    <span
                      className={cn(
                        "font-mono text-[13px]",
                        m.quantity_delta >= 0
                          ? "text-[color:var(--success)]"
                          : "text-[color:var(--danger)]"
                      )}
                    >
                      {m.quantity_delta > 0 ? "+" : ""}
                      {m.quantity_delta}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-[12px] text-[color:var(--text-muted)]">
                      {m.notes ?? "—"}
                    </span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      <Pagination
        page={page}
        hasMore={(movements.data?.length ?? 0) === PAGE_SIZE}
        onChange={setPage}
      />
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[12px] transition-colors",
        active
          ? "border-[rgba(245,158,11,0.3)] bg-[color:var(--accent-soft)] text-[color:var(--accent-bright)]"
          : "border-[color:var(--border)] bg-white/[0.03] text-[color:var(--text-muted)] hover:bg-white/[0.05]"
      )}
    >
      {label}
    </button>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-b border-[color:var(--border)] bg-black/5 px-4 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
      {children}
    </th>
  );
}

function Td({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className="px-4 py-3 align-middle">
      {children}
    </td>
  );
}

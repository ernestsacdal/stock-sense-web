"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CategoryPill } from "@/components/category-pill";
import { Dropdown } from "@/components/dropdown";
import { PageHeader } from "@/components/page-header";
import { Pagination, PAGE_SIZE } from "@/components/pagination";
import { StatusDot, StockBar } from "@/components/status-dot";
import { downloadCsv, rowsToCsv } from "@/lib/csv";
import {
  useCategories,
  useItems,
  useLocations,
  useSuppliers,
  type ItemListFilters,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

type StockChip = ItemListFilters["stock_status"];

const CHIPS: { label: string; value: StockChip | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Low", value: "low" },
  { label: "Critical", value: "crit" },
];

export default function InventoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [supplierId, setSupplierId] = useState<number | undefined>(undefined);
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const [stockChip, setStockChip] = useState<StockChip | undefined>(undefined);

  const filters = useMemo<ItemListFilters>(
    () => ({
      q: search || undefined,
      category_id: categoryId,
      supplier_id: supplierId,
      location_id: locationId,
      stock_status: stockChip,
    }),
    [search, categoryId, supplierId, locationId, stockChip]
  );

  // Reset to the first page whenever any filter changes — otherwise
  // narrowing the result set on page 3 could leave you staring at an
  // empty page.
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const items = useItems(filters, page);
  // Dropdown filter options always need the full set, never paginated.
  const categories = useCategories();
  const suppliers = useSuppliers();
  const locations = useLocations();

  const categoryById = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of categories.data ?? []) map.set(c.id, c.name);
    return map;
  }, [categories.data]);
  const supplierById = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of suppliers.data ?? []) map.set(s.id, s.name);
    return map;
  }, [suppliers.data]);

  const categoryOptions = useMemo(
    () => (categories.data ?? []).map((c) => ({ value: c.id, label: c.name })),
    [categories.data]
  );
  const supplierOptions = useMemo(
    () => (suppliers.data ?? []).map((s) => ({ value: s.id, label: s.name })),
    [suppliers.data]
  );
  const locationOptions = useMemo(
    () => (locations.data ?? []).map((l) => ({ value: l.id, label: l.name })),
    [locations.data]
  );

  return (
    <div>
      <PageHeader
        crumb="Workspace · Inventory"
        title="Inventory"
        actions={
          <>
            <button
              type="button"
              onClick={() =>
                exportInventoryCsv(items.data ?? [], categoryById, supplierById)
              }
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-3.5 py-2 text-[13px] text-[color:var(--text)]"
            >
              Export CSV
            </button>
            <Link
              href="/inventory/new"
              className="inline-flex items-center gap-2 rounded-[var(--r-md)] px-3.5 py-2 text-[13px] font-medium text-[#1a1300] transition-colors"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px var(--accent-glow)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New item
            </Link>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-4 py-3">
        <input
          type="search"
          placeholder="Search by name or item code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[260px] flex-1 rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 text-[13px] outline-none focus:border-[color:var(--accent)]"
        />
        <Dropdown
          value={categoryId ?? null}
          options={categoryOptions}
          placeholder="All categories"
          onChange={(v) => setCategoryId(v ?? undefined)}
          nullable
          size="sm"
          className="min-w-[160px]"
        />
        <Dropdown
          value={supplierId ?? null}
          options={supplierOptions}
          placeholder="All suppliers"
          onChange={(v) => setSupplierId(v ?? undefined)}
          nullable
          size="sm"
          className="min-w-[160px]"
        />
        <Dropdown
          value={locationId ?? null}
          options={locationOptions}
          placeholder="All locations"
          onChange={(v) => setLocationId(v ?? undefined)}
          nullable
          size="sm"
          className="min-w-[160px]"
        />
        <span className="mx-2 h-5 w-px bg-[color:var(--border)]" />
        {CHIPS.map((c) => (
          <Chip
            key={c.label}
            label={c.label}
            active={stockChip === c.value}
            onClick={() => setStockChip(c.value)}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] backdrop-blur-2xl">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <Th>Item</Th>
              <Th>Category</Th>
              <Th>On hand</Th>
              <Th>Status</Th>
              <Th>Nearest expiry</Th>
              <Th align="right">Item code</Th>
            </tr>
          </thead>
          <tbody>
            {items.isLoading && (
              <tr>
                <Td colSpan={6}>
                  <div className="py-12 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
                    Loading…
                  </div>
                </Td>
              </tr>
            )}
            {!items.isLoading && items.data && items.data.length === 0 && (
              <tr>
                <Td colSpan={6}>
                  <div className="py-12 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
                    No items match these filters.
                  </div>
                </Td>
              </tr>
            )}
            {(items.data ?? []).map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer border-b border-[color:var(--border)] transition-colors hover:bg-white/[0.02] last:border-b-0"
                onClick={() => router.push(`/inventory/${item.id}`)}
              >
                <Td>
                  <div className="font-medium">{item.name}</div>
                  <div className="font-mono text-[11px] text-[color:var(--text-faint)]">
                    {item.sku}
                    {item.location_name && (
                      <span className="ml-2 normal-case">· {item.location_name}</span>
                    )}
                  </div>
                </Td>
                <Td>
                  <CategoryPill name={categoryById.get(item.category_id)} />
                </Td>
                <Td>
                  <div className="font-mono text-[13px]">{item.on_hand}</div>
                  <StockBar current={item.on_hand} threshold={item.reorder_threshold} />
                </Td>
                <Td>
                  <StatusDot status={item.stock_status} />
                </Td>
                <Td>
                  <ExpiryCell expiry={item.nearest_expiry} />
                </Td>
                <Td align="right">
                  <span className="font-mono text-[12px] text-[color:var(--text-muted)]">
                    {item.sku}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--text-faint)]">
        <span>
          {items.data ? `${items.data.length} item${items.data.length === 1 ? "" : "s"} on page` : ""}
        </span>
        <Pagination
          page={page}
          hasMore={(items.data?.length ?? 0) === PAGE_SIZE}
          onChange={setPage}
          className="mt-0"
        />
      </div>
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

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={cn(
        "border-b border-[color:var(--border)] bg-black/20 px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[color:var(--text-subtle)]",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  colSpan,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "px-4 py-3 align-middle text-[13px]",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      {children}
    </td>
  );
}

function exportInventoryCsv(
  items: ReturnType<typeof useItems>["data"] extends infer T ? T extends Array<infer U> ? U[] : never : never,
  categoryById: Map<number, string>,
  supplierById: Map<number, string>
): void {
  if (!items || items.length === 0) return;
  const headers = [
    "item_code",
    "name",
    "category",
    "supplier",
    "location",
    "on_hand",
    "stock_status",
    "reorder_threshold",
    "nearest_expiry",
  ];
  const rows = items.map((i) => [
    i.sku,
    i.name,
    categoryById.get(i.category_id) ?? "",
    i.supplier_id != null ? supplierById.get(i.supplier_id) ?? "" : "",
    i.location_name ?? "",
    i.on_hand,
    i.stock_status,
    i.reorder_threshold,
    i.nearest_expiry,
  ]);
  const stamp = new Date().toISOString().slice(0, 10);
  downloadCsv(`stocksense-inventory-${stamp}.csv`, rowsToCsv(headers, rows));
}

function ExpiryCell({ expiry }: { expiry: string | null }) {
  if (!expiry) return <span className="font-mono text-[12px] text-[color:var(--text-faint)]">—</span>;
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
  const tone = days <= 14 ? "text-[color:var(--danger)]" : days <= 60 ? "text-[color:var(--accent-bright)]" : "text-[color:var(--text-muted)]";
  return (
    <span className={cn("font-mono text-[12px]", tone)}>
      {expiry} ({days}d)
    </span>
  );
}

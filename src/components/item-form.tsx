"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Dropdown } from "@/components/dropdown";
import {
  useCategories,
  useCreateItem,
  useLocations,
  useSuppliers,
  useUpdateItem,
} from "@/lib/queries";
import type { Item } from "@/lib/types";

type ItemFormProps = { item?: Item };

export function ItemForm({ item }: ItemFormProps) {
  const router = useRouter();
  const categories = useCategories();
  const suppliers = useSuppliers();
  const locations = useLocations();
  const create = useCreateItem();
  const update = useUpdateItem();

  const isNew = !item;

  const [sku, setSku] = useState(item?.sku ?? "");
  const [name, setName] = useState(item?.name ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(item?.category_id ?? null);
  const [supplierId, setSupplierId] = useState<number | null>(item?.supplier_id ?? null);
  const [locationId, setLocationId] = useState<number | null>(item?.location_id ?? null);
  const [reorderThreshold, setReorderThreshold] = useState<string>(
    item?.reorder_threshold != null ? String(item.reorder_threshold) : ""
  );
  const [unitCost, setUnitCost] = useState<string>(item?.unit_cost ?? "");
  const [expiryDate, setExpiryDate] = useState<string>(item?.expiry_date ?? "");
  const [notes, setNotes] = useState<string>(item?.notes ?? "");
  // Opening qty only collected on create — edits go through Restock/Issue
  // so the audit trail stays honest.
  const [initialQty, setInitialQty] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const body: Record<string, unknown> = {
      sku,
      name,
      category_id: categoryId,
      supplier_id: supplierId,
      location_id: locationId,
      reorder_threshold: reorderThreshold === "" ? null : Number(reorderThreshold),
      unit_cost: unitCost === "" ? null : unitCost,
      expiry_date: expiryDate === "" ? null : expiryDate,
      notes: notes.trim() === "" ? null : notes.trim(),
    };
    if (isNew && initialQty !== "") {
      const n = Number(initialQty);
      if (Number.isNaN(n) || n < 0) {
        setError("Initial quantity must be 0 or more");
        return;
      }
      body.quantity = n;
    }
    try {
      const saved = item
        ? await update.mutateAsync({ id: item.id, body })
        : await create.mutateAsync(body);
      router.replace(`/inventory/${saved.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  const submitting = create.isPending || update.isPending;

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-8">
      <div className="rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] p-6 backdrop-blur-2xl">
        <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
          Identity
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Item code" required>
            <input value={sku} onChange={(e) => setSku(e.target.value)} className={INPUT} required />
          </Field>
          <Field label="Name" required>
            <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT} required />
          </Field>
          <Field label="Category">
            <Dropdown
              value={categoryId}
              options={categoryOptions}
              placeholder="Pick a category (optional)…"
              onChange={(v) => setCategoryId(v)}
              nullable
              size="md"
              className="w-full"
            />
          </Field>
          <Field label="Supplier">
            <Dropdown
              value={supplierId}
              options={supplierOptions}
              placeholder="None"
              onChange={(v) => setSupplierId(v)}
              nullable
              size="md"
              className="w-full"
            />
          </Field>
          <Field label="Location">
            <Dropdown
              value={locationId}
              options={locationOptions}
              placeholder="None"
              onChange={(v) => setLocationId(v)}
              nullable
              size="md"
              className="w-full"
            />
          </Field>
          <Field
            label="Reorder threshold"
            hint="Get a low-stock alert when quantity drops below this number."
          >
            <input
              type="number"
              value={reorderThreshold}
              onChange={(e) => setReorderThreshold(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Unit cost" hint="Per unit, e.g. 18.50.">
            <input
              type="number"
              step="0.01"
              min="0"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className={INPUT}
              placeholder="—"
            />
          </Field>
          <Field label="Expiry date" hint="Leave blank if not perishable.">
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={INPUT}
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field
            label="Notes"
            hint="Internal context — supplier quirks, handling rules, anything worth remembering."
          >
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
              rows={3}
              className={`${INPUT} resize-y leading-snug`}
              placeholder="—"
            />
          </Field>
        </div>

        {isNew && (
          <>
            <hr className="my-6 border-[color:var(--border)]" />
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
              Opening stock (optional)
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Quantity"
                hint="Logged as an 'Added' movement. Leave blank to start at 0."
              >
                <input
                  type="number"
                  min={0}
                  value={initialQty}
                  onChange={(e) => setInitialQty(e.target.value)}
                  className={INPUT}
                  placeholder="0"
                />
              </Field>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-[var(--r-md)] border border-[rgba(239,68,68,0.3)] bg-[color:var(--danger-soft)] px-4 py-3 text-[13px] text-[color:var(--danger)]">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[var(--r-md)] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60"
          style={{
            background: "var(--accent)",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px var(--accent-glow)",
          }}
        >
          {submitting ? "Saving…" : item ? "Save changes" : "Create item"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-4 py-2 text-[13px] text-[color:var(--text)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const INPUT =
  "w-full rounded-[var(--r-md)] border border-[color:var(--border-strong)] bg-[color:var(--bg)] px-3 py-2 text-[13px] outline-none focus:border-[color:var(--accent)]";

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

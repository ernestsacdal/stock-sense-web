"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

import { CategoryPill } from "@/components/category-pill";
import { PageHeader } from "@/components/page-header";
import { Pagination, PAGE_SIZE } from "@/components/pagination";
import { StatusDot } from "@/components/status-dot";
import { useToast } from "@/components/toast";
import { MOVEMENT_LABEL } from "@/lib/movement-labels";
import {
  useArchiveItem,
  useCategories,
  useIssue,
  useItem,
  useMovements,
  useRestock,
  useSuppliers,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

type Tab = "overview" | "movements";

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = use(params);
  const id = Number(idStr);
  const router = useRouter();

  const item = useItem(id);
  const categories = useCategories();
  const suppliers = useSuppliers();
  const [movementsPage, setMovementsPage] = useState(1);
  const movements = useMovements({ item_id: id }, movementsPage);
  const archive = useArchiveItem();
  const restock = useRestock();
  const issue = useIssue();
  const { toast, confirm } = useToast();

  const [tab, setTab] = useState<Tab>("overview");
  const [showRestock, setShowRestock] = useState(false);
  const [showIssue, setShowIssue] = useState(false);

  if (item.isLoading) {
    return (
      <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
        Loading…
      </div>
    );
  }
  if (!item.data) {
    return (
      <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
        Item not found.
      </div>
    );
  }

  const cat = (categories.data ?? []).find((c) => c.id === item.data!.category_id);
  const sup = (suppliers.data ?? []).find((s) => s.id === item.data!.supplier_id);
  const onHand = item.data.quantity;
  const threshold = item.data.reorder_threshold;
  const status =
    threshold && onHand <= 0
      ? "crit"
      : threshold && onHand <= threshold
      ? "low"
      : "ok";

  async function onArchive() {
    const ok = await confirm(
      "Archive this item? It will be hidden from list views; movements remain in the audit log."
    );
    if (!ok) return;
    try {
      await archive.mutateAsync(id);
      toast("Item archived.", "success");
      router.replace("/inventory");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Archive failed", "error");
    }
  }

  return (
    <div>
      <PageHeader
        crumb={`Workspace · Inventory · ${cat?.name ?? ""} · ${item.data.name}`}
        title={item.data.name}
        actions={
          <>
            <Link
              href={`/inventory/${id}/edit`}
              className="rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-3.5 py-2 text-[13px]"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setShowRestock(true)}
              className="inline-flex items-center gap-1 rounded-[var(--r-md)] px-3.5 py-2 text-[13px] font-medium text-white"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px var(--accent-glow)",
              }}
            >
              <span className="text-[14px] leading-none">+</span> Restock
            </button>
            <button
              type="button"
              onClick={() => setShowIssue(true)}
              className="inline-flex items-center gap-1 rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-3.5 py-2 text-[13px] font-medium text-[color:var(--text)]"
            >
              <span className="text-[14px] leading-none">−</span> Issue
            </button>
            <button
              type="button"
              onClick={onArchive}
              className="rounded-[var(--r-md)] border border-[color:var(--border)] px-3.5 py-2 text-[13px] text-[color:var(--text-muted)]"
            >
              Archive
            </button>
          </>
        }
      />

      <div className="mb-6 rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] p-6 backdrop-blur-2xl">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
          <CategoryPill name={cat?.name} />
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-[12px] text-[color:var(--text-muted)]">
          <Meta label="Item code" value={item.data.sku} mono />
          <Meta label="Category" value={cat?.name ?? "—"} />
          <Meta label="Supplier" value={sup?.name ?? "—"} />
          <Meta label="On hand" value={`${onHand} units`} mono />
          <Meta
            label="Unit cost"
            value={item.data.unit_cost ? `A$${item.data.unit_cost}` : "—"}
            mono
          />
          <Meta label="Expiry date" value={item.data.expiry_date ?? "—"} mono />
          <Meta
            label="Reorder at"
            value={threshold != null ? `${threshold}` : "—"}
            mono
          />
          <div className="text-[12px] text-[color:var(--text-muted)]">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--text-faint)]">
              Status
            </div>
            <StatusDot status={status} className="text-[13px]" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-[color:var(--border)]">
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>
          Overview
        </TabBtn>
        <TabBtn active={tab === "movements"} onClick={() => setTab("movements")}>
          Movements
          <span className="ml-1 font-mono text-[10px] opacity-60">
            {movements.data?.length ?? 0}
          </span>
        </TabBtn>
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          {item.data.notes && (
            <div className="rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] p-6">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
                Notes
              </div>
              <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-[color:var(--text)]">
                {item.data.notes}
              </div>
            </div>
          )}
          <div className="rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] p-6">
            <div className="text-[13px] text-[color:var(--text-muted)]">
              Use <strong>Restock</strong> to add new stock (and optionally
              record the cost or expiry of that shipment), and{" "}
              <strong>Issue</strong> to record sales / usage. The{" "}
              <strong>Movements</strong> tab shows every change for this item
              as an append-only audit log.
            </div>
          </div>
        </div>
      )}

      {tab === "movements" && (
        <>
        <div className="overflow-hidden rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)]">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Type</Th>
                <Th>Delta</Th>
                <Th>Notes</Th>
              </tr>
            </thead>
            <tbody>
              {(movements.data ?? []).map((m) => (
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
                    <span className="text-[12px] text-[color:var(--text-muted)]">{m.notes ?? "—"}</span>
                  </Td>
                </tr>
              ))}
              {movements.data && movements.data.length === 0 && (
                <tr>
                  <Td colSpan={4}>
                    <div className="py-12 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
                      No movements yet — Restock or Issue this item to start
                      the audit log.
                    </div>
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={movementsPage}
          hasMore={(movements.data?.length ?? 0) === PAGE_SIZE}
          onChange={setMovementsPage}
        />
        </>
      )}

      {showRestock && item.data && (
        <Modal title="Restock" onClose={() => setShowRestock(false)}>
          <RestockForm
            currentUnitCost={item.data.unit_cost}
            onSubmit={async (body) => {
              try {
                await restock.mutateAsync({ id, body });
                toast("Stock added.", "success");
                setShowRestock(false);
              } catch (err) {
                toast(err instanceof Error ? err.message : "Restock failed", "error");
              }
            }}
            onCancel={() => setShowRestock(false)}
            submitting={restock.isPending}
          />
        </Modal>
      )}

      {showIssue && item.data && (
        <Modal title="Issue" onClose={() => setShowIssue(false)}>
          <IssueForm
            maxQty={onHand}
            onSubmit={async (body) => {
              try {
                await issue.mutateAsync({ id, body });
                toast("Stock issued.", "success");
                setShowIssue(false);
              } catch (err) {
                toast(err instanceof Error ? err.message : "Issue failed", "error");
              }
            }}
            onCancel={() => setShowIssue(false)}
            submitting={issue.isPending}
          />
        </Modal>
      )}
    </div>
  );
}

function RestockForm({
  currentUnitCost,
  onSubmit,
  onCancel,
  submitting,
}: {
  currentUnitCost: string | null;
  onSubmit: (body: { quantity: number; unit_cost?: string; expiry_date?: string; notes?: string }) => void | Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [quantity, setQuantity] = useState<string>("1");
  const [unitCost, setUnitCost] = useState<string>(currentUnitCost ?? "");
  const [expiry, setExpiry] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit({
          quantity: Number(quantity),
          unit_cost: unitCost === "" ? undefined : unitCost,
          expiry_date: expiry === "" ? undefined : expiry,
          notes: notes === "" ? undefined : notes,
        });
      }}
      className="space-y-4"
    >
      <Field label="Quantity to add" required>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={INPUT}
          required
        />
      </Field>
      <Field label="Unit cost (A$)" hint="Optional — leave blank to keep the existing cost">
        <input
          type="number"
          step="0.01"
          value={unitCost}
          onChange={(e) => setUnitCost(e.target.value)}
          className={INPUT}
        />
      </Field>
      <Field label="Expiry date" hint="Optional — leave blank if items don't expire">
        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className={INPUT}
        />
      </Field>
      <Field label="Notes">
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className={INPUT} />
      </Field>
      <Actions submitting={submitting} onCancel={onCancel} primary="Restock" />
    </form>
  );
}

function IssueForm({
  maxQty,
  onSubmit,
  onCancel,
  submitting,
}: {
  maxQty: number;
  onSubmit: (body: { quantity: number; notes?: string }) => void | Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [quantity, setQuantity] = useState<string>("1");
  const [notes, setNotes] = useState<string>("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit({
          quantity: Number(quantity),
          notes: notes === "" ? undefined : notes,
        });
      }}
      className="space-y-4"
    >
      <Field
        label="Quantity to remove"
        required
        hint={`On hand: ${maxQty}`}
      >
        <input
          type="number"
          min={1}
          max={maxQty}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={INPUT}
          required
        />
      </Field>
      <Field label="Notes">
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className={INPUT} />
      </Field>
      <Actions submitting={submitting} onCancel={onCancel} primary="Issue" />
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

function Actions({
  submitting,
  onCancel,
  primary,
}: {
  submitting: boolean;
  onCancel: () => void;
  primary: string;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="submit"
        disabled={submitting}
        className="rounded-[var(--r-md)] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60"
        style={{ background: "var(--accent)" }}
      >
        {submitting ? "Saving…" : primary}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-4 py-2 text-[13px]"
      >
        Cancel
      </button>
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--text-faint)]">
        {label}
      </div>
      <div className={cn("text-[13px] font-medium text-[color:var(--text)]", mono && "font-mono")}>
        {value}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 px-4 py-3 text-[13px]",
        active
          ? "border-[color:var(--accent)] text-[color:var(--text)]"
          : "border-transparent text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
      )}
    >
      {children}
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

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[480px] max-w-[90vw] rounded-[var(--r-xl)] border border-[color:var(--border-strong)] bg-[color:var(--bg-2)] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-[24px] italic">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-faint)] hover:text-[color:var(--text)]"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

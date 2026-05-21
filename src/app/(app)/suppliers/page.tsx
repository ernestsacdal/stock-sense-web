"use client";

import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Pagination, PAGE_SIZE } from "@/components/pagination";
import { useToast } from "@/components/toast";
import {
  useCreateSupplier,
  useDeleteSupplier,
  useSuppliers,
  useUpdateSupplier,
} from "@/lib/queries";
import type { Supplier } from "@/lib/types";

const INPUT =
  "w-full rounded-[var(--r-md)] border border-[color:var(--border-strong)] bg-[color:var(--bg)] px-3 py-2 text-[13px] outline-none focus:border-[color:var(--accent)]";

export default function SuppliersPage() {
  const [page, setPage] = useState(1);
  const list = useSuppliers(page);
  const create = useCreateSupplier();
  const update = useUpdateSupplier();
  const del = useDeleteSupplier();
  const { toast, confirm } = useToast();

  const [editing, setEditing] = useState<Supplier | "new" | null>(null);

  function close() {
    setEditing(null);
  }

  return (
    <div>
      <PageHeader
        crumb="Workspace · Suppliers"
        title="Suppliers"
        actions={
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="rounded-[var(--r-md)] px-3.5 py-2 text-[13px] font-medium text-[#1a1300]"
            style={{ background: "var(--accent)" }}
          >
            + Supplier
          </button>
        }
      />

      <div className="overflow-hidden rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)]">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-[13px]">
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Contact</Th>
              <Th>{""}</Th>
            </tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((s) => (
              <tr key={s.id} className="border-b border-[color:var(--border)] last:border-0">
                <Td>
                  <span className="font-medium">{s.name}</span>
                  {s.notes && (
                    <div className="mt-1 text-[11px] text-[color:var(--text-faint)]">{s.notes}</div>
                  )}
                </Td>
                <Td>
                  <span className="text-[12px] text-[color:var(--text-muted)]">{s.contact ?? "—"}</span>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(s)}
                      className="rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-3 py-1 text-[12px]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await confirm(`Delete supplier "${s.name}"?`);
                        if (!ok) return;
                        try {
                          await del.mutateAsync(s.id);
                          toast("Supplier deleted.", "success");
                        } catch (err) {
                          toast(err instanceof Error ? err.message : "Delete failed", "error");
                        }
                      }}
                      className="rounded-[var(--r-md)] border border-[color:var(--border)] px-3 py-1 text-[12px] text-[color:var(--text-muted)]"
                    >
                      Delete
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <Pagination
        page={page}
        hasMore={(list.data?.length ?? 0) === PAGE_SIZE}
        onChange={setPage}
      />

      {editing && (
        <SupplierFormModal
          supplier={editing === "new" ? null : editing}
          onClose={close}
          onSave={async (body) => {
            try {
              if (editing === "new") await create.mutateAsync(body);
              else await update.mutateAsync({ id: editing.id, body });
              toast("Supplier saved.", "success");
              close();
            } catch (err) {
              toast(err instanceof Error ? err.message : "Save failed", "error");
            }
          }}
        />
      )}
    </div>
  );
}

function SupplierFormModal({
  supplier,
  onClose,
  onSave,
}: {
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (body: Partial<Supplier>) => Promise<void>;
}) {
  const [name, setName] = useState(supplier?.name ?? "");
  const [contact, setContact] = useState(supplier?.contact ?? "");
  const [notes, setNotes] = useState(supplier?.notes ?? "");

  return (
    <Modal title={supplier ? "Edit supplier" : "New supplier"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onSave({
            name,
            contact: contact || null,
            notes: notes || null,
          });
        }}
        className="space-y-4"
      >
        <Field label="Name" required>
          <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT} required />
        </Field>
        <Field label="Contact">
          <input value={contact} onChange={(e) => setContact(e.target.value)} className={INPUT} />
        </Field>
        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${INPUT} min-h-[80px]`}
          />
        </Field>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-[var(--r-md)] px-4 py-2 text-[13px] font-medium text-[#1a1300]"
            style={{ background: "var(--accent)" }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-4 py-2 text-[13px]"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
        {label}
        {required && <span className="ml-1 text-[color:var(--accent)]">*</span>}
      </label>
      {children}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-b border-[color:var(--border)] bg-black/20 px-4 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-middle">{children}</td>;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] rounded-[var(--r-xl)] border border-[color:var(--border-strong)] bg-[color:var(--bg-2)] p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-[24px] italic">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-faint)]"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Pagination, PAGE_SIZE } from "@/components/pagination";
import { useToast } from "@/components/toast";
import {
  useCreateLocation,
  useDeleteLocation,
  useLocations,
  useUpdateLocation,
} from "@/lib/queries";
import type { Location } from "@/lib/types";

const INPUT =
  "w-full rounded-[var(--r-md)] border border-[color:var(--border-strong)] bg-[color:var(--bg)] px-3 py-2 text-[13px] outline-none focus:border-[color:var(--accent)]";

export default function LocationsPage() {
  const [page, setPage] = useState(1);
  const list = useLocations(page);
  const create = useCreateLocation();
  const update = useUpdateLocation();
  const del = useDeleteLocation();
  const { toast, confirm } = useToast();

  const [editing, setEditing] = useState<Location | "new" | null>(null);

  return (
    <div>
      <PageHeader
        crumb="Workspace · Locations"
        title="Locations"
        actions={
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="rounded-[var(--r-md)] px-3.5 py-2 text-[13px] font-medium text-[#1a1300]"
            style={{ background: "var(--accent)" }}
          >
            + Location
          </button>
        }
      />

      <div className="overflow-hidden rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)]">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-[13px]">
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>{""}</Th>
            </tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((l) => (
              <tr key={l.id} className="border-b border-[color:var(--border)] last:border-0">
                <Td>
                  <span className="font-medium">{l.name}</span>
                </Td>
                <Td>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--text-muted)]">
                    {l.type}
                  </span>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(l)}
                      className="rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-3 py-1 text-[12px]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await confirm(`Delete location "${l.name}"?`);
                        if (!ok) return;
                        try {
                          await del.mutateAsync(l.id);
                          toast("Location deleted.", "success");
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
        <LocationFormModal
          location={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (body) => {
            try {
              if (editing === "new") await create.mutateAsync(body);
              else await update.mutateAsync({ id: editing.id, body });
              toast("Location saved.", "success");
              setEditing(null);
            } catch (err) {
              toast(err instanceof Error ? err.message : "Save failed", "error");
            }
          }}
        />
      )}
    </div>
  );
}

function LocationFormModal({
  location,
  onClose,
  onSave,
}: {
  location: Location | null;
  onClose: () => void;
  onSave: (body: Partial<Location>) => Promise<void>;
}) {
  const [name, setName] = useState(location?.name ?? "");
  const [type, setType] = useState(location?.type ?? "storage");

  return (
    <Modal title={location ? "Edit location" : "New location"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onSave({ name, type });
        }}
        className="space-y-4"
      >
        <Field label="Name" required>
          <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT} required />
        </Field>
        <Field label="Type">
          <input value={type} onChange={(e) => setType(e.target.value)} className={INPUT} />
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
        className="w-full max-w-[480px] rounded-[var(--r-xl)] border border-[color:var(--border-strong)] bg-[color:var(--bg-2)] p-6 sm:p-8"
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

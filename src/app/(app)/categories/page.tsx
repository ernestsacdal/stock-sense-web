"use client";

import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { Pagination, PAGE_SIZE } from "@/components/pagination";
import { useToast } from "@/components/toast";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/lib/queries";
import type { Category } from "@/lib/types";

const INPUT =
  "rounded-[var(--r-md)] border border-[color:var(--border-strong)] bg-[color:var(--bg)] px-3 py-2 text-[13px] outline-none focus:border-[color:var(--accent)]";

export default function SettingsPage() {
  const [page, setPage] = useState(1);
  const list = useCategories(page);
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();
  const { toast, confirm } = useToast();

  const [editing, setEditing] = useState<Category | "new" | null>(null);

  return (
    <div>
      <PageHeader
        crumb="Workspace · Categories"
        title="Categories"
        actions={
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="rounded-[var(--r-md)] px-3.5 py-2 text-[13px] font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            + Category
          </button>
        }
      />

      <p className="mb-6 max-w-2xl text-[13px] text-[color:var(--text-muted)]">
        Categories are simple labels you assign to items. Use whatever
        groupings make sense for your business — e.g. <em>Food</em>,{" "}
        <em>Equipment</em>, <em>Cleaning</em>.
      </p>

      <div className="space-y-4">
        {list.data && list.data.length === 0 && (
          <div className="rounded-[var(--r-lg)] border border-dashed border-[color:var(--border)] p-12 text-center text-[13px] text-[color:var(--text-muted)]">
            No categories yet. Click <strong>+ Category</strong> to add one.
          </div>
        )}
        {(list.data ?? []).map((c) => (
          <div
            key={c.id}
            className="rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] p-4 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="break-words font-[family-name:var(--font-display)] text-[22px] italic sm:text-[24px]">
                  {c.name}
                </div>
                {c.description && (
                  <div className="mt-1 break-words text-[13px] text-[color:var(--text-muted)]">
                    {c.description}
                  </div>
                )}
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(c)}
                  className="rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-3 py-1 text-[12px]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await confirm(`Delete category "${c.name}"?`);
                    if (!ok) return;
                    try {
                      await del.mutateAsync(c.id);
                      toast("Category deleted.", "success");
                    } catch (err) {
                      toast(err instanceof Error ? err.message : "Delete failed", "error");
                    }
                  }}
                  className="rounded-[var(--r-md)] border border-[color:var(--border)] px-3 py-1 text-[12px] text-[color:var(--text-muted)]"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        page={page}
        hasMore={(list.data?.length ?? 0) === PAGE_SIZE}
        onChange={setPage}
      />

      {editing && (
        <CategoryEditor
          category={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (body) => {
            try {
              if (editing === "new") await create.mutateAsync(body);
              else await update.mutateAsync({ id: editing.id, body });
              toast("Category saved.", "success");
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

function CategoryEditor({
  category,
  onClose,
  onSave,
}: {
  category: Category | null;
  onClose: () => void;
  onSave: (body: Partial<Category>) => Promise<void>;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");

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
          <h2 className="font-[family-name:var(--font-display)] text-[28px] italic">
            {category ? "Edit category" : "New category"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-faint)]"
          >
            Close
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onSave({
              name,
              description: description || null,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
              Name <span className="text-[color:var(--accent)]">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${INPUT} w-full`}
              required
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${INPUT} w-full`}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-[var(--r-md)] px-4 py-2 text-[13px] font-medium text-white"
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
      </div>
    </div>
  );
}

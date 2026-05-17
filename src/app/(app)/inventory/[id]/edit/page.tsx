"use client";

import { use } from "react";

import { ItemForm } from "@/components/item-form";
import { PageHeader } from "@/components/page-header";
import { useItem } from "@/lib/queries";

export default function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const item = useItem(Number(id));

  return (
    <div>
      <PageHeader
        crumb={`Workspace · Inventory · ${item.data?.name ?? ""} · Edit`}
        title="Edit item"
      />
      {item.isLoading && (
        <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
          Loading…
        </div>
      )}
      {item.data && <ItemForm item={item.data} />}
    </div>
  );
}

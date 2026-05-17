"use client";

import { ItemForm } from "@/components/item-form";
import { PageHeader } from "@/components/page-header";

export default function NewItemPage() {
  return (
    <div>
      <PageHeader crumb="Workspace · Inventory · New" title="New item" />
      <ItemForm />
    </div>
  );
}

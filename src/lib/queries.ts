"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { useAuth, type Fetcher } from "@/lib/auth";
import type {
  ActivityItem,
  Category,
  DashboardSummary,
  Item,
  ItemSummary,
  Location,
  Movement,
  MovementType,
  QueryLog,
  Supplier,
  ValueHistoryPoint,
} from "@/lib/types";

async function ok<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = (body as { detail?: string } | null)?.detail ?? res.statusText;
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

function qs(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    search.set(k, String(v));
  }
  const out = search.toString();
  return out ? `?${out}` : "";
}

// Shared page size for every paginated list. Centralised so we never
// drift across pages.
export const LIST_PAGE_SIZE = 10;

function pageParams(page: number | undefined): Record<string, unknown> {
  if (!page) return {};
  return { limit: LIST_PAGE_SIZE, offset: (page - 1) * LIST_PAGE_SIZE };
}

// ---------- Categories ----------

export function useCategories(page?: number) {
  const { fetcher } = useAuth();
  return useQuery({
    queryKey: ["categories", page ?? "all"],
    queryFn: () =>
      fetcher(`/api/categories${qs(pageParams(page))}`).then((r) => ok<Category[]>(r)),
  });
}

export function useCategory(id: number | null) {
  const { fetcher } = useAuth();
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => fetcher(`/api/categories/${id}`).then((r) => ok<Category>(r)),
    enabled: id != null,
  });
}

export function useCreateCategory() {
  return useResourceMutation<Category, Partial<Category>>(
    (fetcher, body) =>
      fetcher("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => ok<Category>(r)),
    ["categories"]
  );
}

export function useUpdateCategory() {
  return useResourceMutation<Category, { id: number; body: Partial<Category> }>(
    (fetcher, { id, body }) =>
      fetcher(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => ok<Category>(r)),
    ["categories"]
  );
}

export function useDeleteCategory() {
  return useResourceMutation<void, number>(
    (fetcher, id) =>
      fetcher(`/api/categories/${id}`, { method: "DELETE" }).then((r) => {
        if (!r.ok) throw new Error(r.statusText);
      }),
    ["categories"]
  );
}

// ---------- Suppliers ----------

export function useSuppliers(page?: number) {
  const { fetcher } = useAuth();
  return useQuery({
    queryKey: ["suppliers", page ?? "all"],
    queryFn: () =>
      fetcher(`/api/suppliers${qs(pageParams(page))}`).then((r) => ok<Supplier[]>(r)),
  });
}

export function useCreateSupplier() {
  return useResourceMutation<Supplier, Partial<Supplier>>(
    (fetcher, body) =>
      fetcher("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => ok<Supplier>(r)),
    ["suppliers"]
  );
}

export function useUpdateSupplier() {
  return useResourceMutation<Supplier, { id: number; body: Partial<Supplier> }>(
    (fetcher, { id, body }) =>
      fetcher(`/api/suppliers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => ok<Supplier>(r)),
    ["suppliers"]
  );
}

export function useDeleteSupplier() {
  return useResourceMutation<void, number>(
    (fetcher, id) =>
      fetcher(`/api/suppliers/${id}`, { method: "DELETE" }).then((r) => {
        if (!r.ok) throw new Error(r.statusText);
      }),
    ["suppliers"]
  );
}

// ---------- Locations ----------

export function useLocations(page?: number) {
  const { fetcher } = useAuth();
  return useQuery({
    queryKey: ["locations", page ?? "all"],
    queryFn: () =>
      fetcher(`/api/locations${qs(pageParams(page))}`).then((r) => ok<Location[]>(r)),
  });
}

export function useCreateLocation() {
  return useResourceMutation<Location, Partial<Location>>(
    (fetcher, body) =>
      fetcher("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => ok<Location>(r)),
    ["locations"]
  );
}

export function useUpdateLocation() {
  return useResourceMutation<Location, { id: number; body: Partial<Location> }>(
    (fetcher, { id, body }) =>
      fetcher(`/api/locations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => ok<Location>(r)),
    ["locations"]
  );
}

export function useDeleteLocation() {
  return useResourceMutation<void, number>(
    (fetcher, id) =>
      fetcher(`/api/locations/${id}`, { method: "DELETE" }).then((r) => {
        if (!r.ok) throw new Error(r.statusText);
      }),
    ["locations"]
  );
}

// ---------- Items ----------

export type ItemListFilters = {
  q?: string;
  category_id?: number;
  supplier_id?: number;
  location_id?: number;
  stock_status?: "ok" | "low" | "crit";
  include_archived?: boolean;
};

export function useItems(filters: ItemListFilters = {}, page?: number) {
  const { fetcher } = useAuth();
  return useQuery({
    queryKey: ["items", filters, page ?? "all"],
    queryFn: () =>
      fetcher(`/api/items${qs({ ...filters, ...pageParams(page) })}`).then(
        (r) => ok<ItemSummary[]>(r)
      ),
  });
}

export function useItem(id: number | null) {
  const { fetcher } = useAuth();
  return useQuery({
    queryKey: ["items", id],
    queryFn: () => fetcher(`/api/items/${id}`).then((r) => ok<Item>(r)),
    enabled: id != null,
  });
}

export function useCreateItem() {
  return useResourceMutation<Item, Partial<Item>>(
    (fetcher, body) =>
      fetcher("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => ok<Item>(r)),
    ["items"]
  );
}

export function useUpdateItem() {
  return useResourceMutation<Item, { id: number; body: Partial<Item> }>(
    (fetcher, { id, body }) =>
      fetcher(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => ok<Item>(r)),
    ["items"]
  );
}

export function useArchiveItem() {
  return useResourceMutation<Item, number>(
    (fetcher, id) =>
      fetcher(`/api/items/${id}`, { method: "DELETE" }).then((r) => ok<Item>(r)),
    ["items"]
  );
}

// ---------- Restock / Issue ----------

export type RestockIn = {
  quantity: number;
  unit_cost?: string | number | null;
  expiry_date?: string | null;
  notes?: string | null;
};

export type IssueIn = {
  quantity: number;
  notes?: string | null;
};

export function useRestock() {
  return useResourceMutation<Item, { id: number; body: RestockIn }>(
    (fetcher, { id, body }) =>
      fetcher(`/api/items/${id}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => ok<Item>(r)),
    ["items", "movements", "dashboard", "insights"]
  );
}

export function useIssue() {
  return useResourceMutation<Item, { id: number; body: IssueIn }>(
    (fetcher, { id, body }) =>
      fetcher(`/api/items/${id}/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => ok<Item>(r)),
    ["items", "movements", "dashboard", "insights"]
  );
}

// ---------- Movements ----------

export type MovementFilters = {
  item_id?: number;
  type?: MovementType;
  limit?: number;
};

export function useMovements(filters: MovementFilters = {}, page?: number) {
  const { fetcher } = useAuth();
  return useQuery({
    queryKey: ["movements", filters, page ?? "all"],
    queryFn: () =>
      fetcher(`/api/movements${qs({ ...filters, ...pageParams(page) })}`).then(
        (r) => ok<Movement[]>(r)
      ),
  });
}

export function useCreateMovement() {
  return useResourceMutation<Movement, Partial<Movement>>(
    (fetcher, body) =>
      fetcher("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => ok<Movement>(r)),
    ["movements", "items"]
  );
}

// ---------- Dashboard ----------

export function useDashboardSummary() {
  const { fetcher } = useAuth();
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () =>
      fetcher("/api/dashboard/summary").then((r) => ok<DashboardSummary>(r)),
  });
}

export function useValueHistory(days: number = 30) {
  const { fetcher } = useAuth();
  return useQuery({
    queryKey: ["dashboard", "value-history", days],
    queryFn: () =>
      fetcher(`/api/dashboard/value-history?days=${days}`).then(
        (r) => ok<ValueHistoryPoint[]>(r)
      ),
  });
}

export function useActivity(limit: number = 20) {
  const { fetcher } = useAuth();
  return useQuery({
    queryKey: ["dashboard", "activity", limit],
    queryFn: () =>
      fetcher(`/api/dashboard/activity?limit=${limit}`).then(
        (r) => ok<ActivityItem[]>(r)
      ),
  });
}

// ---------- Ask history ----------

export function useAskHistory(limit: number = 20) {
  const { fetcher } = useAuth();
  return useQuery({
    queryKey: ["ask", "history", limit],
    queryFn: () =>
      fetcher(`/api/ask/history?limit=${limit}`).then((r) => ok<QueryLog[]>(r)),
  });
}

export function useAskTurn(id: number | null) {
  const { fetcher } = useAuth();
  return useQuery({
    queryKey: ["ask", "turn", id],
    queryFn: () => fetcher(`/api/ask/${id}`).then((r) => ok<QueryLog>(r)),
    enabled: id != null,
  });
}

// ---------- Profile ----------

export type ProfileUpdateIn = {
  business_name?: string | null;
  current_password?: string;
  new_password?: string;
};

export function useUpdateProfile() {
  const { fetcher, refresh } = useAuth();
  const qc = useQueryClient();
  return useMutation<unknown, Error, ProfileUpdateIn>({
    mutationFn: async (body) => {
      const r = await fetcher("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return ok<unknown>(r);
    },
    onSuccess: async () => {
      await refresh();
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ---------- Internal helper ----------

function useResourceMutation<TData, TVars>(
  fn: (fetcher: Fetcher, vars: TVars) => Promise<TData>,
  invalidateKeys: string[],
  options?: UseMutationOptions<TData, Error, TVars>
) {
  const { fetcher } = useAuth();
  const qc = useQueryClient();
  return useMutation<TData, Error, TVars>({
    mutationFn: (vars) => fn(fetcher, vars),
    onSuccess: () => {
      for (const key of invalidateKeys) {
        qc.invalidateQueries({ queryKey: [key] });
      }
    },
    ...options,
  });
}

export type Category = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Supplier = {
  id: number;
  name: string;
  contact: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Location = {
  id: number;
  name: string;
  type: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
};

export type Item = {
  id: number;
  sku: string;
  name: string;
  category_id: number | null;
  supplier_id: number | null;
  location_id: number | null;
  reorder_threshold: number | null;
  quantity: number;
  unit_cost: string | null;
  expiry_date: string | null;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ItemSummary = {
  id: number;
  sku: string;
  name: string;
  category_id: number | null;
  supplier_id: number | null;
  location_id: number | null;
  location_name: string | null;
  reorder_threshold: number | null;
  archived_at: string | null;
  on_hand: number;
  stock_status: "ok" | "low" | "crit";
  nearest_expiry: string | null;
};

export type MovementType =
  | "added"
  | "received"
  | "issued"
  | "disposed"
  | "adjusted"
  | "transferred";

export type Movement = {
  id: number;
  item_id: number;
  type: MovementType;
  quantity_delta: number;
  user_id: number | null;
  notes: string | null;
  created_at: string;
};

export type DashboardSummary = {
  total_value: string;
  active_skus: number;
  expiring_30d_count: number;
  expiring_30d_value: string;
  low_stock_count: number;
  low_stock_critical: number;
};

export type ValueHistoryPoint = {
  date: string;
  value: string;
};

export type ActivityItem = {
  movement_id: number;
  type: MovementType;
  quantity_delta: number;
  item_id: number;
  item_name: string;
  item_sku: string;
  user_email: string | null;
  notes: string | null;
  created_at: string;
};

export type QueryStatus =
  | "ok"
  | "llm_error"
  | "safety_rejected"
  | "exec_error"
  | "timeout";

export type QueryLog = {
  id: number;
  question: string;
  // SQL is still returned by the API for audit/debug but no UI consumes
  // it — the chat shows answer_text instead.
  generated_sql: string | null;
  answer_text: string | null;
  status: QueryStatus;
  error_message: string | null;
  row_count: number | null;
  duration_ms: number;
  created_at: string;
};

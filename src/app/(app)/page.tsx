"use client";

import { useState } from "react";

import { ActivityFeed } from "@/components/activity-feed";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { ValueChart } from "@/components/value-chart";
import { useAuth } from "@/lib/auth";
import { useDashboardSummary, useValueHistory } from "@/lib/queries";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const summary = useDashboardSummary();
  const [historyDays, setHistoryDays] = useState(30);
  const history = useValueHistory(historyDays);

  const greeting = greetingFor(new Date());
  const totalValue = summary.data ? Number(summary.data.total_value) : 0;
  const expiringValue = summary.data ? Number(summary.data.expiring_30d_value) : 0;

  return (
    <div>
      <PageHeader
        crumb={`Workspace · ${user?.business_name ?? "Demo Inventory"}`}
        title={`${greeting}, ${user?.email?.split("@")[0] ?? "there"}`}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total stock value"
          prefix="A$"
          value={Math.round(totalValue).toLocaleString()}
          delta={
            summary.data
              ? { tone: "muted", text: "Across active items" }
              : undefined
          }
        />
        <StatCard
          label="Active items"
          value={summary.data ? String(summary.data.active_skus) : "—"}
          delta={
            summary.data
              ? { tone: "muted", text: "Excluding archived" }
              : undefined
          }
        />
        <StatCard
          label="Expiring in 30 days"
          value={summary.data ? String(summary.data.expiring_30d_count) : "—"}
          accent
          delta={
            summary.data
              ? {
                  tone: "warn",
                  text: `A$${Math.round(expiringValue).toLocaleString()} at risk`,
                }
              : undefined
          }
        />
        <StatCard
          label="Low stock alerts"
          value={summary.data ? String(summary.data.low_stock_count) : "—"}
          delta={
            summary.data
              ? {
                  tone: summary.data.low_stock_critical > 0 ? "down" : "muted",
                  text: `${summary.data.low_stock_critical} critical`,
                }
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] backdrop-blur-2xl">
          <div className="flex flex-shrink-0 items-center justify-between border-b border-[color:var(--border)] px-5 py-4">
            <div className="text-[14px] font-semibold tracking-[-0.01em]">
              Stock value{" "}
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--text-faint)]">
                Last {historyDays} days
              </span>
            </div>
            <div className="flex gap-2">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setHistoryDays(d)}
                  className={cn(
                    "rounded-full border px-3 py-0.5 text-[11px]",
                    historyDays === d
                      ? "border-[rgba(245,158,11,0.3)] bg-[color:var(--accent-soft)] text-[color:var(--accent-bright)]"
                      : "border-[color:var(--border)] bg-white/[0.03] text-[color:var(--text-muted)]"
                  )}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-[220px] flex-1 px-4 pb-5 pt-3">
            <ValueChart data={history.data ?? []} />
          </div>
        </div>

        <ActivityFeed />
      </div>
    </div>
  );
}

function greetingFor(d: Date): string {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

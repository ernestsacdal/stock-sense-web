"use client";

import Link from "next/link";

import { MOVEMENT_LABEL } from "@/lib/movement-labels";
import { useActivity } from "@/lib/queries";
import type { MovementType } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONE_BY_TYPE: Record<MovementType, string> = {
  added: "var(--success)",
  received: "var(--success)",
  issued: "var(--info)",
  disposed: "var(--danger)",
  adjusted: "var(--warning)",
  transferred: "var(--info)",
};

export function ActivityFeed() {
  const activity = useActivity(5);

  return (
    <div className="rounded-[var(--r-lg)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-[color:var(--border)] px-5 py-4">
        <div className="text-[14px] font-semibold tracking-[-0.01em]">
          Recent activity
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--text-faint)]">
          Last 5
        </span>
      </div>
      <div className="py-2">
        {activity.isLoading && (
          <div className="px-5 py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
            Loading…
          </div>
        )}
        {activity.data && activity.data.length === 0 && (
          <div className="px-5 py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
            No movements logged yet.
          </div>
        )}
        {(activity.data ?? []).map((entry) => {
          const tone = TONE_BY_TYPE[entry.type];
          const day = entry.created_at.slice(0, 10);
          return (
            <Link
              key={entry.movement_id}
              href={`/inventory/${entry.item_id}`}
              className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
            >
              <span
                className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: tone, boxShadow: `0 0 6px ${tone}` }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 text-[13px] leading-tight">
                  <span className="min-w-0 truncate">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--text-subtle)]">
                      {MOVEMENT_LABEL[entry.type]}
                    </span>{" "}
                    <span className="font-medium">{entry.item_name}</span>
                  </span>
                  <span
                    className={cn(
                      "flex-shrink-0 font-mono text-[12px]",
                      entry.quantity_delta > 0
                        ? "text-[color:var(--success)]"
                        : "text-[color:var(--danger)]",
                    )}
                  >
                    {entry.quantity_delta > 0 ? "+" : ""}
                    {entry.quantity_delta}
                  </span>
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--text-faint)]">
                  {day} · {entry.user_email ?? "system"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ValueHistoryPoint } from "@/lib/types";

export function ValueChart({ data }: { data: ValueHistoryPoint[] }) {
  if (!data || data.length === 0) {
    return <EmptyState label="No history yet." />;
  }

  const points = data.map((p) => ({ date: p.date, value: Number(p.value) }));
  const values = points.map((p) => p.value);
  const max = Math.max(...values);

  // A line of zeros + repeated "0k" labels looks broken even though it's
  // accurate — replace with a clear empty state when there's nothing to plot.
  if (max <= 0) {
    return <EmptyState label="No stock value to chart yet." />;
  }

  // Tighten the Y axis to the data range with a 10% pad so the trend line
  // doesn't hide near the bottom when the data is mostly flat at a high
  // baseline (the default 0..max scale buries values around the floor).
  const min = Math.min(...values);
  const span = Math.max(max - min, 1);
  const domain: [number, number] = [
    Math.max(0, Math.floor(min - span * 0.1)),
    Math.ceil(max + span * 0.1),
  ];

  // Show real dollars when the dataset is small (max < 1000); k-format
  // only once we cross into the thousands. Avoids the 5×"0k" stack.
  const yTick = (v: number) =>
    max >= 1000 ? `${Math.round(v / 1000)}k` : `${Math.round(v)}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id="value-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="0" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="var(--text-faint)"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickFormatter={(v: string) => v.slice(5)}
          minTickGap={28}
        />
        <YAxis
          stroke="var(--text-faint)"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickFormatter={yTick}
          width={40}
          domain={domain}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--text)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          }}
          labelStyle={{ color: "var(--text-muted)" }}
          formatter={(value) => [`A$${Number(value).toLocaleString()}`, "Value"]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#F59E0B"
          strokeWidth={2}
          fill="url(#value-fill)"
          dot={false}
          activeDot={{ r: 4, fill: "#F59E0B", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-faint)]">
      {label}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

export type AskResultPayload = {
  columns: string[];
  rows: unknown[][];
};

type Tab = "results" | "chart";

type ChartPlan =
  | { kind: "bar"; xCol: number; yCol: number }
  | { kind: "line"; xCol: number; yCol: number }
  | null;

export function AskResult({ result }: { result: AskResultPayload }) {
  const chart = useMemo(() => pickChart(result), [result]);
  const [tab, setTab] = useState<Tab>("results");

  return (
    <div className="mt-3 w-full min-w-[540px] overflow-hidden rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--bg)]">
      <div className="flex border-b border-[color:var(--border)] bg-black/20">
        <TabBtn active={tab === "results"} onClick={() => setTab("results")}>
          Results
          <span className="ml-1.5 font-mono text-[9px] opacity-70">
            {result.rows.length}
          </span>
        </TabBtn>
        {chart && (
          <TabBtn active={tab === "chart"} onClick={() => setTab("chart")}>
            Chart
          </TabBtn>
        )}
      </div>

      {tab === "results" && <ResultsTable result={result} />}
      {tab === "chart" && chart && <ChartView result={result} plan={chart} />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-b-2 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
        active
          ? "border-[color:var(--accent)] text-[color:var(--accent-bright)]"
          : "border-transparent text-[color:var(--text-subtle)] hover:text-[color:var(--text)]",
      )}
    >
      {children}
    </button>
  );
}

function ResultsTable({ result }: { result: AskResultPayload }) {
  if (result.rows.length === 0) {
    return (
      <div className="px-4 py-8 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
        Query returned no rows.
      </div>
    );
  }
  return (
    <div className="max-h-[420px] overflow-auto">
      <table className="w-full border-collapse text-[12.5px]">
        <thead className="sticky top-0">
          <tr>
            {result.columns.map((c) => (
              <th
                key={c}
                className="bg-black/30 px-4 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[color:var(--text-subtle)]"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, ri) => (
            <tr key={ri} className="border-t border-[color:var(--border)]">
              {row.map((v, ci) => (
                <td
                  key={ci}
                  className={cn(
                    "px-4 py-2 align-top",
                    typeof v === "number" || isNumericString(v)
                      ? "font-mono"
                      : ""
                  )}
                >
                  {v === null ? (
                    <span className="text-[color:var(--text-faint)]">—</span>
                  ) : (
                    String(v)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChartView({
  result,
  plan,
}: {
  result: AskResultPayload;
  plan: NonNullable<ChartPlan>;
}) {
  const points = result.rows
    .map((row) => ({
      x: String(row[plan.xCol] ?? ""),
      y: Number(row[plan.yCol]) || 0,
    }))
    .filter((p) => p.x !== "");

  return (
    <div className="h-[320px] px-4 pb-4 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        {plan.kind === "line" ? (
          <LineChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="x"
              stroke="#52525B"
              tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#52525B"
              tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(20,22,30,0.95)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 3, fill: "#F59E0B" }}
            />
          </LineChart>
        ) : (
          <BarChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="x"
              stroke="#52525B"
              tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={points.length > 6 ? -25 : 0}
              textAnchor={points.length > 6 ? "end" : "middle"}
              height={points.length > 6 ? 60 : 30}
            />
            <YAxis
              stroke="#52525B"
              tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(20,22,30,0.95)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="y" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

const NUM_RE = /^-?\d+(\.\d+)?$/;

function isNumericString(v: unknown): boolean {
  return typeof v === "string" && NUM_RE.test(v);
}

function isLikelyDateString(v: unknown): boolean {
  if (typeof v !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}/.test(v);
}

/**
 * Pick a chart type if one is sensible:
 *  - exactly 2 columns
 *  - the second is a number
 *  - the first is a date → line
 *  - the first is anything else → bar
 *  - otherwise → no chart
 */
function pickChart(result: AskResultPayload): ChartPlan {
  if (result.columns.length !== 2 || result.rows.length === 0) return null;
  const xCol = 0;
  const yCol = 1;
  const sample = result.rows[0];
  const yIsNumeric =
    typeof sample[yCol] === "number" || isNumericString(sample[yCol]);
  if (!yIsNumeric) return null;
  if (isLikelyDateString(sample[xCol])) {
    return { kind: "line", xCol, yCol };
  }
  return { kind: "bar", xCol, yCol };
}

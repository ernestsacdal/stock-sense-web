import { cn } from "@/lib/utils";

const TONES: Record<string, { color: string; label: string }> = {
  ok: { color: "var(--success)", label: "Healthy" },
  low: { color: "var(--warning)", label: "Low stock" },
  crit: { color: "var(--danger)", label: "Critical" },
};

export function StatusDot({
  status,
  label,
  className,
}: {
  status: "ok" | "low" | "crit";
  label?: string;
  className?: string;
}) {
  const tone = TONES[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px]", className)}>
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: tone.color, boxShadow: `0 0 8px ${tone.color}` }}
      />
      <span style={{ color: tone.color }}>{label ?? tone.label}</span>
    </span>
  );
}

export function StockBar({
  current,
  threshold,
}: {
  current: number;
  threshold: number | null;
}) {
  const cap = Math.max(threshold ?? current, 1);
  const pct = Math.min(100, Math.max(0, (current / (cap * 2)) * 100));
  const tone =
    current === 0 || (threshold && current <= 0)
      ? "var(--danger)"
      : threshold && current <= threshold
      ? "var(--warning)"
      : "var(--success)";
  return (
    <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-white/[0.06]">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
    </div>
  );
}

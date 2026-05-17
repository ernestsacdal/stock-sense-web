import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  prefix?: string;
  delta?: { tone: "up" | "down" | "warn" | "muted"; text: string };
  accent?: boolean;
};

export function StatCard({ label, value, prefix, delta, accent }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--r-lg)] border p-5 backdrop-blur-2xl",
        accent
          ? "border-[rgba(245,158,11,0.3)]"
          : "border-[color:var(--border)]"
      )}
      style={{
        background: accent
          ? "linear-gradient(180deg, var(--accent-soft), transparent 80%), var(--surface-glass)"
          : "var(--surface-glass)",
      }}
    >
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
        {label}
      </div>
      <div className="font-[family-name:var(--font-display)] text-[42px] italic leading-none tracking-[-0.03em]">
        {prefix && (
          <span className="mr-0.5 align-top text-[22px] text-[color:var(--text-muted)]">
            {prefix}
          </span>
        )}
        {value}
      </div>
      {delta && (
        <div className="mt-3 flex items-center gap-1 text-[12px] text-[color:var(--text-muted)]">
          <span
            className={cn(
              delta.tone === "up" && "text-[color:var(--success)]",
              delta.tone === "down" && "text-[color:var(--danger)]",
              delta.tone === "warn" && "text-[color:var(--accent-bright)]",
              delta.tone === "muted" && "text-[color:var(--text-muted)]"
            )}
          >
            {delta.text}
          </span>
        </div>
      )}
    </div>
  );
}

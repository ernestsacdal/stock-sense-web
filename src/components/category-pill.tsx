import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  Medication:
    "text-[#FCA5A5] border-[rgba(252,165,165,0.2)] bg-[rgba(252,165,165,0.06)]",
  Equipment:
    "text-[#7DD3FC] border-[rgba(125,211,252,0.2)] bg-[rgba(125,211,252,0.06)]",
  Consumable:
    "text-[#86EFAC] border-[rgba(134,239,172,0.2)] bg-[rgba(134,239,172,0.06)]",
};

export function CategoryPill({ name }: { name: string | undefined }) {
  if (!name) return null;
  const tone = TONES[name] ?? "text-[color:var(--text-muted)] border-[color:var(--border)] bg-white/[0.05]";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider",
        tone
      )}
    >
      {name}
    </span>
  );
}

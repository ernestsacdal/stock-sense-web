import { cn } from "@/lib/utils";

type BrandProps = {
  size?: "sm" | "lg";
  className?: string;
};

export function Brand({ size = "sm", className }: BrandProps) {
  const lg = size === "lg";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center font-[family-name:var(--font-display)] italic font-normal text-[#1a1300]",
          lg ? "h-14 w-14 rounded-[14px] text-[32px]" : "h-8 w-8 rounded-lg text-[20px]"
        )}
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, #FBBF24 100%)",
          boxShadow: "0 4px 12px var(--accent-glow)",
        }}
      >
        S
      </div>
      <div
        className={cn(
          "font-[family-name:var(--font-display)] italic tracking-[-0.02em] text-[color:var(--text)]",
          lg ? "text-[32px]" : "text-[22px]"
        )}
      >
        Stock<span className="text-[color:var(--accent)]">Sense</span>
      </div>
    </div>
  );
}

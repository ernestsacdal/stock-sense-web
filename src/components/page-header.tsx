import type { ReactNode } from "react";

type PageHeaderProps = {
  crumb?: string;
  title: string;
  actions?: ReactNode;
};

export function PageHeader({ crumb, title, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        {crumb && (
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
            {crumb}
          </div>
        )}
        <h1 className="font-[family-name:var(--font-display)] text-[36px] italic leading-none tracking-[-0.03em]">
          {title}
        </h1>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

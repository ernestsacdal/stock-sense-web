import type { ReactNode } from "react";

type PageHeaderProps = {
  crumb?: string;
  title: string;
  actions?: ReactNode;
};

export function PageHeader({ crumb, title, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="min-w-0">
        {crumb && (
          <div className="mb-3 break-words font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--text-subtle)]">
            {crumb}
          </div>
        )}
        <h1 className="font-[family-name:var(--font-display)] text-[28px] italic leading-tight tracking-[-0.03em] sm:text-[36px] sm:leading-none">
          {title}
        </h1>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">{actions}</div>
      )}
    </div>
  );
}

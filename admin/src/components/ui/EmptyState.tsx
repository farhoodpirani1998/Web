/**
 * Empty state.
 *
 * Sprint 1.6 scope: reusable placeholder UI for sections/pages with no
 * content yet — an optional icon slot, title, description, and an
 * optional action slot. No business-specific copy lives here; callers
 * supply their own text.
 */
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function EmptyState({ icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      {icon ? (
        <div className="mb-2 flex h-10 w-10 items-center justify-center text-slate-400">
          {icon}
        </div>
      ) : null}

      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>

      {description ? (
        <p className="max-w-sm text-sm text-slate-600">{description}</p>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

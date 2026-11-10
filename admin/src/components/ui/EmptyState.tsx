/**
 * Empty state.
 *
 * Reusable UI for sections/pages with no content, with optional icon,
 * description, and action slots. Callers supply the copy.
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
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          {icon}
        </div>
      ) : null}

      <h3 className="font-heading text-sm font-bold text-foreground">{title}</h3>

      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

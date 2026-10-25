/**
 * Section.
 *
 * Sprint 1.6 scope: reusable content-section wrapper for admin pages —
 * consistent card-style spacing/border, with an optional title and
 * description above the children. Used to group related content within
 * a page (see `PageContainer`/`PageHeader` for the page-level wrapper).
 */
import type { ReactNode } from "react";

interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-card sm:p-6">
      {title || description ? (
        <div>
          {title ? (
            <h2 className="font-heading text-base font-bold text-foreground">{title}</h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}

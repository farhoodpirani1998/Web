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
    <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
      {title || description ? (
        <div>
          {title ? (
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          ) : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}

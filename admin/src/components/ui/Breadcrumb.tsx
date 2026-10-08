/**
 * Breadcrumb.
 *
 * Sprint 1.6 scope: foundation only — renders a static list of labels
 * with a separator, last item styled as "current page". Items accept
 * an optional `href` for forward-compatibility, but no routing/link
 * behavior is wired up yet; that is planned for a later sprint once
 * nested admin routes exist to justify it.
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              <span className={isLast ? "font-medium text-slate-900" : undefined}>
                {item.label}
              </span>
              {isLast ? null : <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

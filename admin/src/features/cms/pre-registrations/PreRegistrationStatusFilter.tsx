import type { CmsPreRegistrationStatus } from "./types";

/**
 * All/New/Contacted/Archived filter for the Pre-Registrations list.
 * `undefined` means "All" — that's also exactly what
 * `fetchPreRegistrationList`/`usePreRegistrations` expect for "no
 * status filter" (omitting the query param entirely, per
 * `PreRegistrationsController.findAll`), same convention as
 * `features/cms/faq/FaqStatusFilter.tsx`.
 *
 * No search box alongside this: `GET /admin/pre-registrations` has no
 * search param and this module's constraints say not to invent one
 * client-side.
 */
export interface PreRegistrationStatusFilterProps {
  value: CmsPreRegistrationStatus | undefined;
  onChange: (value: CmsPreRegistrationStatus | undefined) => void;
}

const OPTIONS: { label: string; value: CmsPreRegistrationStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Archived", value: "archived" },
];

export function PreRegistrationStatusFilter({
  value,
  onChange,
}: PreRegistrationStatusFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter pre-registrations by status"
      className="inline-flex w-fit rounded-md border border-slate-200 bg-slate-50 p-0.5"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.label}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`rounded px-3 py-1.5 text-sm font-medium transition ${
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

import type { CmsMediaStatus } from "./types";

/**
 * All/Active/Archived filter for the media grid. `undefined` means
 * "All" — that's also exactly what `fetchMediaList`/`useMediaList`
 * expect for "no status filter" (omitting the query param entirely, per
 * `MediaController.findAll`), so this component's value type doubles as
 * the hook's param type with no translation step in `MediaPage`.
 *
 * No search box alongside this: `GET /admin/media` has no search
 * param (see the Sprint 3.3 audit, §3) and this sprint's constraints
 * say not to invent one client-side.
 */
export interface MediaStatusFilterProps {
  value: CmsMediaStatus | undefined;
  onChange: (value: CmsMediaStatus | undefined) => void;
}

const OPTIONS: { label: string; value: CmsMediaStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
];

export function MediaStatusFilter({ value, onChange }: MediaStatusFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter media by status"
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

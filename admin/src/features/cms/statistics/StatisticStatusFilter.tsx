import type { CmsStatisticStatus } from "./types";

/**
 * All/Draft/Published/Archived filter for the Statistics list.
 * `undefined` means "All" — that's also exactly what
 * `fetchStatisticList`/`useStatistics` expect for "no status filter"
 * (omitting the query param entirely, per `StatisticsController.findAll`),
 * so this component's value type doubles as the hook's param type with
 * no translation step in `StatisticsPage`.
 *
 * "All" is also the only mode `StatisticList` allows drag/move
 * reordering in — see that file's comment for why.
 *
 * No search box alongside this: `GET /admin/statistics` has no search
 * param and this module's constraints say not to invent one
 * client-side.
 */
export interface StatisticStatusFilterProps {
  value: CmsStatisticStatus | undefined;
  onChange: (value: CmsStatisticStatus | undefined) => void;
}

const OPTIONS: { label: string; value: CmsStatisticStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export function StatisticStatusFilter({ value, onChange }: StatisticStatusFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter Statistics by status"
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

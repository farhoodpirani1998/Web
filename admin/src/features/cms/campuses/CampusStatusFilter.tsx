import type { CmsCampusStatus } from "./types";

/**
 * All/Draft/Published/Archived filter for the campus list.
 * `undefined` means "All" — that's also exactly what
 * `fetchCampusesList`/`useCampuses` expect for "no status filter"
 * (omitting the query param entirely, per `CampusesController.findAll`),
 * so this component's value type doubles as the hook's param type with
 * no translation step in `CampusesPage`, same convention as
 * `features/cms/teachers/TeacherStatusFilter.tsx`.
 *
 * "All" is also the only mode `CampusList` allows drag/move
 * reordering in — see that file's comment for why.
 *
 * No category filter alongside this (unlike Events): `GET
 * /admin/campuses` only reads an optional `status` query param
 * (`CampusesController.findAll`) — nothing here should invent a
 * filter the backend doesn't read.
 */
export interface CampusStatusFilterProps {
  value: CmsCampusStatus | undefined;
  onChange: (value: CmsCampusStatus | undefined) => void;
}

const OPTIONS: { label: string; value: CmsCampusStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export function CampusStatusFilter({ value, onChange }: CampusStatusFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter campuses by status"
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

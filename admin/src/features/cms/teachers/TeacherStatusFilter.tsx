import type { CmsTeacherStatus } from "./types";

/**
 * All/Draft/Published/Archived filter for the teacher list.
 * `undefined` means "همه" — that's also exactly what
 * `fetchTeachersList`/`useTeachers` expect for "no status filter"
 * (omitting the query param entirely, per `TeachersController.findAll`),
 * so this component's value type doubles as the hook's param type with
 * no translation step in `TeachersPage`, same convention as
 * `features/cms/faq/FaqStatusFilter.tsx`.
 *
 * "همه" is also the only mode `TeacherList` allows drag/move
 * reordering in — see that file's comment for why.
 *
 * No category filter alongside this (unlike Events): `GET
 * /admin/teachers` only reads an optional `status` query param
 * (`TeachersController.findAll`) — nothing here should invent a
 * filter the backend doesn't read.
 */
export interface TeacherStatusFilterProps {
  value: CmsTeacherStatus | undefined;
  onChange: (value: CmsTeacherStatus | undefined) => void;
}

const OPTIONS: { label: string; value: CmsTeacherStatus | undefined }[] = [
  { label: "همه", value: undefined },
  { label: "پیش‌نویس", value: "draft" },
  { label: "منتشرشده", value: "published" },
  { label: "بایگانی", value: "archived" },
];

export function TeacherStatusFilter({ value, onChange }: TeacherStatusFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="فیلتر اساتید بر اساس وضعیت"
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

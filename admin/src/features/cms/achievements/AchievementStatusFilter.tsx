import type { CmsAchievementStatus } from "./types";

/**
 * All/Draft/Published/Archived filter for the achievements list.
 * `undefined` means "همه" — also what `fetchAchievementList` expects for
 * "no status filter" (omitting the query param), so this value type
 * doubles as the hook's param type.
 */
export interface AchievementStatusFilterProps {
  value: CmsAchievementStatus | undefined;
  onChange: (value: CmsAchievementStatus | undefined) => void;
}

const OPTIONS: { label: string; value: CmsAchievementStatus | undefined }[] = [
  { label: "همه", value: undefined },
  { label: "پیش‌نویس", value: "draft" },
  { label: "منتشرشده", value: "published" },
  { label: "بایگانی", value: "archived" },
];

export function AchievementStatusFilter({ value, onChange }: AchievementStatusFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="فیلتر افتخارات بر اساس وضعیت"
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

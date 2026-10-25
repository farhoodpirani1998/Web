import type { CmsFeatureStatus } from "./types";

/**
 * All/Draft/Published/Archived filter for the Features list.
 * `undefined` means "همه" — that's also exactly what
 * `fetchFeatureList`/`useFeatures` expect for "no status filter"
 * (omitting the query param entirely, per `FeaturesController.findAll`),
 * so this component's value type doubles as the hook's param type with
 * no translation step in `FeaturesPage`.
 *
 * "همه" is also the only mode `FeatureList` allows drag/move reordering
 * in — see that file's comment for why.
 *
 * No search box alongside this: `GET /admin/features` has no search
 * param and this module's constraints say not to invent one
 * client-side.
 */
export interface FeatureStatusFilterProps {
  value: CmsFeatureStatus | undefined;
  onChange: (value: CmsFeatureStatus | undefined) => void;
}

const OPTIONS: { label: string; value: CmsFeatureStatus | undefined }[] = [
  { label: "همه", value: undefined },
  { label: "پیش‌نویس", value: "draft" },
  { label: "منتشرشده", value: "published" },
  { label: "بایگانی", value: "archived" },
];

export function FeatureStatusFilter({ value, onChange }: FeatureStatusFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="فیلتر ویژگی‌ها بر اساس وضعیت"
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

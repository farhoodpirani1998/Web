import type { CmsFaqStatus } from "./types";

/**
 * All/Draft/Published/Archived filter for the FAQ list. `undefined`
 * means "All" — that's also exactly what `fetchFaqList`/`useFaqs`
 * expect for "no status filter" (omitting the query param entirely, per
 * `FaqController.findAll`), so this component's value type doubles as
 * the hook's param type with no translation step in `FaqPage`.
 *
 * "All" is also the only mode `FaqList` allows drag/move reordering in
 * — see that file's comment for why.
 *
 * No search box alongside this: `GET /admin/faqs` has no search param
 * and this module's constraints say not to invent one client-side.
 */
export interface FaqStatusFilterProps {
  value: CmsFaqStatus | undefined;
  onChange: (value: CmsFaqStatus | undefined) => void;
}

const OPTIONS: { label: string; value: CmsFaqStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export function FaqStatusFilter({ value, onChange }: FaqStatusFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter FAQs by status"
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

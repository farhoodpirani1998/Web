import type { CmsGalleryStatus } from "./types";

/**
 * All/Draft/Published/Archived filter for the gallery list. `undefined`
 * means "All" — that's also exactly what `fetchGalleryList`/`useGallery`
 * expect for "no status filter" (omitting the query param entirely, per
 * `GalleryController.findAll`), so this component's value type doubles
 * as the hook's param type with no translation step in `GalleryPage`.
 *
 * "All" is also the only mode `GalleryGrid` allows drag/move reordering
 * in — see that file's comment for why.
 *
 * No search box alongside this: `GET /admin/gallery` has no search
 * param and this module's constraints say not to invent one
 * client-side.
 */
export interface GalleryStatusFilterProps {
  value: CmsGalleryStatus | undefined;
  onChange: (value: CmsGalleryStatus | undefined) => void;
}

const OPTIONS: { label: string; value: CmsGalleryStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export function GalleryStatusFilter({ value, onChange }: GalleryStatusFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter gallery by status"
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

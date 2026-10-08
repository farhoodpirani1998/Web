import type { CmsPageStatus } from "./types";
import { usePageOptions } from "./hooks/usePages";

/**
 * All/Draft/Published/Archived filter for the pages list, plus a
 * "Parent" filter. `undefined` means "All" for status — same
 * convention as `features/cms/news/NewsStatusFilter.tsx`.
 *
 * The parent filter exists here (and not in FAQ/Gallery/Hero/News'
 * filters) because `PagesController.findAll` is the only admin list
 * endpoint that reads a `parentId` query param — this isn't inventing
 * a client-side filter, it's exposing a real one. It's a `<select>`
 * (not free text, unlike News' `category`) sourced from
 * `usePageOptions` — Pages' `parentId` is a real page reference (a
 * UUID), not a free-text field, so a dropdown of actual page titles is
 * the only usable UI for it; there's no "list distinct parents"
 * endpoint, just the same `GET /admin/pages` `usePageOptions` already
 * calls with no filters.
 *
 * No search box: `GET /admin/pages` has no search param.
 */
export interface PageStatusFilterProps {
  status: CmsPageStatus | undefined;
  onStatusChange: (value: CmsPageStatus | undefined) => void;
  parentId: string | undefined;
  onParentIdChange: (value: string | undefined) => void;
}

const STATUS_OPTIONS: { label: string; value: CmsPageStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export function PageStatusFilter({
  status,
  onStatusChange,
  parentId,
  onParentIdChange,
}: PageStatusFilterProps) {
  const { options, isLoading } = usePageOptions();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="tablist"
        aria-label="Filter pages by status"
        className="inline-flex w-fit rounded-md border border-slate-200 bg-slate-50 p-0.5"
      >
        {STATUS_OPTIONS.map((option) => {
          const isActive = option.value === status;
          return (
            <button
              key={option.label}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onStatusChange(option.value)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="page-parent-filter" className="text-sm text-slate-600">
          Parent
        </label>
        <select
          id="page-parent-filter"
          value={parentId ?? ""}
          onChange={(event) => onParentIdChange(event.target.value || undefined)}
          disabled={isLoading}
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        >
          <option value="">All pages</option>
          {options.map((page) => (
            <option key={page.id} value={page.id}>
              {page.title.fa}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

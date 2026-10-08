import { PermissionGate } from "@/components/ui/PermissionGate";

import type { CmsPageStatus } from "./types";

/**
 * Designates (or clears) this page as the site's homepage, via the
 * dedicated `PATCH /admin/pages/:id/homepage` action
 * (`setPageHomepage` in `./api.ts`) — a Pages-only control, News has
 * no equivalent. Gated behind `website.content:publish`, same
 * permission as status/schedule changes (`PagesService.setHomepage`'s
 * own comment: "a site-structure/publishing decision").
 *
 * The backend only accepts `isHomepage: true` for an already-`published`
 * page (`PagesService.setHomepage`) — this control disables the
 * "Set as homepage" button rather than hiding it when the page isn't
 * published, so the constraint is visible rather than mysterious; the
 * backend remains the actual source of truth (a race with another
 * admin's concurrent status change still surfaces as a normal
 * `ApiError` from the request itself).
 */
export interface PageHomepageControlProps {
  isHomepage: boolean;
  status: CmsPageStatus;
  isUpdating: boolean;
  onSetHomepage: (isHomepage: boolean) => void;
}

export function PageHomepageControl({
  isHomepage,
  status,
  isUpdating,
  onSetHomepage,
}: PageHomepageControlProps) {
  if (isHomepage) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700">
          Homepage
        </span>
        <PermissionGate permission="website.content:publish">
          <button
            type="button"
            onClick={() => onSetHomepage(false)}
            disabled={isUpdating}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? "…" : "Unset"}
          </button>
        </PermissionGate>
      </div>
    );
  }

  return (
    <PermissionGate permission="website.content:publish">
      <button
        type="button"
        onClick={() => onSetHomepage(true)}
        disabled={isUpdating || status !== "published"}
        title={status !== "published" ? "Only a published page can be set as the homepage" : undefined}
        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUpdating ? "…" : "Set as homepage"}
      </button>
    </PermissionGate>
  );
}

import { useMediaById } from "@/features/cms/media";
import { PermissionGate } from "@/components/ui/PermissionGate";

import { PageHomepageControl } from "./PageHomepageControl";
import { PageScheduleControl } from "./PageScheduleControl";
import { PageStatusControl } from "./PageStatusControl";
import type { CmsPage, CmsPageStatus } from "./types";

/**
 * One page row in `PageList`'s table. No drag handle/move buttons —
 * same reasoning as News' `NewsRow`: Pages has no `position`/`reorder`
 * endpoint.
 *
 * `parentTitle` is passed in (resolved by `PageList` from the already-
 * loaded page list, not fetched per-row) — see `PageList`'s own
 * comment for why.
 *
 * Resolves its own thumbnail via `media/useMediaById`, same as
 * `NewsRow`.
 *
 * The selection checkbox (`selected`/`onToggleSelect`) is gated behind
 * `website.content:write`, same as Edit/Delete — see `NewsRow`'s
 * comment for the reasoning.
 */
export interface PageRowProps {
  page: CmsPage;
  parentTitle: string | undefined;
  isUpdatingStatus: boolean;
  isUpdatingSchedule: boolean;
  isUpdatingHomepage: boolean;
  selected: boolean;
  onToggleSelect: (page: CmsPage) => void;
  onEdit: (page: CmsPage) => void;
  onDeleteRequest: (page: CmsPage) => void;
  onChangeStatus: (page: CmsPage, status: CmsPageStatus) => void;
  onSchedule: (page: CmsPage, publishAt: string | null) => void;
  onSetHomepage: (page: CmsPage, isHomepage: boolean) => void;
  onViewHistory: (page: CmsPage) => void;
}

export function PageRow({
  page,
  parentTitle,
  isUpdatingStatus,
  isUpdatingSchedule,
  isUpdatingHomepage,
  selected,
  onToggleSelect,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onSchedule,
  onSetHomepage,
  onViewHistory,
}: PageRowProps) {
  const { media, isLoading } = useMediaById(page.featuredImageMediaId);

  return (
    <tr className={selected ? "bg-slate-50" : undefined}>
      <td className="w-10 px-3 py-3 align-top">
        <PermissionGate permission="website.content:write">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(page)}
            aria-label={`Select ${page.title.fa}`}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
          />
        </PermissionGate>
      </td>
      <td className="w-16 px-3 py-3 align-top">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          {page.featuredImageMediaId && isLoading ? (
            <span className="text-xs text-slate-400">…</span>
          ) : media ? (
            <img
              src={media.thumbnailUrl ?? media.url}
              alt={media.altText}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </div>
      </td>

      <td className="px-3 py-3 align-top">
        <p className="line-clamp-2 font-medium text-slate-900" dir="rtl">
          {page.title.fa}
        </p>
        {page.title.en ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{page.title.en}</p>
        ) : null}
        <p className="mt-0.5 text-xs text-slate-400">/{page.slug}</p>
        {parentTitle ? (
          <p className="mt-0.5 text-xs text-slate-400" dir="rtl">
            Under: {parentTitle}
          </p>
        ) : null}
      </td>

      <td className="px-3 py-3 align-top text-xs text-slate-600">
        <span className="rounded bg-slate-100 px-1.5 py-0.5">{page.template}</span>
        {!page.showInMenu ? (
          <span className="mt-1 block text-slate-400">Hidden from menu</span>
        ) : null}
      </td>

      <td className="px-3 py-3 align-top">
        <PageStatusControl
          status={page.status}
          isUpdating={isUpdatingStatus}
          onChangeStatus={(status) => onChangeStatus(page, status)}
        />
      </td>

      <td className="px-3 py-3 align-top">
        <PageScheduleControl
          publishAt={page.publishAt}
          isUpdating={isUpdatingSchedule}
          onSchedule={(publishAt) => onSchedule(page, publishAt)}
        />
      </td>

      <td className="px-3 py-3 align-top">
        <PageHomepageControl
          isHomepage={page.isHomepage}
          status={page.status}
          isUpdating={isUpdatingHomepage}
          onSetHomepage={(isHomepage) => onSetHomepage(page, isHomepage)}
        />
      </td>

      <td className="px-3 py-3 text-right align-top">
        <div className="flex flex-wrap justify-end gap-2">
          <PermissionGate permission="website.revisions:view">
            <button
              type="button"
              onClick={() => onViewHistory(page)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              History
            </button>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onEdit(page)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onDeleteRequest(page)}
              className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </PermissionGate>
        </div>
      </td>
    </tr>
  );
}

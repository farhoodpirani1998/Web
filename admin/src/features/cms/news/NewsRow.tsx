import { useMediaById } from "@/features/cms/media";
import { PermissionGate } from "@/components/ui/PermissionGate";

import { NewsScheduleControl } from "./NewsScheduleControl";
import { NewsStatusControl } from "./NewsStatusControl";
import type { CmsNewsArticle, CmsNewsStatus } from "./types";

/**
 * One news article row in `NewsList`'s table. No drag handle/move
 * buttons — unlike `FaqRow`/`HeroSlideRow`, News has no `position`/
 * `reorder` endpoint (see `types.ts`'s top comment), so the list is
 * always shown in the server's reverse-chronological order.
 *
 * Resolves its own thumbnail via `media/useMediaById` — the article
 * only carries `featuredImageMediaId`, never an embedded media object,
 * same as `HeroSlideRow`.
 *
 * The selection checkbox (`selected`/`onToggleSelect`) is gated behind
 * `website.content:write`, same as Edit/Delete — selection only exists
 * to feed a future bulk write action, so there's no point offering it
 * to a read-only viewer.
 */
export interface NewsRowProps {
  article: CmsNewsArticle;
  isUpdatingStatus: boolean;
  isUpdatingSchedule: boolean;
  selected: boolean;
  onToggleSelect: (article: CmsNewsArticle) => void;
  onEdit: (article: CmsNewsArticle) => void;
  onDeleteRequest: (article: CmsNewsArticle) => void;
  onChangeStatus: (article: CmsNewsArticle, status: CmsNewsStatus) => void;
  onSchedule: (article: CmsNewsArticle, publishAt: string | null) => void;
  onViewHistory: (article: CmsNewsArticle) => void;
}

export function NewsRow({
  article,
  isUpdatingStatus,
  isUpdatingSchedule,
  selected,
  onToggleSelect,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onSchedule,
  onViewHistory,
}: NewsRowProps) {
  const { media, isLoading } = useMediaById(article.featuredImageMediaId);

  return (
    <tr className={selected ? "bg-slate-50" : undefined}>
      <td className="w-10 px-3 py-3 align-top">
        <PermissionGate permission="website.content:write">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(article)}
            aria-label={`Select ${article.title.fa}`}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
          />
        </PermissionGate>
      </td>
      <td className="w-16 px-3 py-3 align-top">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          {article.featuredImageMediaId && isLoading ? (
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
          {article.title.fa}
        </p>
        {article.title.en ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{article.title.en}</p>
        ) : null}
        <p className="mt-0.5 text-xs text-slate-400">/{article.slug}</p>
      </td>

      <td className="px-3 py-3 align-top text-slate-600">
        {article.category ? (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{article.category}</span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      <td className="px-3 py-3 align-top">
        <NewsStatusControl
          status={article.status}
          isUpdating={isUpdatingStatus}
          onChangeStatus={(status) => onChangeStatus(article, status)}
        />
      </td>

      <td className="px-3 py-3 align-top">
        <NewsScheduleControl
          publishAt={article.publishAt}
          isUpdating={isUpdatingSchedule}
          onSchedule={(publishAt) => onSchedule(article, publishAt)}
        />
      </td>

      <td className="px-3 py-3 text-right align-top">
        <div className="flex flex-wrap justify-end gap-2">
          <PermissionGate permission="website.revisions:view">
            <button
              type="button"
              onClick={() => onViewHistory(article)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              History
            </button>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onEdit(article)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onDeleteRequest(article)}
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

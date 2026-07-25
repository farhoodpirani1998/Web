import { PermissionGate } from "@/components/ui/PermissionGate";

import { formatFileSize } from "./formatFileSize";
import type { CmsMedia } from "./types";

/**
 * One media asset. Preview uses `media.url` only, per this sprint's
 * constraint — `thumbnailUrl`/`cardUrl` are never populated by
 * `MediaService.upload` today (they exist on the entity but nothing
 * sets them), so treating them as real would show a broken image for
 * every asset. `MediaPicker` (Sprint 3.4) already falls back to `url`
 * for the same reason; this card just uses it directly.
 *
 * Archive/delete are individually gated with `PermissionGate` (in
 * addition to `MediaPage` gating the whole page) so this card is safe
 * to reuse anywhere later without silently losing that protection.
 * Archive only appears for `active` media — there is no "unarchive"
 * endpoint (`MediaController` only has `archive` and `remove`), so
 * archived media can only be deleted, never restored, from this UI.
 *
 * `media.usageCount` (from `useMediaList`/`GET /admin/media`) drives a
 * "Used in N place(s)" badge; tapping it opens `MediaUsageDialog` via
 * `onViewUsage`, same as `onDeleteRequest` opens `MediaDeleteConfirm` —
 * `MediaPage` owns which dialog (if any) is open. Not shown at all when
 * `usageCount` is `0`/absent: an unused asset has nothing to show, and
 * this is also the state a 409 on delete ("still used elsewhere") never
 * happens for.
 *
 * Selection (`selected`/`onToggleSelect`) is owned by `MediaPage` via
 * `useRowSelection`, same "dumb display, state lives in the page" split
 * `NewsRow`/`PageRow`/`TestimonialRow` already use — this card only
 * renders the checkbox and wires its event. Gated behind
 * `website.media:manage`, same as Archive/Delete: selection only exists
 * to feed a future bulk action (Part 2B), so there's no point offering
 * it to a viewer who couldn't act on it anyway. Media Library UX v2
 * Part 2A scope — selection UI only, no bulk action wired up yet.
 */
export interface MediaCardProps {
  media: CmsMedia;
  isArchiving: boolean;
  selected: boolean;
  onToggleSelect: (media: CmsMedia) => void;
  onArchive: (media: CmsMedia) => void;
  onDeleteRequest: (media: CmsMedia) => void;
  onViewUsage: (media: CmsMedia) => void;
}

export function MediaCard({
  media,
  isArchiving,
  selected,
  onToggleSelect,
  onArchive,
  onDeleteRequest,
  onViewUsage,
}: MediaCardProps) {
  const isActive = media.status === "active";

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border bg-white ${
        selected ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200"
      }`}
    >
      <div className="relative">
        <PermissionGate permission="website.media:manage">
          <label className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-white/90 shadow-sm">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(media)}
              aria-label={`Select ${media.altText}`}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
          </label>
        </PermissionGate>

        <img
          src={media.url}
          alt={media.altText}
          className="aspect-square w-full bg-slate-100 object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-sm text-slate-900" title={media.altText}>
          {media.altText}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="rounded bg-slate-100 px-1.5 py-0.5">{media.mimeType}</span>
          <span>{formatFileSize(media.sizeBytes)}</span>
          <span
            className={`rounded px-1.5 py-0.5 font-medium ${
              isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            {isActive ? "Active" : "Archived"}
          </span>
        </div>

        {media.usageCount ? (
          <button
            type="button"
            onClick={() => onViewUsage(media)}
            className="w-fit rounded px-1.5 py-0.5 text-xs font-medium text-indigo-700 underline-offset-2 hover:bg-indigo-50 hover:underline"
          >
            Used in {media.usageCount} place{media.usageCount === 1 ? "" : "s"}
          </button>
        ) : null}

        <div className="mt-auto flex gap-2 pt-1">
          {isActive ? (
            <PermissionGate permission="website.media:manage">
              <button
                type="button"
                disabled={isArchiving}
                onClick={() => onArchive(media)}
                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isArchiving ? "Archiving…" : "Archive"}
              </button>
            </PermissionGate>
          ) : null}

          <PermissionGate permission="website.media:manage">
            <button
              type="button"
              onClick={() => onDeleteRequest(media)}
              className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}

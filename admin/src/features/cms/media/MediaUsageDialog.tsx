import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "@/lib/apiError";

import { fetchMediaUsage } from "./api";
import { MEDIA_USAGE_ENTITY_TYPES } from "./mediaUsageEntityTypes";
import type { CmsMedia, CmsMediaUsage } from "./types";

/**
 * "Where is this used?" modal for a media asset — same overlay/modal
 * shell as `MediaDeleteConfirm`, opened from `MediaCard`'s usage badge
 * (see `MediaPage`, which owns which media's usage is open).
 *
 * Fetches on open rather than reusing `useMediaList`'s `usageCount`:
 * the count already on the card is enough to decide whether opening
 * this is worthwhile, but the actual rows (`GET /admin/media/:id/usage`)
 * are only needed once the admin asks to see them.
 */
export interface MediaUsageDialogProps {
  media: CmsMedia;
  onClose: () => void;
}

export function MediaUsageDialog({ media, onClose }: MediaUsageDialogProps) {
  const [usage, setUsage] = useState<CmsMediaUsage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchMediaUsage(media.id)
      .then((rows) => {
        if (!cancelled) setUsage(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [media.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Where this is used</h2>
        <p className="mt-1 text-sm text-slate-600" title={media.altText}>
          “{media.altText}”
        </p>

        <div className="mt-4">
          {isLoading ? (
            <p className="py-4 text-center text-sm text-slate-500">Loading…</p>
          ) : error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : usage && usage.length > 0 ? (
            <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
              {usage.map((row) => {
                const known = MEDIA_USAGE_ENTITY_TYPES[row.entityType];
                return (
                  <li
                    key={row.id}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-700">{known?.label ?? row.entityType}</span>
                    {known ? (
                      <Link
                        to={known.route}
                        onClick={onClose}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        View
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-slate-500">
              This media isn't currently referenced anywhere.
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

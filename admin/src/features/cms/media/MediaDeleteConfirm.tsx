import { useState } from "react";

import { ApiError } from "@/lib/apiError";

import { deleteMedia } from "./api";
import { evictCachedMedia } from "./mediaCache";
import type { CmsMedia } from "./types";

/**
 * Confirms and performs `DELETE /admin/media/:id`. Purge is rejected
 * server-side with a 409 (`ConflictException`) if the asset is still
 * referenced by any content entity's `mediaId` (see `MediaService.purge`)
 * — that's surfaced here as its own state (`isConflict`) rather than
 * folded into the generic error message, since the right next step for
 * the admin is different: archive instead of delete, not "try again".
 */
export interface MediaDeleteConfirmProps {
  media: CmsMedia;
  onCancel: () => void;
  onDeleted: (id: string) => void;
}

export function MediaDeleteConfirm({ media, onCancel, onDeleted }: MediaDeleteConfirmProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);

  async function handleConfirm() {
    setIsDeleting(true);
    setError(null);
    setIsConflict(false);

    try {
      await deleteMedia(media.id);
      evictCachedMedia(media.id);
      onDeleted(media.id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setIsConflict(true);
      } else {
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Delete media</h2>
        <p className="mt-1 text-sm text-slate-600">
          This permanently deletes “{media.altText}”. This can't be undone.
        </p>

        {isConflict ? (
          <p role="alert" className="mt-3 text-sm text-amber-700">
            This media is still used elsewhere and can't be deleted. Archive it
            instead, or remove it from whatever's referencing it first.
          </p>
        ) : error ? (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConflict ? "Close" : "Cancel"}
          </button>
          {isConflict ? null : (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

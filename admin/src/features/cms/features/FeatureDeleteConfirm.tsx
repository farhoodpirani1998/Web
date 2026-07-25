import { useState } from "react";

import { ApiError } from "@/lib/apiError";

import { deleteFeature } from "./api";
import type { CmsFeature } from "./types";

/**
 * Confirms and performs `DELETE /admin/features/:id`. Unlike
 * `features/cms/media/MediaDeleteConfirm.tsx`, there's no 409/"still in
 * use" case to special-case here — `FeaturesService.remove` is a plain
 * unconditional delete (no usage tracking for Features), same as
 * `features/cms/faq/FaqDeleteConfirm.tsx`, so any failure just falls
 * back to the generic message.
 */
export interface FeatureDeleteConfirmProps {
  feature: CmsFeature;
  onCancel: () => void;
  onDeleted: (id: string) => void;
}

export function FeatureDeleteConfirm({ feature, onCancel, onDeleted }: FeatureDeleteConfirmProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteFeature(feature.id);
      onDeleted(feature.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Delete Feature</h2>
        <p className="mt-1 text-sm text-slate-600" dir="rtl">
          This permanently deletes “{feature.title.fa}”. This can't be undone.
        </p>

        {error ? (
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
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

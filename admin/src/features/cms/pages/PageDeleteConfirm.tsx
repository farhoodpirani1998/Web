import { useState } from "react";

import { ApiError } from "@/lib/apiError";

import { deletePage } from "./api";
import type { CmsPage } from "./types";

/**
 * Confirms and performs `DELETE /admin/pages/:id`. Unlike News'
 * `NewsDeleteConfirm`, this delete IS conditionally blocked server-side
 * — `PagesService.remove` rejects with a 409 `ConflictException` when
 * the page still has child pages ("move or delete them first"). This
 * component doesn't pre-check that client-side (no "does this page
 * have children" signal is available on `CmsPage` itself); it just
 * relays whatever `ApiError` the request produces, same as
 * `features/cms/media/MediaDeleteConfirm.tsx`'s own 409 handling.
 */
export interface PageDeleteConfirmProps {
  page: CmsPage;
  onCancel: () => void;
  onDeleted: (id: string) => void;
}

export function PageDeleteConfirm({ page, onCancel, onDeleted }: PageDeleteConfirmProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsDeleting(true);
    setError(null);

    try {
      await deletePage(page.id);
      onDeleted(page.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Delete page</h2>
        <p className="mt-1 text-sm text-slate-600" dir="rtl">
          This permanently deletes “{page.title.fa}”. This cannot be undone.
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

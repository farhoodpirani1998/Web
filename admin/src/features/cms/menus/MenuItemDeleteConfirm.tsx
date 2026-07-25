import { useState } from "react";

import { ApiError } from "@/lib/apiError";

import { deleteMenuItem } from "./api";
import type { CmsMenuItem } from "./types";

/**
 * Confirms and performs `DELETE /admin/menu-items/:id`. Unlike
 * `PortalLinkDeleteConfirm`, a failure here is a realistic, expected
 * case — `MenuItemsService.remove` rejects with a 409 when the item
 * still has children (move or delete them first) — so the surfaced
 * `ApiError` message (rather than always falling back to the generic
 * one) is what tells the admin what to do next.
 */
export interface MenuItemDeleteConfirmProps {
  item: CmsMenuItem;
  onCancel: () => void;
  onDeleted: (id: string) => void;
}

export function MenuItemDeleteConfirm({ item, onCancel, onDeleted }: MenuItemDeleteConfirmProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteMenuItem(item.id);
      onDeleted(item.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Delete menu item</h2>
        <p className="mt-1 text-sm text-slate-600" dir="rtl">
          This permanently deletes “{item.label.fa}”. This can't be undone.
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

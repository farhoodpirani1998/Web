import { useState } from "react";

import { ApiError } from "@/lib/apiError";

import { deleteMenu } from "./api";
import type { CmsMenu } from "./types";

/**
 * Confirms and performs `DELETE /admin/menus/:id`. Unlike
 * `PortalLinkDeleteConfirm`, the copy calls out that this also deletes
 * every item in the menu — `MenusService.remove` deletes `MenuItem`
 * rows for the menu in the same transaction, there is no "move the
 * items first" step like `StaticPage`'s parent/child guard.
 */
export interface MenuDeleteConfirmProps {
  menu: CmsMenu;
  onCancel: () => void;
  onDeleted: (id: string) => void;
}

export function MenuDeleteConfirm({ menu, onCancel, onDeleted }: MenuDeleteConfirmProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteMenu(menu.id);
      onDeleted(menu.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Delete menu</h2>
        <p className="mt-1 text-sm text-slate-600">
          This permanently deletes “{menu.name}” and every item in it. This can't be undone.
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

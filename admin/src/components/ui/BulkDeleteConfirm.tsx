/**
 * Bulk delete confirmation modal.
 *
 * Same layout/copy/button styling as the single-item delete dialogs
 * (`NewsDeleteConfirm`, `PageDeleteConfirm`, `TestimonialDeleteConfirm`)
 * — this is the same confirmation pattern, just parameterized over a
 * count instead of one named item.
 *
 * Unlike those dialogs, this one doesn't call a delete API itself:
 * a bulk delete is N separate `DELETE /:id` calls that can partially
 * fail, and reconciling that (which ids to drop from the list, which
 * to leave selected for a retry) is page-specific. So this component
 * stays "dumb" — it only renders the confirmation UI and defers the
 * actual deletion, and the loading/error state, to its caller via
 * `isDeleting`/`error`/`onConfirm`.
 */
export interface BulkDeleteConfirmProps {
  /** How many items are about to be deleted (kept live by the caller — see e.g. `NewsPage`'s bulk delete handler — so it drops as items succeed on retry). */
  count: number;
  /** Singular label for one item, e.g. "news article", "page", "testimonial". */
  itemLabel: string;
  isDeleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function BulkDeleteConfirm({
  count,
  itemLabel,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: BulkDeleteConfirmProps) {
  const plural = count === 1 ? itemLabel : `${itemLabel}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Delete {count} {plural}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          This permanently deletes the selected {plural}. This can&apos;t be undone.
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
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {isDeleting ? "Deleting…" : `Delete ${count} ${plural}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * "Discard unsaved changes?" confirm dialog — paired with
 * `hooks/useUnsavedChangesGuard.ts`. Same plain fixed-overlay modal
 * shape as the various `*DeleteConfirm.tsx` components (e.g.
 * `features/cms/testimonials/TestimonialDeleteConfirm.tsx`), so it
 * reads as the same kind of "are you sure" dialog admins already
 * know.
 *
 * Rendered at `z-[70]`, one layer above the media-picker dialogs
 * (`z-[60]`) that themselves sit above a form's own overlay (`z-50`)
 * — this can be triggered while a picker is open (e.g. clicking a
 * sidebar link mid-edit), so it needs to win over both.
 */
export interface UnsavedChangesDialogProps {
  /** "Discard changes" — proceeds with leaving/closing. */
  onDiscard: () => void;
  /** "Keep editing" — stays on the form. */
  onKeepEditing: () => void;
}

export function UnsavedChangesDialog({ onDiscard, onKeepEditing }: UnsavedChangesDialogProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Discard unsaved changes?</h2>
        <p className="mt-1 text-sm text-slate-600">
          You have unsaved changes. If you leave now, they'll be lost.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onKeepEditing}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            Discard changes
          </button>
        </div>
      </div>
    </div>
  );
}

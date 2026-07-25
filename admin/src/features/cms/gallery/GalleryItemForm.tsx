import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createGalleryItem, updateGalleryItem } from "./api";
import type { CmsGalleryItem } from "./types";

/**
 * Create/edit dialog for `POST /admin/gallery` and
 * `PATCH /admin/gallery/:id`. Same plain fixed-overlay modal shape as
 * `features/cms/faq/FaqForm.tsx` (see that file's comment on why
 * there's no shared `Dialog` primitive yet).
 *
 * `imageMediaId` is the only required field, matching
 * `CreateGalleryItemDto` — unlike Site Settings' `logoMediaId`/
 * `faviconMediaId`, there is no "Remove" action for it: per
 * `UpdateGalleryItemDto`'s own comment, the image can be swapped but
 * never cleared, since a gallery item without one isn't a meaningful
 * row (delete the item instead).
 *
 * `caption.fa` is optional here (unlike FAQ's `question.fa`, which is
 * required) — matches `TranslatableTextDto` only being validated at all
 * once `caption` itself is sent. `caption.en` is sent only when
 * non-empty, same reasoning as `FaqForm`'s `question.en`/`answer.en`:
 * `GalleryService.update` replaces the whole `caption` object rather
 * than merging keys.
 *
 * `category` is a flat (non-translatable) field, always sent as typed
 * — including empty, so clearing it in edit mode actually clears it.
 */
export interface GalleryItemFormProps {
  /** `null` for create mode; an existing gallery item for edit mode. */
  item: CmsGalleryItem | null;
  onCancel: () => void;
  onSaved: (item: CmsGalleryItem) => void;
}

export function GalleryItemForm({ item, onCancel, onSaved }: GalleryItemFormProps) {
  const isEdit = item !== null;

  const captionFaId = useId();
  const captionEnId = useId();
  const categoryId = useId();

  const [imageMediaId, setImageMediaId] = useState<string | null>(item?.imageMediaId ?? null);
  const [captionFa, setCaptionFa] = useState(item?.caption?.fa ?? "");
  const [captionEn, setCaptionEn] = useState(item?.caption?.en ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty } = useIsDirty({ imageMediaId, captionFa, captionEn, category });
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard(isDirty);

  const canSubmit = imageMediaId !== null && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || imageMediaId === null) return;

    setError(null);
    setIsSaving(true);

    const trimmedCaptionFa = captionFa.trim();
    const trimmedCaptionEn = captionEn.trim();

    const payload = {
      imageMediaId,
      ...(trimmedCaptionFa
        ? { caption: { fa: trimmedCaptionFa, ...(trimmedCaptionEn ? { en: trimmedCaptionEn } : {}) } }
        : {}),
      category: category.trim(),
    };

    try {
      const saved = isEdit ? await updateGalleryItem(item.id, payload) : await createGalleryItem(payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSaving(false);
    }
    // No `finally` resetting isSaving on success: the dialog is about
    // to be unmounted by the parent (`onSaved` closes it), same
    // reasoning as `FaqForm`'s submit handler.
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "Edit gallery item" : "New gallery item"}
        </h2>

        <form
          className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto"
          onSubmit={handleSubmit}
          noValidate
        >
          <GalleryImageField
            mediaId={imageMediaId}
            disabled={isSaving}
            onChoose={() => setIsPickerOpen(true)}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor={captionFaId} className="text-sm font-medium text-slate-900">
              Caption (Farsi) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={captionFaId}
              type="text"
              dir="rtl"
              value={captionFa}
              onChange={(event) => setCaptionFa(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={captionEnId} className="text-sm font-medium text-slate-900">
              Caption (English) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={captionEnId}
              type="text"
              value={captionEn}
              onChange={(event) => setCaptionEn(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={categoryId} className="text-sm font-medium text-slate-900">
              Category <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={categoryId}
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={isSaving}
              placeholder="e.g. campus, events, sports"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => guardedAction(onCancel)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create item"}
            </button>
          </div>
        </form>
      </div>

      {isPickerOpen ? (
        <GalleryMediaPickerDialog
          selectedId={imageMediaId}
          onSelect={(media) => {
            setImageMediaId(media.id);
            setIsPickerOpen(false);
          }}
          onCancel={() => setIsPickerOpen(false)}
        />
      ) : null}

      {isConfirmOpen ? (
        <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} />
      ) : null}
    </div>
  );
}

/**
 * Required-image field row — thumbnail preview plus a "Choose…"
 * button, no "Remove" (see this file's top comment on why). Same
 * layout as Site Settings' `MediaField`, but that component is private
 * to `SettingsForm.tsx`, so this is its own copy rather than an import
 * — nothing shared between the two modules yet justifies promoting it.
 */
function GalleryImageField({
  mediaId,
  disabled,
  onChoose,
}: {
  mediaId: string | null;
  disabled: boolean;
  onChoose: () => void;
}) {
  const { media, isLoading } = useMediaById(mediaId);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-900">Image</span>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          {mediaId && isLoading ? (
            <span className="text-xs text-slate-400">…</span>
          ) : media ? (
            <img
              src={media.thumbnailUrl ?? media.url}
              alt={media.altText}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-slate-400">None</span>
          )}
        </div>
        <button
          type="button"
          onClick={onChoose}
          disabled={disabled}
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mediaId ? "Change…" : "Choose…"}
        </button>
      </div>
    </div>
  );
}

/**
 * Fixed-overlay wrapper around `MediaPicker` — same plain modal shape
 * as `features/cms/site-settings/SettingsForm.tsx`'s
 * `MediaFieldPickerDialog` (see that file's comment on why there's no
 * shared `Dialog` primitive yet). `MediaPicker` itself is only the
 * permission-gated grid; this dialog shell is specific to this field,
 * not a generic reusable one.
 */
function GalleryMediaPickerDialog({
  selectedId,
  onSelect,
  onCancel,
}: {
  selectedId: string | null;
  onSelect: (media: { id: string }) => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Choose media</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Close
          </button>
        </div>

        <MediaPicker
          selectedId={selectedId}
          onSelect={onSelect}
          fallback={
            <p className="text-sm text-slate-600">
              Choosing media requires the Media permission. Contact an admin if you need access.
            </p>
          }
        />
      </div>
    </div>
  );
}

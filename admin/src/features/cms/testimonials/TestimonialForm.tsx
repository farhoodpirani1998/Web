import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createTestimonial, updateTestimonial } from "./api";
import type { CmsTestimonial } from "./types";

/**
 * Create/edit dialog for `POST /admin/testimonials` and `PATCH
 * /admin/testimonials/:id`. Same plain fixed-overlay modal shape as
 * `features/cms/faq/FaqForm.tsx` (see that file's comment on why
 * there's no shared `Dialog` primitive yet).
 *
 * `authorName` and `content.fa` are the only required fields,
 * matching `CreateTestimonialDto` (`fa` mandatory, `en` optional on the
 * nested `TranslatableTextDto`). `authorRole` is an optional
 * translatable field, sent only when its `fa` value is non-empty:
 * `TestimonialsService.update` replaces the whole `authorRole` object
 * rather than merging keys, same reasoning as FAQ's `question`/
 * `answer`.
 *
 * `authorName` is a plain (non-translatable) field, always sent as
 * typed — matching the entity's own doc comment (a proper noun).
 *
 * `rating` is an optional 1-5 integer, matching
 * `CreateTestimonialDto`'s `@Min(1) @Max(5)` — the empty string state
 * (no rating given) is distinct from any number and omitted from the
 * payload entirely, never sent as `0` or `null`.
 *
 * `avatarMediaId` is identical in shape and behavior to `TeacherForm`'s
 * `avatarMediaId` — optional, clearable via explicit `null` in edit
 * mode.
 *
 * No `position` field here — a new testimonial is appended to the end
 * of the current order server-side (`TestimonialsService.create`);
 * reordering existing testimonials is `TestimonialList`/
 * `TestimonialRow`'s drag-and-drop, not this form.
 */
export interface TestimonialFormProps {
  /** `null` for create mode; an existing testimonial for edit mode. */
  testimonial: CmsTestimonial | null;
  onCancel: () => void;
  onSaved: (testimonial: CmsTestimonial) => void;
}

export function TestimonialForm({ testimonial, onCancel, onSaved }: TestimonialFormProps) {
  const isEdit = testimonial !== null;

  const authorNameId = useId();
  const authorRoleFaId = useId();
  const authorRoleEnId = useId();
  const contentFaId = useId();
  const contentEnId = useId();
  const ratingId = useId();

  const [authorName, setAuthorName] = useState(testimonial?.authorName ?? "");
  const [authorRoleFa, setAuthorRoleFa] = useState(testimonial?.authorRole?.fa ?? "");
  const [authorRoleEn, setAuthorRoleEn] = useState(testimonial?.authorRole?.en ?? "");
  const [contentFa, setContentFa] = useState(testimonial?.content.fa ?? "");
  const [contentEn, setContentEn] = useState(testimonial?.content.en ?? "");
  const [rating, setRating] = useState(
    testimonial?.rating !== undefined ? String(testimonial.rating) : "",
  );
  const [avatarMediaId, setAvatarMediaId] = useState<string | null>(
    testimonial?.avatarMediaId ?? null,
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty } = useIsDirty({
    authorName,
    authorRoleFa,
    authorRoleEn,
    contentFa,
    contentEn,
    rating,
    avatarMediaId,
  });
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard(isDirty);

  const trimmedRating = rating.trim();
  const ratingIsValid =
    trimmedRating.length === 0 ||
    (/^[1-5]$/.test(trimmedRating) && Number.isInteger(Number(trimmedRating)));
  const canSubmit =
    authorName.trim().length > 0 && contentFa.trim().length > 0 && ratingIsValid && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedAuthorRoleFa = authorRoleFa.trim();
    const trimmedAuthorRoleEn = authorRoleEn.trim();
    const trimmedContentEn = contentEn.trim();

    const sharedFields = {
      authorName: authorName.trim(),
      ...(trimmedAuthorRoleFa
        ? {
            authorRole: {
              fa: trimmedAuthorRoleFa,
              ...(trimmedAuthorRoleEn ? { en: trimmedAuthorRoleEn } : {}),
            },
          }
        : {}),
      content: {
        fa: contentFa.trim(),
        ...(trimmedContentEn ? { en: trimmedContentEn } : {}),
      },
      ...(trimmedRating ? { rating: Number(trimmedRating) } : {}),
    };

    try {
      const saved = isEdit
        ? await updateTestimonial(testimonial.id, { ...sharedFields, avatarMediaId })
        : await createTestimonial({
            ...sharedFields,
            ...(avatarMediaId ? { avatarMediaId } : {}),
          });
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
          {isEdit ? "Edit testimonial" : "New testimonial"}
        </h2>

        <form
          className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor={authorNameId} className="text-sm font-medium text-slate-900">
              Author name
            </label>
            <input
              id={authorNameId}
              type="text"
              required
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={authorRoleFaId} className="text-sm font-medium text-slate-900">
                Role (Farsi) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={authorRoleFaId}
                type="text"
                dir="rtl"
                value={authorRoleFa}
                onChange={(event) => setAuthorRoleFa(event.target.value)}
                disabled={isSaving}
                placeholder="مثلاً «والد دانش‌آموز پایه چهارم»"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={authorRoleEnId} className="text-sm font-medium text-slate-900">
                Role (English) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={authorRoleEnId}
                type="text"
                value={authorRoleEn}
                onChange={(event) => setAuthorRoleEn(event.target.value)}
                disabled={isSaving}
                placeholder="e.g. Parent of a Grade 4 student"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={contentFaId} className="text-sm font-medium text-slate-900">
              Quote (Farsi)
            </label>
            <textarea
              id={contentFaId}
              dir="rtl"
              rows={4}
              required
              value={contentFa}
              onChange={(event) => setContentFa(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={contentEnId} className="text-sm font-medium text-slate-900">
              Quote (English) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <textarea
              id={contentEnId}
              rows={4}
              value={contentEn}
              onChange={(event) => setContentEn(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={ratingId} className="text-sm font-medium text-slate-900">
              Rating <span className="font-normal text-slate-400">— optional, 1–5</span>
            </label>
            <input
              id={ratingId}
              type="number"
              min={1}
              max={5}
              step={1}
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              disabled={isSaving}
              aria-invalid={!ratingIsValid}
              className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
            {!ratingIsValid ? (
              <p className="text-xs text-red-600">Rating must be a whole number from 1 to 5.</p>
            ) : null}
          </div>

          <TestimonialAvatarField
            mediaId={avatarMediaId}
            disabled={isSaving}
            onChoose={() => setIsPickerOpen(true)}
            onClear={() => setAvatarMediaId(null)}
          />

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
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create testimonial"}
            </button>
          </div>
        </form>
      </div>

      {isPickerOpen ? (
        <TestimonialMediaPickerDialog
          selectedId={avatarMediaId}
          onSelect={(media) => {
            setAvatarMediaId(media.id);
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
 * Optional, clearable avatar field row — thumbnail preview plus
 * "Choose…"/"Remove" buttons. Same layout as Teachers'
 * `TeacherAvatarField`, but this is its own copy, not an import, since
 * nothing shared between those modules and Testimonials yet justifies
 * promoting it (see `features/cms/components/README.md`).
 */
function TestimonialAvatarField({
  mediaId,
  disabled,
  onChoose,
  onClear,
}: {
  mediaId: string | null;
  disabled: boolean;
  onChoose: () => void;
  onClear: () => void;
}) {
  const { media, isLoading } = useMediaById(mediaId);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-900">
        Avatar <span className="font-normal text-slate-400">— optional</span>
      </span>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
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
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onChoose}
            disabled={disabled}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mediaId ? "Change…" : "Choose…"}
          </button>
          {mediaId ? (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Fixed-overlay wrapper around `MediaPicker` — same plain modal shape
 * as Teachers' `TeacherMediaPickerDialog`. `MediaPicker` itself is only
 * the permission-gated grid; this dialog shell is specific to this
 * field, not a generic reusable one.
 */
function TestimonialMediaPickerDialog({
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

import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createHeroSlide, updateHeroSlide } from "./api";
import type { CmsHeroSlide } from "./types";

/**
 * Create/edit dialog for `POST /admin/hero-slides` and
 * `PATCH /admin/hero-slides/:id`. Same plain fixed-overlay modal shape
 * as `features/cms/gallery/GalleryItemForm.tsx` (see that file's
 * comment on why there's no shared `Dialog` primitive yet).
 *
 * `heading.fa` is the only required field, matching
 * `CreateHeroSlideDto` (`fa` mandatory, `en` optional on the nested
 * `TranslatableTextDto` — `Locale.FA` is `DEFAULT_LOCALE` server-side).
 * `subheading`/`ctaLabel` are optional translatable fields, sent only
 * when their `fa` value is non-empty, same reasoning as
 * `GalleryItemForm`'s `caption`: `HeroService.update` replaces the
 * whole nested object rather than merging keys.
 *
 * `ctaUrl` is a flat (non-translatable) plain string, always sent as
 * typed — including empty, so clearing it in edit mode actually clears
 * it.
 *
 * `backgroundMediaId` is optional AND clearable (unlike Gallery's
 * required, swap-only `imageMediaId`): `UpdateHeroSlideDto`'s own
 * comment says an explicit `null` clears it, undefined leaves it
 * as-is — same convention as Site Settings' `logoMediaId`/
 * `faviconMediaId`, so this field gets a "Remove" button, Gallery's
 * doesn't.
 */
export interface HeroSlideFormProps {
  /** `null` for create mode; an existing hero slide for edit mode. */
  slide: CmsHeroSlide | null;
  onCancel: () => void;
  onSaved: (slide: CmsHeroSlide) => void;
}

export function HeroSlideForm({ slide, onCancel, onSaved }: HeroSlideFormProps) {
  const isEdit = slide !== null;

  const headingFaId = useId();
  const headingEnId = useId();
  const subheadingFaId = useId();
  const subheadingEnId = useId();
  const ctaLabelFaId = useId();
  const ctaLabelEnId = useId();
  const ctaUrlId = useId();

  const [headingFa, setHeadingFa] = useState(slide?.heading.fa ?? "");
  const [headingEn, setHeadingEn] = useState(slide?.heading.en ?? "");
  const [subheadingFa, setSubheadingFa] = useState(slide?.subheading?.fa ?? "");
  const [subheadingEn, setSubheadingEn] = useState(slide?.subheading?.en ?? "");
  const [ctaLabelFa, setCtaLabelFa] = useState(slide?.ctaLabel?.fa ?? "");
  const [ctaLabelEn, setCtaLabelEn] = useState(slide?.ctaLabel?.en ?? "");
  const [ctaUrl, setCtaUrl] = useState(slide?.ctaUrl ?? "");
  const [backgroundMediaId, setBackgroundMediaId] = useState<string | null>(
    slide?.backgroundMediaId ?? null,
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty } = useIsDirty({
    headingFa,
    headingEn,
    subheadingFa,
    subheadingEn,
    ctaLabelFa,
    ctaLabelEn,
    ctaUrl,
    backgroundMediaId,
  });
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard(isDirty);

  const canSubmit = headingFa.trim().length > 0 && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedHeadingEn = headingEn.trim();
    const trimmedSubheadingFa = subheadingFa.trim();
    const trimmedSubheadingEn = subheadingEn.trim();
    const trimmedCtaLabelFa = ctaLabelFa.trim();
    const trimmedCtaLabelEn = ctaLabelEn.trim();

    const sharedFields = {
      heading: {
        fa: headingFa.trim(),
        ...(trimmedHeadingEn ? { en: trimmedHeadingEn } : {}),
      },
      ...(trimmedSubheadingFa
        ? {
            subheading: {
              fa: trimmedSubheadingFa,
              ...(trimmedSubheadingEn ? { en: trimmedSubheadingEn } : {}),
            },
          }
        : {}),
      ...(trimmedCtaLabelFa
        ? {
            ctaLabel: {
              fa: trimmedCtaLabelFa,
              ...(trimmedCtaLabelEn ? { en: trimmedCtaLabelEn } : {}),
            },
          }
        : {}),
      ctaUrl: ctaUrl.trim(),
    };

    try {
      // `CreateHeroSlideDto.backgroundMediaId` has no `null` variant
      // (only `UpdateHeroSlideDto` does, per that DTO's own "explicit
      // null clears it" comment) — a brand-new slide with no image
      // chosen simply omits the field, rather than sending `null`.
      const saved = isEdit
        ? await updateHeroSlide(slide.id, { ...sharedFields, backgroundMediaId })
        : await createHeroSlide({
            ...sharedFields,
            ...(backgroundMediaId ? { backgroundMediaId } : {}),
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSaving(false);
    }
    // No `finally` resetting isSaving on success: the dialog is about
    // to be unmounted by the parent (`onSaved` closes it), same
    // reasoning as `GalleryItemForm`'s submit handler.
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "Edit hero slide" : "New hero slide"}
        </h2>

        <form
          className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor={headingFaId} className="text-sm font-medium text-slate-900">
              Heading (Farsi)
            </label>
            <input
              id={headingFaId}
              type="text"
              dir="rtl"
              required
              value={headingFa}
              onChange={(event) => setHeadingFa(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={headingEnId} className="text-sm font-medium text-slate-900">
              Heading (English) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={headingEnId}
              type="text"
              value={headingEn}
              onChange={(event) => setHeadingEn(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={subheadingFaId} className="text-sm font-medium text-slate-900">
              Subheading (Farsi) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={subheadingFaId}
              type="text"
              dir="rtl"
              value={subheadingFa}
              onChange={(event) => setSubheadingFa(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={subheadingEnId} className="text-sm font-medium text-slate-900">
              Subheading (English) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={subheadingEnId}
              type="text"
              value={subheadingEn}
              onChange={(event) => setSubheadingEn(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ctaLabelFaId} className="text-sm font-medium text-slate-900">
                CTA label (Farsi) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={ctaLabelFaId}
                type="text"
                dir="rtl"
                value={ctaLabelFa}
                onChange={(event) => setCtaLabelFa(event.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={ctaLabelEnId} className="text-sm font-medium text-slate-900">
                CTA label (English) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={ctaLabelEnId}
                type="text"
                value={ctaLabelEn}
                onChange={(event) => setCtaLabelEn(event.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={ctaUrlId} className="text-sm font-medium text-slate-900">
              CTA URL <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={ctaUrlId}
              type="text"
              value={ctaUrl}
              onChange={(event) => setCtaUrl(event.target.value)}
              disabled={isSaving}
              placeholder="e.g. /admissions or https://example.com"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <HeroBackgroundField
            mediaId={backgroundMediaId}
            disabled={isSaving}
            onChoose={() => setIsPickerOpen(true)}
            onClear={() => setBackgroundMediaId(null)}
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
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create slide"}
            </button>
          </div>
        </form>
      </div>

      {isPickerOpen ? (
        <HeroMediaPickerDialog
          selectedId={backgroundMediaId}
          onSelect={(media) => {
            setBackgroundMediaId(media.id);
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
 * Optional, clearable background-image field row — thumbnail preview
 * plus "Choose…"/"Remove" buttons. Same layout as Site Settings'
 * `MediaField` and Gallery's `GalleryImageField`, but that field is
 * required (no `onClear`) — this is its own copy, not an import,
 * since nothing shared between the three modules yet justifies
 * promoting it.
 */
function HeroBackgroundField({
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
        Background image <span className="font-normal text-slate-400">— optional</span>
      </span>
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
 * as `features/cms/gallery/GalleryItemForm.tsx`'s
 * `GalleryMediaPickerDialog` (see that file's comment on why there's
 * no shared `Dialog` primitive yet). `MediaPicker` itself is only the
 * permission-gated grid; this dialog shell is specific to this field,
 * not a generic reusable one.
 */
function HeroMediaPickerDialog({
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

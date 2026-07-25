import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createCampus, updateCampus } from "./api";
import type { CmsCampus, CmsCampusSeoMetadataInput } from "./types";

/** Mirrors the backend's `SLUG_PATTERN` (`create-campus.dto.ts`/`update-campus.dto.ts`) — lowercase kebab-case only. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Create/edit dialog for `POST /admin/campuses` and `PATCH
 * /admin/campuses/:id`. Same plain fixed-overlay modal shape as
 * `features/cms/events/EventForm.tsx`/`features/cms/teachers/TeacherForm.tsx`
 * (see that file's comment on why there's no shared `Dialog` primitive
 * yet).
 *
 * `title.fa`, `slug`, and `body.fa` are the required fields, matching
 * `CreateCampusDto` (`fa` mandatory, `en` optional on the nested
 * `TranslatableTextDto`s). `excerpt`/`address` are optional
 * translatable fields, sent only when their `fa` value is non-empty,
 * same reasoning as Events'/Teachers' equivalents:
 * `CampusesService.update` replaces the whole nested object rather
 * than merging keys.
 *
 * `mapUrl`/`phone`/`email` are plain optional fields, all clearable in
 * edit mode via explicit `null`, same convention as Teachers'
 * `campusId`/`phone`/`email`.
 *
 * `featuredImageMediaId` and the `seo` fieldset are identical in shape
 * and behavior to `EventForm`'s.
 *
 * No `position` field here — a new campus is appended to the end of
 * the current order server-side (`CampusesService.create`); reordering
 * existing campuses is `CampusList`/`CampusRow`'s drag-and-drop, not
 * this form.
 */
export interface CampusFormProps {
  /** `null` for create mode; an existing campus for edit mode. */
  campus: CmsCampus | null;
  onCancel: () => void;
  onSaved: (campus: CmsCampus) => void;
}

export function CampusForm({ campus, onCancel, onSaved }: CampusFormProps) {
  const isEdit = campus !== null;

  const titleFaId = useId();
  const titleEnId = useId();
  const slugId = useId();
  const excerptFaId = useId();
  const excerptEnId = useId();
  const bodyFaId = useId();
  const bodyEnId = useId();
  const addressFaId = useId();
  const addressEnId = useId();
  const mapUrlId = useId();
  const phoneId = useId();
  const emailId = useId();
  const metaTitleId = useId();
  const metaDescriptionId = useId();
  const ogImageUrlId = useId();
  const canonicalUrlId = useId();
  const noindexId = useId();

  const [titleFa, setTitleFa] = useState(campus?.title.fa ?? "");
  const [titleEn, setTitleEn] = useState(campus?.title.en ?? "");
  const [slug, setSlug] = useState(campus?.slug ?? "");
  const [excerptFa, setExcerptFa] = useState(campus?.excerpt?.fa ?? "");
  const [excerptEn, setExcerptEn] = useState(campus?.excerpt?.en ?? "");
  const [bodyFa, setBodyFa] = useState(campus?.body.fa ?? "");
  const [bodyEn, setBodyEn] = useState(campus?.body.en ?? "");
  const [addressFa, setAddressFa] = useState(campus?.address?.fa ?? "");
  const [addressEn, setAddressEn] = useState(campus?.address?.en ?? "");
  const [mapUrl, setMapUrl] = useState(campus?.mapUrl ?? "");
  const [phone, setPhone] = useState(campus?.phone ?? "");
  const [email, setEmail] = useState(campus?.email ?? "");
  const [featuredImageMediaId, setFeaturedImageMediaId] = useState<string | null>(
    campus?.featuredImageMediaId ?? null,
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [metaTitle, setMetaTitle] = useState(campus?.seo.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(campus?.seo.metaDescription ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(campus?.seo.ogImageUrl ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(campus?.seo.canonicalUrl ?? "");
  const [noindex, setNoindex] = useState(campus?.seo.noindex ?? false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty } = useIsDirty({
    titleFa,
    titleEn,
    slug,
    excerptFa,
    excerptEn,
    bodyFa,
    bodyEn,
    addressFa,
    addressEn,
    mapUrl,
    phone,
    email,
    featuredImageMediaId,
    metaTitle,
    metaDescription,
    ogImageUrl,
    canonicalUrl,
    noindex,
  });
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard(isDirty);

  const trimmedSlug = slug.trim();
  const slugIsValid = trimmedSlug.length > 0 && SLUG_PATTERN.test(trimmedSlug);
  const canSubmit =
    titleFa.trim().length > 0 && slugIsValid && bodyFa.trim().length > 0 && !isSaving;

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedTitleEn = titleEn.trim();
    const trimmedExcerptFa = excerptFa.trim();
    const trimmedExcerptEn = excerptEn.trim();
    const trimmedBodyEn = bodyEn.trim();
    const trimmedAddressFa = addressFa.trim();
    const trimmedAddressEn = addressEn.trim();
    const trimmedMapUrl = mapUrl.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    const trimmedMetaTitle = metaTitle.trim();
    const trimmedMetaDescription = metaDescription.trim();
    const trimmedOgImageUrl = ogImageUrl.trim();
    const trimmedCanonicalUrl = canonicalUrl.trim();

    const seo: CmsCampusSeoMetadataInput | undefined =
      trimmedMetaTitle ||
      trimmedMetaDescription ||
      trimmedOgImageUrl ||
      trimmedCanonicalUrl ||
      noindex
        ? {
            ...(trimmedMetaTitle ? { metaTitle: trimmedMetaTitle } : {}),
            ...(trimmedMetaDescription ? { metaDescription: trimmedMetaDescription } : {}),
            ...(trimmedOgImageUrl ? { ogImageUrl: trimmedOgImageUrl } : {}),
            ...(trimmedCanonicalUrl ? { canonicalUrl: trimmedCanonicalUrl } : {}),
            noindex,
          }
        : undefined;

    const sharedFields = {
      title: {
        fa: titleFa.trim(),
        ...(trimmedTitleEn ? { en: trimmedTitleEn } : {}),
      },
      slug: trimmedSlug,
      ...(trimmedExcerptFa
        ? {
            excerpt: {
              fa: trimmedExcerptFa,
              ...(trimmedExcerptEn ? { en: trimmedExcerptEn } : {}),
            },
          }
        : {}),
      body: {
        fa: bodyFa.trim(),
        ...(trimmedBodyEn ? { en: trimmedBodyEn } : {}),
      },
      ...(trimmedAddressFa
        ? {
            address: {
              fa: trimmedAddressFa,
              ...(trimmedAddressEn ? { en: trimmedAddressEn } : {}),
            },
          }
        : {}),
      ...(seo ? { seo } : {}),
    };

    try {
      const saved = isEdit
        ? await updateCampus(campus.id, {
            ...sharedFields,
            mapUrl: trimmedMapUrl || null,
            phone: trimmedPhone || null,
            email: trimmedEmail || null,
            featuredImageMediaId,
          })
        : await createCampus({
            ...sharedFields,
            ...(trimmedMapUrl ? { mapUrl: trimmedMapUrl } : {}),
            ...(trimmedPhone ? { phone: trimmedPhone } : {}),
            ...(trimmedEmail ? { email: trimmedEmail } : {}),
            ...(featuredImageMediaId ? { featuredImageMediaId } : {}),
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSaving(false);
    }
    // No `finally` resetting isSaving on success: the dialog is about
    // to be unmounted by the parent (`onSaved` closes it), same
    // reasoning as `EventForm`'s/`TeacherForm`'s submit handlers.
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "Edit campus" : "New campus"}
        </h2>

        <form
          className="mt-4 flex max-h-[75vh] flex-col gap-4 overflow-y-auto"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={titleFaId} className="text-sm font-medium text-slate-900">
                Title (Farsi)
              </label>
              <input
                id={titleFaId}
                type="text"
                dir="rtl"
                required
                value={titleFa}
                onChange={(e) => setTitleFa(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={titleEnId} className="text-sm font-medium text-slate-900">
                Title (English) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={titleEnId}
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={slugId} className="text-sm font-medium text-slate-900">
              Slug
            </label>
            <input
              id={slugId}
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={isSaving}
              placeholder="e.g. downtown-campus"
              aria-invalid={trimmedSlug.length > 0 && !slugIsValid}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
            {trimmedSlug.length > 0 && !slugIsValid ? (
              <p className="text-xs text-red-600">
                Slug must be lowercase kebab-case (e.g. &ldquo;downtown-campus&rdquo;).
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={excerptFaId} className="text-sm font-medium text-slate-900">
                Excerpt (Farsi) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <textarea
                id={excerptFaId}
                dir="rtl"
                rows={2}
                value={excerptFa}
                onChange={(e) => setExcerptFa(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={excerptEnId} className="text-sm font-medium text-slate-900">
                Excerpt (English) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <textarea
                id={excerptEnId}
                rows={2}
                value={excerptEn}
                onChange={(e) => setExcerptEn(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={bodyFaId} className="text-sm font-medium text-slate-900">
              Body (Farsi)
            </label>
            <textarea
              id={bodyFaId}
              dir="rtl"
              rows={8}
              required
              value={bodyFa}
              onChange={(e) => setBodyFa(e.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={bodyEnId} className="text-sm font-medium text-slate-900">
              Body (English) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <textarea
              id={bodyEnId}
              rows={8}
              value={bodyEn}
              onChange={(e) => setBodyEn(e.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={addressFaId} className="text-sm font-medium text-slate-900">
                Address (Farsi) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <textarea
                id={addressFaId}
                dir="rtl"
                rows={2}
                value={addressFa}
                onChange={(e) => setAddressFa(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={addressEnId} className="text-sm font-medium text-slate-900">
                Address (English) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <textarea
                id={addressEnId}
                rows={2}
                value={addressEn}
                onChange={(e) => setAddressEn(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={mapUrlId} className="text-sm font-medium text-slate-900">
              Map URL <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={mapUrlId}
              type="text"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              disabled={isSaving}
              placeholder="https://maps.google.com/…"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={phoneId} className="text-sm font-medium text-slate-900">
                Phone <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={phoneId}
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={emailId} className="text-sm font-medium text-slate-900">
                Email <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={emailId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          <CampusFeaturedImageField
            mediaId={featuredImageMediaId}
            disabled={isSaving}
            onChoose={() => setIsPickerOpen(true)}
            onClear={() => setFeaturedImageMediaId(null)}
          />

          <fieldset className="flex flex-col gap-4 rounded-md border border-slate-200 p-3">
            <legend className="px-1 text-sm font-medium text-slate-900">
              SEO <span className="font-normal text-slate-400">— optional</span>
            </legend>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={metaTitleId} className="text-sm font-medium text-slate-900">
                Meta title
              </label>
              <input
                id={metaTitleId}
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={metaDescriptionId} className="text-sm font-medium text-slate-900">
                Meta description
              </label>
              <textarea
                id={metaDescriptionId}
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={ogImageUrlId} className="text-sm font-medium text-slate-900">
                  OG image URL
                </label>
                <input
                  id={ogImageUrlId}
                  type="text"
                  value={ogImageUrl}
                  onChange={(e) => setOgImageUrl(e.target.value)}
                  disabled={isSaving}
                  placeholder="https://…"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={canonicalUrlId} className="text-sm font-medium text-slate-900">
                  Canonical URL
                </label>
                <input
                  id={canonicalUrlId}
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  disabled={isSaving}
                  placeholder="https://…"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
                />
              </div>
            </div>

            <label htmlFor={noindexId} className="flex items-center gap-2 text-sm text-slate-900">
              <input
                id={noindexId}
                type="checkbox"
                checked={noindex}
                onChange={(e) => setNoindex(e.target.checked)}
                disabled={isSaving}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
              />
              Hide from search engines (noindex)
            </label>
          </fieldset>

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
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create campus"}
            </button>
          </div>
        </form>
      </div>

      {isPickerOpen ? (
        <CampusMediaPickerDialog
          selectedId={featuredImageMediaId}
          onSelect={(media) => {
            setFeaturedImageMediaId(media.id);
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
 * Optional, clearable featured-image field row — thumbnail preview plus
 * "Choose…"/"Remove" buttons. Same layout as Events' `EventFeaturedImageField`
 * and Teachers' `TeacherAvatarField`, but this is its own copy, not an
 * import, since nothing shared between those modules and Campuses yet
 * justifies promoting it (see `features/cms/components/README.md`).
 */
function CampusFeaturedImageField({
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
        Featured image <span className="font-normal text-slate-400">— optional</span>
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
 * as Events' `EventMediaPickerDialog`/Teachers' `TeacherMediaPickerDialog`.
 * `MediaPicker` itself is only the permission-gated grid; this dialog
 * shell is specific to this field, not a generic reusable one.
 */
function CampusMediaPickerDialog({
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

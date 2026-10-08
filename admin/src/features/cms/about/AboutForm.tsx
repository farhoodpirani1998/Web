import { useId, useState, type FormEvent } from "react";

import { MediaPicker, useMediaById } from "@/features/cms/media";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { ApiError } from "@/lib/apiError";

import { updateAbout } from "./api";
import type { CmsAbout, CmsAboutSeoMetadataInput } from "./types";

/**
 * Inline (non-modal) edit form for `PATCH /admin/about`. About is a
 * singleton — there's no create step and nothing to cancel back out
 * of, so unlike Campuses'/Features' create/edit dialog, this renders
 * directly in `AboutPage`'s body, same shape as
 * `features/cms/site-settings/SettingsForm.tsx`'s sections.
 *
 * `title.fa` and `body.fa` are the only required fields, matching
 * `UpdateAboutDto` (`fa` mandatory, `en` optional on the nested
 * `TranslatableTextDto`s — technically both are optional on the DTO
 * itself since every field is a PATCH, but a blank title/body isn't a
 * meaningful save, so the form requires them same as
 * `CampusForm`/`TeacherForm`'s equivalents). `en` fields are sent only
 * when non-empty so a save can still clear a previously-set `en`
 * value: `AboutService.update` replaces the whole `title`/`body`
 * object rather than merging keys, so omitting `en` here correctly
 * drops it.
 *
 * `imageMediaId` and the `seo` fieldset are identical in shape and
 * behavior to `CampusForm`'s `featuredImageMediaId`/`seo`.
 */
export interface AboutFormProps {
  about: CmsAbout;
  onSaved: (about: CmsAbout) => void;
}

export function AboutForm({ about, onSaved }: AboutFormProps) {
  const titleFaId = useId();
  const titleEnId = useId();
  const bodyFaId = useId();
  const bodyEnId = useId();
  const metaTitleId = useId();
  const metaDescriptionId = useId();
  const ogImageUrlId = useId();
  const canonicalUrlId = useId();
  const noindexId = useId();

  const [titleFa, setTitleFa] = useState(about.title.fa);
  const [titleEn, setTitleEn] = useState(about.title.en ?? "");
  const [bodyFa, setBodyFa] = useState(about.body.fa);
  const [bodyEn, setBodyEn] = useState(about.body.en ?? "");
  const [imageMediaId, setImageMediaId] = useState<string | null>(about.imageMediaId ?? null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [metaTitle, setMetaTitle] = useState(about.seo.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(about.seo.metaDescription ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(about.seo.ogImageUrl ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(about.seo.canonicalUrl ?? "");
  const [noindex, setNoindex] = useState(about.seo.noindex);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = titleFa.trim().length > 0 && bodyFa.trim().length > 0 && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedTitleEn = titleEn.trim();
    const trimmedBodyEn = bodyEn.trim();
    const trimmedMetaTitle = metaTitle.trim();
    const trimmedMetaDescription = metaDescription.trim();
    const trimmedOgImageUrl = ogImageUrl.trim();
    const trimmedCanonicalUrl = canonicalUrl.trim();

    const seo: CmsAboutSeoMetadataInput = {
      ...(trimmedMetaTitle ? { metaTitle: trimmedMetaTitle } : {}),
      ...(trimmedMetaDescription ? { metaDescription: trimmedMetaDescription } : {}),
      ...(trimmedOgImageUrl ? { ogImageUrl: trimmedOgImageUrl } : {}),
      ...(trimmedCanonicalUrl ? { canonicalUrl: trimmedCanonicalUrl } : {}),
      noindex,
    };

    try {
      const saved = await updateAbout({
        title: {
          fa: titleFa.trim(),
          ...(trimmedTitleEn ? { en: trimmedTitleEn } : {}),
        },
        body: {
          fa: bodyFa.trim(),
          ...(trimmedBodyEn ? { en: trimmedBodyEn } : {}),
        },
        imageMediaId,
        seo,
      });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
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
          onChange={(event) => setTitleFa(event.target.value)}
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
          onChange={(event) => setTitleEn(event.target.value)}
          disabled={isSaving}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={bodyFaId} className="text-sm font-medium text-slate-900">
          Body (Farsi)
        </label>
        <textarea
          id={bodyFaId}
          dir="rtl"
          rows={10}
          required
          value={bodyFa}
          onChange={(event) => setBodyFa(event.target.value)}
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
          rows={10}
          value={bodyEn}
          onChange={(event) => setBodyEn(event.target.value)}
          disabled={isSaving}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        />
      </div>

      <AboutImageField
        mediaId={imageMediaId}
        disabled={isSaving}
        onChoose={() => setIsPickerOpen(true)}
        onClear={() => setImageMediaId(null)}
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
            onChange={(event) => setMetaTitle(event.target.value)}
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
            onChange={(event) => setMetaDescription(event.target.value)}
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
              onChange={(event) => setOgImageUrl(event.target.value)}
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
              onChange={(event) => setCanonicalUrl(event.target.value)}
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
            onChange={(event) => setNoindex(event.target.checked)}
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

      <div>
        <PermissionGate permission="website.content:write">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </PermissionGate>
      </div>

      {isPickerOpen ? (
        <AboutMediaPickerDialog
          selectedId={imageMediaId}
          onSelect={(media) => {
            setImageMediaId(media.id);
            setIsPickerOpen(false);
          }}
          onCancel={() => setIsPickerOpen(false)}
        />
      ) : null}
    </form>
  );
}

/**
 * Optional, clearable image field row — thumbnail preview plus
 * "Choose…"/"Remove" buttons. Same layout as Campuses'
 * `CampusFeaturedImageField`/Site Settings' `MediaField`, but this is
 * its own copy, not an import, since nothing shared between those
 * modules and About yet justifies promoting it (see
 * `features/cms/components/README.md`).
 */
function AboutImageField({
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
        Image <span className="font-normal text-slate-400">— optional</span>
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
 * Fixed-overlay wrapper around `MediaPicker` — same plain modal shell
 * as Campuses' `CampusMediaPickerDialog`. `MediaPicker` itself is only
 * the permission-gated grid; this dialog shell is specific to this
 * field, not a generic reusable one.
 */
function AboutMediaPickerDialog({
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

import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createPage, updatePage } from "./api";
import { usePageOptions } from "./hooks/usePages";
import { CMS_PAGE_TEMPLATES } from "./types";
import type { CmsPage, CmsPageSeoMetadataInput, CmsPageTemplate } from "./types";

/** Mirrors the backend's `SLUG_PATTERN` (`create-page.dto.ts`/`update-page.dto.ts`) — lowercase kebab-case only. Identical to News' pattern. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const TEMPLATE_LABEL: Record<CmsPageTemplate, string> = {
  default: "Default",
  full_width: "Full width",
  landing: "Landing",
  contact: "Contact",
  sidebar: "Sidebar",
};

/**
 * Create/edit dialog for `POST /admin/pages` and `PATCH /admin/pages/:id`.
 * Same plain fixed-overlay modal shape as
 * `features/cms/news/NewsForm.tsx` — see that file's comment on why
 * there's no shared `Dialog` primitive yet.
 *
 * `title.fa`, `slug`, and `body.fa` are the only required fields,
 * matching `CreatePageDto` (`fa` mandatory, `en` optional on the
 * nested `TranslatableTextDto`s). Unlike News, there's no
 * `category`/`tags`/`excerpt` — the entity doesn't have those fields.
 *
 * `template` defaults to `"default"` on create, matching
 * `PagesService.create`'s own `dto.template ?? PageTemplate.DEFAULT`
 * fallback — sent explicitly either way so the dialog never silently
 * relies on a server default the person can't see.
 *
 * `parentId` is a `<select>` sourced from `usePageOptions` (every
 * page, unfiltered) rather than free text — it's a real page
 * reference, not a category string. In edit mode, the page being
 * edited is excluded from its own options (the backend rejects a page
 * being its own parent as a trivial cycle — see
 * `PagesService.assertValidParent` — this just avoids offering an
 * obviously-invalid choice; the backend's full ancestor-chain cycle
 * check is still the real enforcement for deeper cycles this form
 * can't easily predict client-side). Clearable in edit mode (explicit
 * `null` moves the page back to top-level, same "explicit null clears
 * it" convention as `featuredImageMediaId`); on create, an unselected
 * parent simply omits the field.
 *
 * `showInMenu` defaults to checked, matching
 * `PagesService.create`'s own `dto.showInMenu ?? true` fallback.
 *
 * `featuredImageMediaId` and the `seo` fieldset are identical in shape
 * and reasoning to `NewsForm`'s — see that file's comments.
 */
export interface PageFormProps {
  /** `null` for create mode; an existing page for edit mode. */
  page: CmsPage | null;
  onCancel: () => void;
  onSaved: (page: CmsPage) => void;
}

export function PageForm({ page, onCancel, onSaved }: PageFormProps) {
  const isEdit = page !== null;
  const { options: parentOptions, isLoading: isLoadingParentOptions } = usePageOptions();

  const titleFaId = useId();
  const titleEnId = useId();
  const slugId = useId();
  const bodyFaId = useId();
  const bodyEnId = useId();
  const templateId = useId();
  const parentFieldId = useId();
  const showInMenuId = useId();
  const metaTitleId = useId();
  const metaDescriptionId = useId();
  const ogImageUrlId = useId();
  const canonicalUrlId = useId();
  const noindexId = useId();

  const [titleFa, setTitleFa] = useState(page?.title.fa ?? "");
  const [titleEn, setTitleEn] = useState(page?.title.en ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [bodyFa, setBodyFa] = useState(page?.body.fa ?? "");
  const [bodyEn, setBodyEn] = useState(page?.body.en ?? "");
  const [template, setTemplate] = useState<CmsPageTemplate>(page?.template ?? "default");
  const [parentId, setParentId] = useState<string | null>(page?.parentId ?? null);
  const [showInMenu, setShowInMenu] = useState(page?.showInMenu ?? true);
  const [featuredImageMediaId, setFeaturedImageMediaId] = useState<string | null>(
    page?.featuredImageMediaId ?? null,
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [metaTitle, setMetaTitle] = useState(page?.seo.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(page?.seo.metaDescription ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(page?.seo.ogImageUrl ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(page?.seo.canonicalUrl ?? "");
  const [noindex, setNoindex] = useState(page?.seo.noindex ?? false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty } = useIsDirty({
    titleFa,
    titleEn,
    slug,
    bodyFa,
    bodyEn,
    template,
    parentId,
    showInMenu,
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

  const availableParentOptions = parentOptions.filter((option) => option.id !== page?.id);

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

    const seo: CmsPageSeoMetadataInput | undefined =
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
      body: {
        fa: bodyFa.trim(),
        ...(trimmedBodyEn ? { en: trimmedBodyEn } : {}),
      },
      template,
      showInMenu,
      ...(seo ? { seo } : {}),
    };

    try {
      const saved = isEdit
        ? await updatePage(page.id, { ...sharedFields, parentId, featuredImageMediaId })
        : await createPage({
            ...sharedFields,
            ...(parentId ? { parentId } : {}),
            ...(featuredImageMediaId ? { featuredImageMediaId } : {}),
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSaving(false);
    }
    // No `finally` resetting isSaving on success: the dialog is about
    // to be unmounted by the parent, same reasoning as `NewsForm`.
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "Edit page" : "New page"}
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
              onChange={(event) => setSlug(event.target.value)}
              disabled={isSaving}
              placeholder="e.g. admissions-policy"
              aria-invalid={trimmedSlug.length > 0 && !slugIsValid}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
            {trimmedSlug.length > 0 && !slugIsValid ? (
              <p className="text-xs text-red-600">
                Slug must be lowercase kebab-case (e.g. &ldquo;admissions-policy&rdquo;).
              </p>
            ) : null}
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
              rows={8}
              value={bodyEn}
              onChange={(event) => setBodyEn(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={templateId} className="text-sm font-medium text-slate-900">
                Template
              </label>
              <select
                id={templateId}
                value={template}
                onChange={(event) => setTemplate(event.target.value as CmsPageTemplate)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              >
                {CMS_PAGE_TEMPLATES.map((option) => (
                  <option key={option} value={option}>
                    {TEMPLATE_LABEL[option]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={parentFieldId} className="text-sm font-medium text-slate-900">
                Parent page <span className="font-normal text-slate-400">— optional</span>
              </label>
              <select
                id={parentFieldId}
                value={parentId ?? ""}
                onChange={(event) => setParentId(event.target.value || null)}
                disabled={isSaving || isLoadingParentOptions}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              >
                <option value="">None (top-level)</option>
                {availableParentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title.fa}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label htmlFor={showInMenuId} className="flex items-center gap-2 text-sm text-slate-900">
            <input
              id={showInMenuId}
              type="checkbox"
              checked={showInMenu}
              onChange={(event) => setShowInMenu(event.target.checked)}
              disabled={isSaving}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            Show in site navigation
          </label>

          <PageFeaturedImageField
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
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create page"}
            </button>
          </div>
        </form>
      </div>

      {isPickerOpen ? (
        <PageMediaPickerDialog
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
 * Optional, clearable featured-image field row — identical layout to
 * News' `NewsFeaturedImageField`, its own copy per that file's own
 * comment on why it isn't shared yet.
 */
function PageFeaturedImageField({
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
 * Fixed-overlay wrapper around `MediaPicker` — same shape as News'
 * `NewsMediaPickerDialog`.
 */
function PageMediaPickerDialog({
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

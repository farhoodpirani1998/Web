import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createNewsArticle, updateNewsArticle } from "./api";
import type { CmsNewsArticle, CmsSeoMetadataInput } from "./types";

/** Mirrors the backend's `SLUG_PATTERN` (`create-news-article.dto.ts`/`update-news-article.dto.ts`) — lowercase kebab-case only. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Create/edit dialog for `POST /admin/news` and `PATCH /admin/news/:id`.
 * Same plain fixed-overlay modal shape as
 * `features/cms/hero-slides/HeroSlideForm.tsx` (see that file's comment
 * on why there's no shared `Dialog` primitive yet).
 *
 * `title.fa`, `slug`, and `body.fa` are the only required fields,
 * matching `CreateNewsArticleDto` (`fa` mandatory, `en` optional on the
 * nested `TranslatableTextDto`s — `Locale.FA` is `DEFAULT_LOCALE`
 * server-side). `excerpt` is an optional translatable field, sent only
 * when its `fa` value is non-empty, same reasoning as
 * `HeroSlideForm`'s `subheading`: `NewsService.update` replaces the
 * whole nested object rather than merging keys.
 *
 * `category` is a flat (non-translatable) field, always sent as typed
 * — including empty, so clearing it in edit mode actually clears it.
 * `tags` is entered as a comma-separated list and split/trimmed into
 * `string[]` — the entity's only genuine multi-value field (see the
 * entity's own doc comment); an empty input sends `[]`, so clearing all
 * tags in edit mode actually clears them.
 *
 * `featuredImageMediaId` is optional AND clearable in edit mode (same
 * "explicit null clears it" convention as Hero's `backgroundMediaId` —
 * see `UpdateNewsArticleDto`'s own comment) but, like
 * `CreateHeroSlideDto.backgroundMediaId`, has no `null` variant on
 * create — a brand-new article with no image chosen simply omits the
 * field.
 *
 * `seo` fields mirror `SeoMetadataDto` — all optional, sent as a single
 * nested object only when at least one sub-field is set (or `noindex`
 * is checked), since `NewsService.update` merges `seo` shallowly
 * (`{ ...article.seo, ...dto.seo }`) rather than replacing it wholesale
 * the way the translatable fields are replaced.
 *
 * This is the first CMS admin module to render `seo` fields — About/
 * Static Pages haven't been built here yet (see `features/cms/README.md`).
 */
export interface NewsFormProps {
  /** `null` for create mode; an existing article for edit mode. */
  article: CmsNewsArticle | null;
  onCancel: () => void;
  onSaved: (article: CmsNewsArticle) => void;
}

export function NewsForm({ article, onCancel, onSaved }: NewsFormProps) {
  const isEdit = article !== null;

  const titleFaId = useId();
  const titleEnId = useId();
  const slugId = useId();
  const excerptFaId = useId();
  const excerptEnId = useId();
  const bodyFaId = useId();
  const bodyEnId = useId();
  const categoryId = useId();
  const tagsId = useId();
  const metaTitleId = useId();
  const metaDescriptionId = useId();
  const ogImageUrlId = useId();
  const canonicalUrlId = useId();
  const noindexId = useId();

  const [titleFa, setTitleFa] = useState(article?.title.fa ?? "");
  const [titleEn, setTitleEn] = useState(article?.title.en ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerptFa, setExcerptFa] = useState(article?.excerpt?.fa ?? "");
  const [excerptEn, setExcerptEn] = useState(article?.excerpt?.en ?? "");
  const [bodyFa, setBodyFa] = useState(article?.body.fa ?? "");
  const [bodyEn, setBodyEn] = useState(article?.body.en ?? "");
  const [category, setCategory] = useState(article?.category ?? "");
  const [tagsInput, setTagsInput] = useState((article?.tags ?? []).join(", "));
  const [featuredImageMediaId, setFeaturedImageMediaId] = useState<string | null>(
    article?.featuredImageMediaId ?? null,
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [metaTitle, setMetaTitle] = useState(article?.seo.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(article?.seo.metaDescription ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(article?.seo.ogImageUrl ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(article?.seo.canonicalUrl ?? "");
  const [noindex, setNoindex] = useState(article?.seo.noindex ?? false);

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
    category,
    tagsInput,
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedTitleEn = titleEn.trim();
    const trimmedExcerptFa = excerptFa.trim();
    const trimmedExcerptEn = excerptEn.trim();
    const trimmedBodyEn = bodyEn.trim();
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const trimmedMetaTitle = metaTitle.trim();
    const trimmedMetaDescription = metaDescription.trim();
    const trimmedOgImageUrl = ogImageUrl.trim();
    const trimmedCanonicalUrl = canonicalUrl.trim();

    const seo: CmsSeoMetadataInput | undefined =
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
      category: category.trim(),
      tags,
      ...(seo ? { seo } : {}),
    };

    try {
      const saved = isEdit
        ? await updateNewsArticle(article.id, { ...sharedFields, featuredImageMediaId })
        : await createNewsArticle({
            ...sharedFields,
            ...(featuredImageMediaId ? { featuredImageMediaId } : {}),
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSaving(false);
    }
    // No `finally` resetting isSaving on success: the dialog is about
    // to be unmounted by the parent (`onSaved` closes it), same
    // reasoning as `HeroSlideForm`'s submit handler.
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "Edit news article" : "New news article"}
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
              placeholder="e.g. new-stem-lab-opening"
              aria-invalid={trimmedSlug.length > 0 && !slugIsValid}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
            {trimmedSlug.length > 0 && !slugIsValid ? (
              <p className="text-xs text-red-600">
                Slug must be lowercase kebab-case (e.g. &ldquo;new-stem-lab-opening&rdquo;).
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
                onChange={(event) => setExcerptFa(event.target.value)}
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
                onChange={(event) => setExcerptEn(event.target.value)}
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
              <label htmlFor={categoryId} className="text-sm font-medium text-slate-900">
                Category <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={categoryId}
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={isSaving}
                placeholder="e.g. announcements, events"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={tagsId} className="text-sm font-medium text-slate-900">
                Tags <span className="font-normal text-slate-400">— optional, comma-separated</span>
              </label>
              <input
                id={tagsId}
                type="text"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                disabled={isSaving}
                placeholder="e.g. stem, open-house"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          <NewsFeaturedImageField
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
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create article"}
            </button>
          </div>
        </form>
      </div>

      {isPickerOpen ? (
        <NewsMediaPickerDialog
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
 * "Choose…"/"Remove" buttons. Same layout as Hero's `HeroBackgroundField`
 * and Site Settings' `MediaField`, but this is its own copy, not an
 * import, since nothing shared between those modules and News yet
 * justifies promoting it (see `features/cms/components/README.md`).
 */
function NewsFeaturedImageField({
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
 * as `HeroSlideForm`'s `HeroMediaPickerDialog`. `MediaPicker` itself is
 * only the permission-gated grid; this dialog shell is specific to this
 * field, not a generic reusable one.
 */
function NewsMediaPickerDialog({
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

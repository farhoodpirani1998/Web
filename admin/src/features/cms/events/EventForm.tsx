import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createCalendarEvent, updateCalendarEvent } from "./api";
import type { CmsCalendarEvent, CmsEventSeoMetadataInput } from "./types";

/** Mirrors the backend's `SLUG_PATTERN` (`create-calendar-event.dto.ts`/`update-calendar-event.dto.ts`) — lowercase kebab-case only. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** `<input type="datetime-local">` needs `YYYY-MM-DDTHH:mm` in local time, not a raw ISO string with a `Z`/offset. Same helper as `EventScheduleControl`. */
function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/**
 * Create/edit dialog for `POST /admin/events` and `PATCH /admin/events/:id`.
 * Same plain fixed-overlay modal shape as `features/cms/news/NewsForm.tsx`
 * (see that file's comment on why there's no shared `Dialog` primitive
 * yet).
 *
 * `title.fa`, `slug`, `body.fa`, and `startAt` are the required fields,
 * matching `CreateCalendarEventDto` (`fa` mandatory, `en` optional on
 * the nested `TranslatableTextDto`s; `startAt` is a plain required
 * `@IsDateString`, unlike News which has no start-time concept at all —
 * see the entity's own doc comment). `excerpt`/`location` are optional
 * translatable fields, sent only when their `fa` value is non-empty,
 * same reasoning as News' `excerpt`: `EventsService.update` replaces the
 * whole nested object rather than merging keys.
 *
 * `category` is a flat (non-translatable) field, always sent as typed
 * — including empty, so clearing it in edit mode actually clears it.
 * `tags` is entered as a comma-separated list and split/trimmed into
 * `string[]`, same convention as News.
 *
 * `locationUrl` is optional AND clearable in edit mode (explicit `null`
 * clears it, same convention as `featuredImageMediaId` — see
 * `UpdateCalendarEventDto`'s own comment).
 *
 * `endAt` is optional AND clearable in edit mode the same way; it's
 * validated client-side only as "not before `startAt`" for a fast
 * error, but the real enforcement is server-side
 * (`EventsService.assertValidRange`) — submitting an invalid range
 * still surfaces the backend's `BadRequestException` message via the
 * usual `ApiError` path if this check is ever bypassed.
 *
 * `allDay` is a plain checkbox — a display concern for the frontend,
 * per the entity's own doc comment; it doesn't change what `startAt`/
 * `endAt` are sent as (still full ISO timestamps either way).
 *
 * `featuredImageMediaId` and the `seo` fieldset are identical in shape
 * and behavior to `NewsForm`'s.
 */
export interface EventFormProps {
  /** `null` for create mode; an existing event for edit mode. */
  event: CmsCalendarEvent | null;
  onCancel: () => void;
  onSaved: (event: CmsCalendarEvent) => void;
}

export function EventForm({ event, onCancel, onSaved }: EventFormProps) {
  const isEdit = event !== null;

  const titleFaId = useId();
  const titleEnId = useId();
  const slugId = useId();
  const excerptFaId = useId();
  const excerptEnId = useId();
  const bodyFaId = useId();
  const bodyEnId = useId();
  const categoryId = useId();
  const tagsId = useId();
  const locationFaId = useId();
  const locationEnId = useId();
  const locationUrlId = useId();
  const startAtId = useId();
  const endAtId = useId();
  const allDayId = useId();
  const metaTitleId = useId();
  const metaDescriptionId = useId();
  const ogImageUrlId = useId();
  const canonicalUrlId = useId();
  const noindexId = useId();

  const [titleFa, setTitleFa] = useState(event?.title.fa ?? "");
  const [titleEn, setTitleEn] = useState(event?.title.en ?? "");
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [excerptFa, setExcerptFa] = useState(event?.excerpt?.fa ?? "");
  const [excerptEn, setExcerptEn] = useState(event?.excerpt?.en ?? "");
  const [bodyFa, setBodyFa] = useState(event?.body.fa ?? "");
  const [bodyEn, setBodyEn] = useState(event?.body.en ?? "");
  const [category, setCategory] = useState(event?.category ?? "");
  const [tagsInput, setTagsInput] = useState((event?.tags ?? []).join(", "));
  const [locationFa, setLocationFa] = useState(event?.location?.fa ?? "");
  const [locationEn, setLocationEn] = useState(event?.location?.en ?? "");
  const [locationUrl, setLocationUrl] = useState(event?.locationUrl ?? "");
  const [startAt, setStartAt] = useState(event ? toDatetimeLocalValue(event.startAt) : "");
  const [endAt, setEndAt] = useState(event?.endAt ? toDatetimeLocalValue(event.endAt) : "");
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [featuredImageMediaId, setFeaturedImageMediaId] = useState<string | null>(
    event?.featuredImageMediaId ?? null,
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [metaTitle, setMetaTitle] = useState(event?.seo.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(event?.seo.metaDescription ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(event?.seo.ogImageUrl ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(event?.seo.canonicalUrl ?? "");
  const [noindex, setNoindex] = useState(event?.seo.noindex ?? false);

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
    locationFa,
    locationEn,
    locationUrl,
    startAt,
    endAt,
    allDay,
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
  const rangeIsValid = !endAt || !startAt || new Date(endAt) >= new Date(startAt);
  const canSubmit =
    titleFa.trim().length > 0 &&
    slugIsValid &&
    bodyFa.trim().length > 0 &&
    startAt.length > 0 &&
    rangeIsValid &&
    !isSaving;

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedTitleEn = titleEn.trim();
    const trimmedExcerptFa = excerptFa.trim();
    const trimmedExcerptEn = excerptEn.trim();
    const trimmedBodyEn = bodyEn.trim();
    const trimmedLocationFa = locationFa.trim();
    const trimmedLocationEn = locationEn.trim();
    const trimmedLocationUrl = locationUrl.trim();
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const trimmedMetaTitle = metaTitle.trim();
    const trimmedMetaDescription = metaDescription.trim();
    const trimmedOgImageUrl = ogImageUrl.trim();
    const trimmedCanonicalUrl = canonicalUrl.trim();

    const seo: CmsEventSeoMetadataInput | undefined =
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
      ...(trimmedLocationFa
        ? {
            location: {
              fa: trimmedLocationFa,
              ...(trimmedLocationEn ? { en: trimmedLocationEn } : {}),
            },
          }
        : {}),
      startAt: new Date(startAt).toISOString(),
      allDay,
      ...(seo ? { seo } : {}),
    };

    try {
      const saved = isEdit
        ? await updateCalendarEvent(event.id, {
            ...sharedFields,
            locationUrl: trimmedLocationUrl || null,
            endAt: endAt ? new Date(endAt).toISOString() : null,
            featuredImageMediaId,
          })
        : await createCalendarEvent({
            ...sharedFields,
            ...(trimmedLocationUrl ? { locationUrl: trimmedLocationUrl } : {}),
            ...(endAt ? { endAt: new Date(endAt).toISOString() } : {}),
            ...(featuredImageMediaId ? { featuredImageMediaId } : {}),
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSaving(false);
    }
    // No `finally` resetting isSaving on success: the dialog is about
    // to be unmounted by the parent (`onSaved` closes it), same
    // reasoning as `NewsForm`'s submit handler.
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "Edit event" : "New event"}
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
              placeholder="e.g. spring-open-house"
              aria-invalid={trimmedSlug.length > 0 && !slugIsValid}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
            {trimmedSlug.length > 0 && !slugIsValid ? (
              <p className="text-xs text-red-600">
                Slug must be lowercase kebab-case (e.g. &ldquo;spring-open-house&rdquo;).
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={startAtId} className="text-sm font-medium text-slate-900">
                Starts at
              </label>
              <input
                id={startAtId}
                type="datetime-local"
                required
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={endAtId} className="text-sm font-medium text-slate-900">
                Ends at <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={endAtId}
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                disabled={isSaving}
                aria-invalid={!rangeIsValid}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
              {!rangeIsValid ? (
                <p className="text-xs text-red-600">End time cannot be before the start time.</p>
              ) : null}
            </div>
          </div>

          <label htmlFor={allDayId} className="flex items-center gap-2 text-sm text-slate-900">
            <input
              id={allDayId}
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              disabled={isSaving}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            All-day event
          </label>

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
              <label htmlFor={categoryId} className="text-sm font-medium text-slate-900">
                Category <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={categoryId}
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSaving}
                placeholder="e.g. open-house, fundraiser"
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
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={isSaving}
                placeholder="e.g. stem, open-house"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={locationFaId} className="text-sm font-medium text-slate-900">
                Location (Farsi) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={locationFaId}
                type="text"
                dir="rtl"
                value={locationFa}
                onChange={(e) => setLocationFa(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={locationEnId} className="text-sm font-medium text-slate-900">
                Location (English) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={locationEnId}
                type="text"
                value={locationEn}
                onChange={(e) => setLocationEn(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={locationUrlId} className="text-sm font-medium text-slate-900">
              Location URL <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={locationUrlId}
              type="text"
              value={locationUrl}
              onChange={(e) => setLocationUrl(e.target.value)}
              disabled={isSaving}
              placeholder="https://maps.google.com/…"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <EventFeaturedImageField
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
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create event"}
            </button>
          </div>
        </form>
      </div>

      {isPickerOpen ? (
        <EventMediaPickerDialog
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
 * "Choose…"/"Remove" buttons. Same layout as News' `NewsFeaturedImageField`
 * and Hero's `HeroBackgroundField`, but this is its own copy, not an
 * import, since nothing shared between those modules and Events yet
 * justifies promoting it (see `features/cms/components/README.md`).
 */
function EventFeaturedImageField({
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
 * as `NewsForm`'s `NewsMediaPickerDialog`. `MediaPicker` itself is
 * only the permission-gated grid; this dialog shell is specific to
 * this field, not a generic reusable one.
 */
function EventMediaPickerDialog({
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

import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createTeacher, updateTeacher } from "./api";
import type { CmsTeacher, CmsTeacherSeoMetadataInput } from "./types";

/** Mirrors the backend's `SLUG_PATTERN` (`create-teacher.dto.ts`/`update-teacher.dto.ts`) — lowercase kebab-case only. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Create/edit dialog for `POST /admin/teachers` and `PATCH
 * /admin/teachers/:id`. Same plain fixed-overlay modal shape as
 * `features/cms/events/EventForm.tsx` (see that file's comment on why
 * there's no shared `Dialog` primitive yet).
 *
 * `fullName`, `slug`, `jobTitle.fa`, and `bio.fa` are the required
 * fields, matching `CreateTeacherDto` (`fa` mandatory, `en` optional on
 * the nested `TranslatableTextDto`s). `excerpt`/`department` are
 * optional translatable fields, sent only when their `fa` value is
 * non-empty, same reasoning as Events' `excerpt`/`location`:
 * `TeachersService.update` replaces the whole nested object rather
 * than merging keys.
 *
 * `fullName` is a plain (non-translatable) field, always sent as
 * typed — matching the entity's own doc comment (a proper noun, same
 * reasoning as Testimonial.authorName).
 *
 * `campusId` is a plain optional UUID text input, not a picker/select:
 * `campusId` is validated at the service layer as a plain uuid
 * reference, not a relation (see the entity's own doc comment), and no
 * admin Campus CMS module exists yet to list campuses from — inventing
 * a picker here would be building UI for a module this sprint doesn't
 * cover. `phone`/`email` are plain optional fields, both clearable in
 * edit mode via explicit `null`, same convention as `campusId`.
 *
 * `avatarMediaId` and the `seo` fieldset are identical in shape and
 * behavior to `EventForm`'s `featuredImageMediaId`/`seo`.
 *
 * No `position` field here — a new teacher is appended to the end of
 * the current order server-side (`TeachersService.create`); reordering
 * existing teachers is `TeacherList`/`TeacherRow`'s drag-and-drop, not
 * this form.
 */
export interface TeacherFormProps {
  /** `null` for create mode; an existing teacher for edit mode. */
  teacher: CmsTeacher | null;
  onCancel: () => void;
  onSaved: (teacher: CmsTeacher) => void;
}

export function TeacherForm({ teacher, onCancel, onSaved }: TeacherFormProps) {
  const isEdit = teacher !== null;

  const fullNameId = useId();
  const slugId = useId();
  const jobTitleFaId = useId();
  const jobTitleEnId = useId();
  const excerptFaId = useId();
  const excerptEnId = useId();
  const bioFaId = useId();
  const bioEnId = useId();
  const departmentFaId = useId();
  const departmentEnId = useId();
  const campusIdFieldId = useId();
  const phoneId = useId();
  const emailId = useId();
  const metaTitleId = useId();
  const metaDescriptionId = useId();
  const ogImageUrlId = useId();
  const canonicalUrlId = useId();
  const noindexId = useId();

  const [fullName, setFullName] = useState(teacher?.fullName ?? "");
  const [slug, setSlug] = useState(teacher?.slug ?? "");
  const [jobTitleFa, setJobTitleFa] = useState(teacher?.jobTitle.fa ?? "");
  const [jobTitleEn, setJobTitleEn] = useState(teacher?.jobTitle.en ?? "");
  const [excerptFa, setExcerptFa] = useState(teacher?.excerpt?.fa ?? "");
  const [excerptEn, setExcerptEn] = useState(teacher?.excerpt?.en ?? "");
  const [bioFa, setBioFa] = useState(teacher?.bio.fa ?? "");
  const [bioEn, setBioEn] = useState(teacher?.bio.en ?? "");
  const [departmentFa, setDepartmentFa] = useState(teacher?.department?.fa ?? "");
  const [departmentEn, setDepartmentEn] = useState(teacher?.department?.en ?? "");
  const [campusId, setCampusId] = useState(teacher?.campusId ?? "");
  const [phone, setPhone] = useState(teacher?.phone ?? "");
  const [email, setEmail] = useState(teacher?.email ?? "");
  const [avatarMediaId, setAvatarMediaId] = useState<string | null>(
    teacher?.avatarMediaId ?? null,
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [metaTitle, setMetaTitle] = useState(teacher?.seo.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(teacher?.seo.metaDescription ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(teacher?.seo.ogImageUrl ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(teacher?.seo.canonicalUrl ?? "");
  const [noindex, setNoindex] = useState(teacher?.seo.noindex ?? false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty } = useIsDirty({
    fullName,
    slug,
    jobTitleFa,
    jobTitleEn,
    excerptFa,
    excerptEn,
    bioFa,
    bioEn,
    departmentFa,
    departmentEn,
    campusId,
    phone,
    email,
    avatarMediaId,
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
    fullName.trim().length > 0 &&
    slugIsValid &&
    jobTitleFa.trim().length > 0 &&
    bioFa.trim().length > 0 &&
    !isSaving;

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedJobTitleEn = jobTitleEn.trim();
    const trimmedExcerptFa = excerptFa.trim();
    const trimmedExcerptEn = excerptEn.trim();
    const trimmedBioEn = bioEn.trim();
    const trimmedDepartmentFa = departmentFa.trim();
    const trimmedDepartmentEn = departmentEn.trim();
    const trimmedCampusId = campusId.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    const trimmedMetaTitle = metaTitle.trim();
    const trimmedMetaDescription = metaDescription.trim();
    const trimmedOgImageUrl = ogImageUrl.trim();
    const trimmedCanonicalUrl = canonicalUrl.trim();

    const seo: CmsTeacherSeoMetadataInput | undefined =
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
      fullName: fullName.trim(),
      slug: trimmedSlug,
      jobTitle: {
        fa: jobTitleFa.trim(),
        ...(trimmedJobTitleEn ? { en: trimmedJobTitleEn } : {}),
      },
      ...(trimmedExcerptFa
        ? {
            excerpt: {
              fa: trimmedExcerptFa,
              ...(trimmedExcerptEn ? { en: trimmedExcerptEn } : {}),
            },
          }
        : {}),
      bio: {
        fa: bioFa.trim(),
        ...(trimmedBioEn ? { en: trimmedBioEn } : {}),
      },
      ...(trimmedDepartmentFa
        ? {
            department: {
              fa: trimmedDepartmentFa,
              ...(trimmedDepartmentEn ? { en: trimmedDepartmentEn } : {}),
            },
          }
        : {}),
      ...(seo ? { seo } : {}),
    };

    try {
      const saved = isEdit
        ? await updateTeacher(teacher.id, {
            ...sharedFields,
            campusId: trimmedCampusId || null,
            phone: trimmedPhone || null,
            email: trimmedEmail || null,
            avatarMediaId,
          })
        : await createTeacher({
            ...sharedFields,
            ...(trimmedCampusId ? { campusId: trimmedCampusId } : {}),
            ...(trimmedPhone ? { phone: trimmedPhone } : {}),
            ...(trimmedEmail ? { email: trimmedEmail } : {}),
            ...(avatarMediaId ? { avatarMediaId } : {}),
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSaving(false);
    }
    // No `finally` resetting isSaving on success: the dialog is about
    // to be unmounted by the parent (`onSaved` closes it), same
    // reasoning as `EventForm`'s submit handler.
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "Edit teacher" : "New teacher"}
        </h2>

        <form
          className="mt-4 flex max-h-[75vh] flex-col gap-4 overflow-y-auto"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={fullNameId} className="text-sm font-medium text-slate-900">
                Full name
              </label>
              <input
                id={fullNameId}
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
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
                placeholder="e.g. jane-smith"
                aria-invalid={trimmedSlug.length > 0 && !slugIsValid}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
              {trimmedSlug.length > 0 && !slugIsValid ? (
                <p className="text-xs text-red-600">
                  Slug must be lowercase kebab-case (e.g. &ldquo;jane-smith&rdquo;).
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={jobTitleFaId} className="text-sm font-medium text-slate-900">
                Job title (Farsi)
              </label>
              <input
                id={jobTitleFaId}
                type="text"
                dir="rtl"
                required
                value={jobTitleFa}
                onChange={(e) => setJobTitleFa(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={jobTitleEnId} className="text-sm font-medium text-slate-900">
                Job title (English) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={jobTitleEnId}
                type="text"
                value={jobTitleEn}
                onChange={(e) => setJobTitleEn(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={departmentFaId} className="text-sm font-medium text-slate-900">
                Department (Farsi) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={departmentFaId}
                type="text"
                dir="rtl"
                value={departmentFa}
                onChange={(e) => setDepartmentFa(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={departmentEnId} className="text-sm font-medium text-slate-900">
                Department (English) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                id={departmentEnId}
                type="text"
                value={departmentEn}
                onChange={(e) => setDepartmentEn(e.target.value)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
              />
            </div>
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
            <label htmlFor={bioFaId} className="text-sm font-medium text-slate-900">
              Bio (Farsi)
            </label>
            <textarea
              id={bioFaId}
              dir="rtl"
              rows={8}
              required
              value={bioFa}
              onChange={(e) => setBioFa(e.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={bioEnId} className="text-sm font-medium text-slate-900">
              Bio (English) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <textarea
              id={bioEnId}
              rows={8}
              value={bioEn}
              onChange={(e) => setBioEn(e.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor={campusIdFieldId} className="text-sm font-medium text-slate-900">
              Campus ID <span className="font-normal text-slate-400">— optional, UUID</span>
            </label>
            <input
              id={campusIdFieldId}
              type="text"
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              disabled={isSaving}
              placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <TeacherAvatarField
            mediaId={avatarMediaId}
            disabled={isSaving}
            onChoose={() => setIsPickerOpen(true)}
            onClear={() => setAvatarMediaId(null)}
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
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create teacher"}
            </button>
          </div>
        </form>
      </div>

      {isPickerOpen ? (
        <TeacherMediaPickerDialog
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
 * "Choose…"/"Remove" buttons. Same layout as Events'
 * `EventFeaturedImageField`, but this is its own copy, not an import,
 * since nothing shared between those modules and Teachers yet
 * justifies promoting it (see `features/cms/components/README.md`).
 */
function TeacherAvatarField({
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
 * as Events' `EventMediaPickerDialog`. `MediaPicker` itself is only the
 * permission-gated grid; this dialog shell is specific to this field,
 * not a generic reusable one.
 */
function TeacherMediaPickerDialog({
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

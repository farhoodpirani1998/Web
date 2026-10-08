import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createFeature, updateFeature } from "./api";
import type { CmsFeature } from "./types";

/**
 * Create/edit dialog for `POST /admin/features` and
 * `PATCH /admin/features/:id`. Same plain fixed-overlay modal shape as
 * `features/cms/faq/FaqForm.tsx` (see that file's comment on why
 * there's no shared `Dialog` primitive yet).
 *
 * `title.fa`/`description.fa` are the only required fields, matching
 * `TranslatableTextDto` (`fa` mandatory, `en` optional) — `Locale.FA` is
 * `DEFAULT_LOCALE` server-side. The `en` fields are sent only when
 * non-empty so an update can still clear a previously-set `en` value:
 * `FeaturesService.update` replaces the whole `title`/`description`
 * object rather than merging keys, so omitting `en` here correctly
 * drops it.
 *
 * `icon` is a flat (non-translatable) design-token string (e.g. a
 * Lucide icon name), always sent as typed — including empty, so
 * clearing it in edit mode actually clears it, rather than being
 * silently dropped like the `en` fields above.
 */
export interface FeatureFormProps {
  /** `null` for create mode; an existing Feature for edit mode. */
  feature: CmsFeature | null;
  onCancel: () => void;
  onSaved: (feature: CmsFeature) => void;
}

export function FeatureForm({ feature, onCancel, onSaved }: FeatureFormProps) {
  const isEdit = feature !== null;

  const titleFaId = useId();
  const titleEnId = useId();
  const descriptionFaId = useId();
  const descriptionEnId = useId();
  const iconId = useId();

  const [titleFa, setTitleFa] = useState(feature?.title.fa ?? "");
  const [titleEn, setTitleEn] = useState(feature?.title.en ?? "");
  const [descriptionFa, setDescriptionFa] = useState(feature?.description.fa ?? "");
  const [descriptionEn, setDescriptionEn] = useState(feature?.description.en ?? "");
  const [icon, setIcon] = useState(feature?.icon ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty } = useIsDirty({ titleFa, titleEn, descriptionFa, descriptionEn, icon });
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard(isDirty);

  const canSubmit =
    titleFa.trim().length > 0 && descriptionFa.trim().length > 0 && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedTitleEn = titleEn.trim();
    const trimmedDescriptionEn = descriptionEn.trim();

    const payload = {
      title: {
        fa: titleFa.trim(),
        ...(trimmedTitleEn ? { en: trimmedTitleEn } : {}),
      },
      description: {
        fa: descriptionFa.trim(),
        ...(trimmedDescriptionEn ? { en: trimmedDescriptionEn } : {}),
      },
      icon: icon.trim(),
    };

    try {
      const saved = isEdit
        ? await updateFeature(feature.id, payload)
        : await createFeature(payload);
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
          {isEdit ? "Edit Feature" : "New Feature"}
        </h2>

        <form className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto" onSubmit={handleSubmit} noValidate>
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
            <label htmlFor={descriptionFaId} className="text-sm font-medium text-slate-900">
              Description (Farsi)
            </label>
            <textarea
              id={descriptionFaId}
              dir="rtl"
              rows={4}
              required
              value={descriptionFa}
              onChange={(event) => setDescriptionFa(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={descriptionEnId} className="text-sm font-medium text-slate-900">
              Description (English) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <textarea
              id={descriptionEnId}
              rows={4}
              value={descriptionEn}
              onChange={(event) => setDescriptionEn(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={iconId} className="text-sm font-medium text-slate-900">
              Icon <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={iconId}
              type="text"
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              disabled={isSaving}
              placeholder="e.g. graduation-cap"
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
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create Feature"}
            </button>
          </div>
        </form>
      </div>

      {isConfirmOpen ? (
        <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} />
      ) : null}
    </div>
  );
}

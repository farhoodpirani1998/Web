import { useId, useState, type FormEvent } from "react";

import { PermissionGate } from "@/components/ui/PermissionGate";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { updateCta } from "./api";
import type { CmsCta } from "./types";

/**
 * Inline (non-modal) edit form for `PATCH /admin/cta`. CTA is a
 * singleton — there's no create step and nothing to cancel back out
 * of, so unlike Campuses'/Features' create/edit dialog, this renders
 * directly in `CtaPage`'s body, same shape as
 * `features/cms/about/AboutForm.tsx`.
 *
 * `title.fa` and `primaryButtonLabel.fa`/`primaryButtonUrl` are the
 * only required fields, matching `UpdateCtaDto` (`fa` mandatory, `en`
 * optional on the nested `TranslatableTextDto`s — technically every
 * field is optional on the DTO itself since every field is a PATCH,
 * but a blank title/button isn't a meaningful save, so the form
 * requires them same as `AboutForm`'s equivalents). `en` fields are
 * sent only when non-empty so a save can still clear a previously-set
 * `en` value: `CtaService.update` replaces the whole translatable
 * object rather than merging keys, so omitting `en` here correctly
 * drops it.
 *
 * The secondary button's label and url travel together in this form
 * (mirroring `CtaBanner`'s own doc comment: "both undefined or both
 * set, enforced at the service layer") — leaving both blank clears the
 * secondary button entirely (sent as explicit `null`s, per
 * `UpdateCtaDto`'s clearable convention).
 *
 * `backgroundImageMediaId` is identical in shape and behavior to
 * `AboutForm`'s `imageMediaId`.
 */
export interface CtaFormProps {
  cta: CmsCta;
  onSaved: (cta: CmsCta) => void;
}

export function CtaForm({ cta, onSaved }: CtaFormProps) {
  const titleFaId = useId();
  const titleEnId = useId();
  const descriptionFaId = useId();
  const descriptionEnId = useId();
  const primaryLabelFaId = useId();
  const primaryLabelEnId = useId();
  const primaryUrlId = useId();
  const secondaryLabelFaId = useId();
  const secondaryLabelEnId = useId();
  const secondaryUrlId = useId();

  const [titleFa, setTitleFa] = useState(cta.title.fa);
  const [titleEn, setTitleEn] = useState(cta.title.en ?? "");
  const [descriptionFa, setDescriptionFa] = useState(cta.description?.fa ?? "");
  const [descriptionEn, setDescriptionEn] = useState(cta.description?.en ?? "");
  const [primaryLabelFa, setPrimaryLabelFa] = useState(cta.primaryButtonLabel.fa);
  const [primaryLabelEn, setPrimaryLabelEn] = useState(cta.primaryButtonLabel.en ?? "");
  const [primaryUrl, setPrimaryUrl] = useState(cta.primaryButtonUrl);
  const [secondaryLabelFa, setSecondaryLabelFa] = useState(cta.secondaryButtonLabel?.fa ?? "");
  const [secondaryLabelEn, setSecondaryLabelEn] = useState(cta.secondaryButtonLabel?.en ?? "");
  const [secondaryUrl, setSecondaryUrl] = useState(cta.secondaryButtonUrl ?? "");
  const [backgroundImageMediaId, setBackgroundImageMediaId] = useState<string | null>(
    cta.backgroundImageMediaId ?? null,
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty, resetBaseline } = useIsDirty({
    titleFa,
    titleEn,
    descriptionFa,
    descriptionEn,
    primaryLabelFa,
    primaryLabelEn,
    primaryUrl,
    secondaryLabelFa,
    secondaryLabelEn,
    secondaryUrl,
    backgroundImageMediaId,
  });
  // No Cancel button on this singleton, save-in-place form (see this
  // file's top comment), so `guardedAction` is never called — this is
  // only here for the `beforeunload`/in-app-route-blocker half of the
  // pattern, same as `SettingsForm`'s sections.
  const { isConfirmOpen, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);

  const canSubmit =
    titleFa.trim().length > 0 &&
    primaryLabelFa.trim().length > 0 &&
    primaryUrl.trim().length > 0 &&
    !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedTitleEn = titleEn.trim();
    const trimmedDescriptionFa = descriptionFa.trim();
    const trimmedDescriptionEn = descriptionEn.trim();
    const trimmedPrimaryLabelEn = primaryLabelEn.trim();
    const trimmedSecondaryLabelFa = secondaryLabelFa.trim();
    const trimmedSecondaryLabelEn = secondaryLabelEn.trim();
    const trimmedSecondaryUrl = secondaryUrl.trim();

    const hasSecondary = trimmedSecondaryLabelFa.length > 0 && trimmedSecondaryUrl.length > 0;

    try {
      const saved = await updateCta({
        title: {
          fa: titleFa.trim(),
          ...(trimmedTitleEn ? { en: trimmedTitleEn } : {}),
        },
        description: trimmedDescriptionFa
          ? {
              fa: trimmedDescriptionFa,
              ...(trimmedDescriptionEn ? { en: trimmedDescriptionEn } : {}),
            }
          : null,
        primaryButtonLabel: {
          fa: primaryLabelFa.trim(),
          ...(trimmedPrimaryLabelEn ? { en: trimmedPrimaryLabelEn } : {}),
        },
        primaryButtonUrl: primaryUrl.trim(),
        secondaryButtonLabel: hasSecondary
          ? {
              fa: trimmedSecondaryLabelFa,
              ...(trimmedSecondaryLabelEn ? { en: trimmedSecondaryLabelEn } : {}),
            }
          : null,
        secondaryButtonUrl: hasSecondary ? trimmedSecondaryUrl : null,
        backgroundImageMediaId,
      });
      onSaved(saved);
      resetBaseline();
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
        <label htmlFor={descriptionFaId} className="text-sm font-medium text-slate-900">
          Description (Farsi) <span className="font-normal text-slate-400">— optional</span>
        </label>
        <textarea
          id={descriptionFaId}
          dir="rtl"
          rows={3}
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
          rows={3}
          value={descriptionEn}
          onChange={(event) => setDescriptionEn(event.target.value)}
          disabled={isSaving}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
        />
      </div>

      <fieldset className="flex flex-col gap-4 rounded-md border border-slate-200 p-3">
        <legend className="px-1 text-sm font-medium text-slate-900">Primary button</legend>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={primaryLabelFaId} className="text-sm font-medium text-slate-900">
            Label (Farsi)
          </label>
          <input
            id={primaryLabelFaId}
            type="text"
            dir="rtl"
            required
            value={primaryLabelFa}
            onChange={(event) => setPrimaryLabelFa(event.target.value)}
            disabled={isSaving}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={primaryLabelEnId} className="text-sm font-medium text-slate-900">
            Label (English) <span className="font-normal text-slate-400">— optional</span>
          </label>
          <input
            id={primaryLabelEnId}
            type="text"
            value={primaryLabelEn}
            onChange={(event) => setPrimaryLabelEn(event.target.value)}
            disabled={isSaving}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={primaryUrlId} className="text-sm font-medium text-slate-900">
            URL
          </label>
          <input
            id={primaryUrlId}
            type="text"
            required
            value={primaryUrl}
            onChange={(event) => setPrimaryUrl(event.target.value)}
            disabled={isSaving}
            placeholder="/enroll or https://…"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-md border border-slate-200 p-3">
        <legend className="px-1 text-sm font-medium text-slate-900">
          Secondary button <span className="font-normal text-slate-400">— optional</span>
        </legend>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={secondaryLabelFaId} className="text-sm font-medium text-slate-900">
            Label (Farsi)
          </label>
          <input
            id={secondaryLabelFaId}
            type="text"
            dir="rtl"
            value={secondaryLabelFa}
            onChange={(event) => setSecondaryLabelFa(event.target.value)}
            disabled={isSaving}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={secondaryLabelEnId} className="text-sm font-medium text-slate-900">
            Label (English) <span className="font-normal text-slate-400">— optional</span>
          </label>
          <input
            id={secondaryLabelEnId}
            type="text"
            value={secondaryLabelEn}
            onChange={(event) => setSecondaryLabelEn(event.target.value)}
            disabled={isSaving}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={secondaryUrlId} className="text-sm font-medium text-slate-900">
            URL
          </label>
          <input
            id={secondaryUrlId}
            type="text"
            value={secondaryUrl}
            onChange={(event) => setSecondaryUrl(event.target.value)}
            disabled={isSaving}
            placeholder="/about or https://…"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
          />
        </div>

        <p className="text-xs text-slate-400">
          Leave both label and URL blank to remove the secondary button.
        </p>
      </fieldset>

      <CtaBackgroundImageField
        mediaId={backgroundImageMediaId}
        disabled={isSaving}
        onChoose={() => setIsPickerOpen(true)}
        onClear={() => setBackgroundImageMediaId(null)}
      />

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
        <CtaMediaPickerDialog
          selectedId={backgroundImageMediaId}
          onSelect={(media) => {
            setBackgroundImageMediaId(media.id);
            setIsPickerOpen(false);
          }}
          onCancel={() => setIsPickerOpen(false)}
        />
      ) : null}

      {isConfirmOpen ? (
        <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} />
      ) : null}
    </form>
  );
}

/**
 * Optional, clearable background image field row — thumbnail preview
 * plus "Choose…"/"Remove" buttons. Same layout as `AboutForm`'s
 * `AboutImageField`, but this is its own copy, not an import, since
 * nothing shared between those modules and CTA yet justifies promoting
 * it (see `features/cms/components/README.md`).
 */
function CtaBackgroundImageField({
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
 * Fixed-overlay wrapper around `MediaPicker` — same plain modal shell
 * as `AboutForm`'s `AboutMediaPickerDialog`. `MediaPicker` itself is
 * only the permission-gated grid; this dialog shell is specific to
 * this field, not a generic reusable one.
 */
function CtaMediaPickerDialog({
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

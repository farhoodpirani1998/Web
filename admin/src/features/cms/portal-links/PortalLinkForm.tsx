import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createPortalLink, updatePortalLink } from "./api";
import type { CmsPortalLink } from "./types";

/**
 * Create/edit dialog for `POST /admin/portal-links` and
 * `PATCH /admin/portal-links/:id`. Same plain fixed-overlay modal
 * shape as `features/cms/faq/FaqForm.tsx` (see that file's comment on
 * why there's no shared `Dialog` primitive yet).
 *
 * `label.fa` and `url` are the only required fields, matching
 * `CreatePortalLinkDto`/`UpdatePortalLinkDto` (`fa` mandatory on the
 * nested `TranslatableTextDto`, `url` a plain non-empty string). `en`
 * is only sent when non-empty so an update can still clear a
 * previously-set `en` value — `PortalLinksService.update` replaces the
 * whole `label` object rather than merging keys, same reasoning
 * `FaqForm` documents for `question`/`answer`.
 *
 * `icon` is a flat optional string, always sent as typed (including
 * empty, so clearing it in edit mode actually clears it) — same
 * convention `FaqForm` uses for `category`.
 *
 * `visible` defaults to `true` for new links (matching
 * `PortalLinksService.create`'s own default) and is editable via a
 * checkbox in both create and edit mode.
 */
export interface PortalLinkFormProps {
  /** `null` for create mode; an existing link for edit mode. */
  link: CmsPortalLink | null;
  onCancel: () => void;
  onSaved: (link: CmsPortalLink) => void;
}

export function PortalLinkForm({ link, onCancel, onSaved }: PortalLinkFormProps) {
  const isEdit = link !== null;

  const labelFaId = useId();
  const labelEnId = useId();
  const urlId = useId();
  const iconId = useId();
  const visibleId = useId();

  const [labelFa, setLabelFa] = useState(link?.label.fa ?? "");
  const [labelEn, setLabelEn] = useState(link?.label.en ?? "");
  const [url, setUrl] = useState(link?.url ?? "");
  const [icon, setIcon] = useState(link?.icon ?? "");
  const [visible, setVisible] = useState(link?.visible ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty } = useIsDirty({ labelFa, labelEn, url, icon, visible });
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard(isDirty);

  const canSubmit = labelFa.trim().length > 0 && url.trim().length > 0 && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedLabelEn = labelEn.trim();

    const payload = {
      label: {
        fa: labelFa.trim(),
        ...(trimmedLabelEn ? { en: trimmedLabelEn } : {}),
      },
      url: url.trim(),
      icon: icon.trim(),
      visible,
    };

    try {
      const saved = isEdit
        ? await updatePortalLink(link.id, payload)
        : await createPortalLink(payload);
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
          {isEdit ? "Edit portal link" : "New portal link"}
        </h2>

        <form className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={labelFaId} className="text-sm font-medium text-slate-900">
              Label (Farsi)
            </label>
            <input
              id={labelFaId}
              type="text"
              dir="rtl"
              required
              value={labelFa}
              onChange={(event) => setLabelFa(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={labelEnId} className="text-sm font-medium text-slate-900">
              Label (English) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={labelEnId}
              type="text"
              value={labelEn}
              onChange={(event) => setLabelEn(event.target.value)}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={urlId} className="text-sm font-medium text-slate-900">
              URL
            </label>
            <input
              id={urlId}
              type="text"
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={isSaving}
              placeholder="https://portal.example.com"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
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

          <div className="flex items-center gap-2">
            <input
              id={visibleId}
              type="checkbox"
              checked={visible}
              onChange={(event) => setVisible(event.target.checked)}
              disabled={isSaving}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor={visibleId} className="text-sm font-medium text-slate-900">
              Visible on the public site
            </label>
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
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create link"}
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

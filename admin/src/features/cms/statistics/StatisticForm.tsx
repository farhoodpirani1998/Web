import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createStatistic, updateStatistic } from "./api";
import type { CmsStatistic } from "./types";

/**
 * Create/edit dialog for `POST /admin/statistics` and
 * `PATCH /admin/statistics/:id`. Same plain fixed-overlay modal shape as
 * `features/cms/features/FeatureForm.tsx` (see that file's comment on
 * why there's no shared `Dialog` primitive yet).
 *
 * `label.fa` and `value` are the only required fields, matching
 * `CreateStatisticDto` (`label` via `TranslatableTextDto` — `fa`
 * mandatory, `en` optional; `value` a plain required number).
 * `label.en` is sent only when non-empty so an update can still clear a
 * previously-set `en` value: `StatisticsService.update` replaces the
 * whole `label` object rather than merging keys, so omitting `en` here
 * correctly drops it.
 *
 * `suffix`/`icon` are flat (non-translatable) optional strings, always
 * sent as typed — including empty, so clearing either in edit mode
 * actually clears it (`UpdateStatisticDto` treats an explicit empty
 * string the same way `UpdateFeatureDto.icon` does), rather than being
 * silently dropped like the `en` label above.
 */
export interface StatisticFormProps {
  /** `null` for create mode; an existing Statistic for edit mode. */
  statistic: CmsStatistic | null;
  onCancel: () => void;
  onSaved: (statistic: CmsStatistic) => void;
}

export function StatisticForm({ statistic, onCancel, onSaved }: StatisticFormProps) {
  const isEdit = statistic !== null;

  const labelFaId = useId();
  const labelEnId = useId();
  const valueId = useId();
  const suffixId = useId();
  const iconId = useId();

  const [labelFa, setLabelFa] = useState(statistic?.label.fa ?? "");
  const [labelEn, setLabelEn] = useState(statistic?.label.en ?? "");
  const [value, setValue] = useState(statistic ? String(statistic.value) : "");
  const [suffix, setSuffix] = useState(statistic?.suffix ?? "");
  const [icon, setIcon] = useState(statistic?.icon ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty } = useIsDirty({ labelFa, labelEn, value, suffix, icon });
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard(isDirty);

  const parsedValue = Number(value);
  const canSubmit =
    labelFa.trim().length > 0 &&
    value.trim().length > 0 &&
    Number.isFinite(parsedValue) &&
    !isSaving;

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
      value: parsedValue,
      suffix: suffix.trim(),
      icon: icon.trim(),
    };

    try {
      const saved = isEdit
        ? await updateStatistic(statistic.id, payload)
        : await createStatistic(payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsSaving(false);
    }
    // No `finally` resetting isSaving on success: the dialog is about
    // to be unmounted by the parent (`onSaved` closes it), same
    // reasoning as `FeatureForm`'s submit handler.
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "Edit Statistic" : "New Statistic"}
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
            <label htmlFor={valueId} className="text-sm font-medium text-slate-900">
              Value
            </label>
            <input
              id={valueId}
              type="number"
              step="any"
              required
              value={value}
              onChange={(event) => setValue(event.target.value)}
              disabled={isSaving}
              placeholder="e.g. 500"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={suffixId} className="text-sm font-medium text-slate-900">
              Suffix <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              id={suffixId}
              type="text"
              maxLength={20}
              value={suffix}
              onChange={(event) => setSuffix(event.target.value)}
              disabled={isSaving}
              placeholder="e.g. +, %, K"
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
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create Statistic"}
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

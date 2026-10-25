import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createAchievement, updateAchievement } from "./api";
import type { CmsAchievement } from "./types";

/**
 * Create/edit dialog for `POST /admin/achievements` and
 * `PATCH /admin/achievements/:id`. Same plain fixed-overlay modal shape
 * as `features/cms/faq/FaqForm.tsx`.
 *
 * `value` and `label.fa` are the required fields, matching
 * `CreateAchievementDto` (`fa` mandatory in `TranslatableTextDto`).
 */
export interface AchievementFormProps {
  /** `null` for create mode; an existing achievement for edit mode. */
  achievement: CmsAchievement | null;
  onCancel: () => void;
  onSaved: (achievement: CmsAchievement) => void;
}

export function AchievementForm({ achievement, onCancel, onSaved }: AchievementFormProps) {
  const isEdit = achievement !== null;

  const valueId = useId();
  const labelFaId = useId();
  const labelEnId = useId();
  const iconId = useId();

  const [value, setValue] = useState(achievement?.value ?? "");
  const [labelFa, setLabelFa] = useState(achievement?.label.fa ?? "");
  const [labelEn, setLabelEn] = useState(achievement?.label.en ?? "");
  const [icon, setIcon] = useState(achievement?.icon ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDirty } = useIsDirty({ value, labelFa, labelEn, icon });
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard(isDirty);

  const canSubmit = value.trim().length > 0 && labelFa.trim().length > 0 && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedLabelEn = labelEn.trim();
    const trimmedIcon = icon.trim();

    const payload = {
      value: value.trim(),
      label: {
        fa: labelFa.trim(),
        ...(trimmedLabelEn ? { en: trimmedLabelEn } : {}),
      },
      icon: trimmedIcon,
    };

    try {
      const saved = isEdit
        ? await updateAchievement(achievement.id, payload)
        : await createAchievement(payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
      setIsSaving(false);
    }
  }

  const inputClass =
    "rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "ویرایش افتخار" : "افتخار جدید"}
        </h2>

        <form
          className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor={valueId} className="text-sm font-medium text-slate-900">
              مقدار
            </label>
            <input
              id={valueId}
              type="text"
              dir="rtl"
              required
              value={value}
              onChange={(event) => setValue(event.target.value)}
              disabled={isSaving}
              placeholder="مثلاً ۱۵+"
              className={inputClass}
            />
            <p className="text-xs text-slate-500">
              مقدار قالب‌بندی‌شده همان‌طور که در سایت نمایش داده می‌شود — شامل ارقام، پسوند و نمادها.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={labelFaId} className="text-sm font-medium text-slate-900">
              برچسب (فارسی)
            </label>
            <input
              id={labelFaId}
              type="text"
              dir="rtl"
              required
              value={labelFa}
              onChange={(event) => setLabelFa(event.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={labelEnId} className="text-sm font-medium text-slate-900">
              برچسب (انگلیسی) <span className="font-normal text-slate-400">— اختیاری</span>
            </label>
            <input
              id={labelEnId}
              type="text"
              value={labelEn}
              onChange={(event) => setLabelEn(event.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={iconId} className="text-sm font-medium text-slate-900">
              آیکون <span className="font-normal text-slate-400">— اختیاری</span>
            </label>
            <input
              id={iconId}
              type="text"
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              disabled={isSaving}
              placeholder="مثلاً trophy"
              className={inputClass}
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
              انصراف
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "در حال ذخیره…" : isEdit ? "ذخیره تغییرات" : "ایجاد"}
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

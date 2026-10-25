import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createAdmissionEntry, updateAdmissionEntry } from "./api";
import { ADMISSION_KIND_LABELS, type AdmissionEntryKind, type CmsAdmissionEntry } from "./types";

/** Create/edit dialog for `POST/PATCH /admin/admission-entries`. */
export interface AdmissionFormProps {
  entry: CmsAdmissionEntry | null;
  onCancel: () => void;
  onSaved: (entry: CmsAdmissionEntry) => void;
}

const KIND_OPTIONS = Object.entries(ADMISSION_KIND_LABELS) as [AdmissionEntryKind, string][];

/** `step` uses `value` for its order label; `tuition_plan` uses price/period/includes. */
const KIND_FIELDS: Record<
  AdmissionEntryKind,
  { value: boolean; description: boolean; tuition: boolean }
> = {
  step: { value: true, description: true, tuition: false },
  requirement: { value: false, description: true, tuition: false },
  required_document: { value: false, description: true, tuition: false },
  tuition_plan: { value: false, description: false, tuition: true },
};

export function AdmissionForm({ entry, onCancel, onSaved }: AdmissionFormProps) {
  const isEdit = entry !== null;

  const kindId = useId();
  const titleFaId = useId();
  const titleEnId = useId();
  const valueId = useId();
  const descriptionFaId = useId();
  const priceId = useId();
  const periodId = useId();
  const includesId = useId();

  const [kind, setKind] = useState<AdmissionEntryKind>(entry?.kind ?? "step");
  const [titleFa, setTitleFa] = useState(entry?.title.fa ?? "");
  const [titleEn, setTitleEn] = useState(entry?.title.en ?? "");
  const [value, setValue] = useState(entry?.value ?? "");
  const [descriptionFa, setDescriptionFa] = useState(entry?.description?.fa ?? "");
  const [price, setPrice] = useState(entry?.price ?? "");
  const [period, setPeriod] = useState(entry?.period ?? "");
  const [includes, setIncludes] = useState((entry?.includes ?? []).join("، "));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = KIND_FIELDS[kind];

  const { isDirty } = useIsDirty({
    kind,
    titleFa,
    titleEn,
    value,
    descriptionFa,
    price,
    period,
    includes,
  });
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard(isDirty);

  const canSubmit = titleFa.trim().length > 0 && !isSaving;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsSaving(true);

    const trimmedTitleEn = titleEn.trim();
    const trimmedDescription = descriptionFa.trim();
    const includesList = includes
      .split(/[،,]/)
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      kind,
      title: { fa: titleFa.trim(), ...(trimmedTitleEn ? { en: trimmedTitleEn } : {}) },
      value: fields.value ? value.trim() : undefined,
      description: fields.description && trimmedDescription ? { fa: trimmedDescription } : undefined,
      price: fields.tuition ? price.trim() : undefined,
      period: fields.tuition ? period.trim() : undefined,
      includes: fields.tuition ? includesList : undefined,
    };

    try {
      const saved = isEdit
        ? await updateAdmissionEntry(entry.id, payload)
        : await createAdmissionEntry(payload);
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
          {isEdit ? "ویرایش ورودی پذیرش" : "ورودی جدید پذیرش"}
        </h2>

        <form
          className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor={kindId} className="text-sm font-medium text-slate-900">
              نوع (بخش صفحه)
            </label>
            <select
              id={kindId}
              value={kind}
              onChange={(event) => setKind(event.target.value as AdmissionEntryKind)}
              disabled={isSaving}
              className={inputClass}
            >
              {KIND_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={titleFaId} className="text-sm font-medium text-slate-900">
              عنوان (فارسی)
            </label>
            <input
              id={titleFaId}
              type="text"
              dir="rtl"
              required
              value={titleFa}
              onChange={(event) => setTitleFa(event.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={titleEnId} className="text-sm font-medium text-slate-900">
              عنوان (انگلیسی) <span className="font-normal text-slate-400">— اختیاری</span>
            </label>
            <input
              id={titleEnId}
              type="text"
              value={titleEn}
              onChange={(event) => setTitleEn(event.target.value)}
              disabled={isSaving}
              className={inputClass}
            />
          </div>

          {fields.value ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={valueId} className="text-sm font-medium text-slate-900">
                شماره مرحله <span className="font-normal text-slate-400">— اختیاری</span>
              </label>
              <input
                id={valueId}
                type="text"
                dir="rtl"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={isSaving}
                placeholder="مثلاً ۱"
                className={inputClass}
              />
            </div>
          ) : null}

          {fields.description ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={descriptionFaId} className="text-sm font-medium text-slate-900">
                توضیحات (فارسی) <span className="font-normal text-slate-400">— اختیاری</span>
              </label>
              <textarea
                id={descriptionFaId}
                dir="rtl"
                rows={3}
                value={descriptionFa}
                onChange={(event) => setDescriptionFa(event.target.value)}
                disabled={isSaving}
                className={inputClass}
              />
            </div>
          ) : null}

          {fields.tuition ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={priceId} className="text-sm font-medium text-slate-900">
                  مبلغ <span className="font-normal text-slate-400">— اختیاری</span>
                </label>
                <input
                  id={priceId}
                  type="text"
                  dir="rtl"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  disabled={isSaving}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={periodId} className="text-sm font-medium text-slate-900">
                  دوره پرداخت <span className="font-normal text-slate-400">— اختیاری</span>
                </label>
                <input
                  id={periodId}
                  type="text"
                  dir="rtl"
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  disabled={isSaving}
                  placeholder="مثلاً سالانه"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={includesId} className="text-sm font-medium text-slate-900">
                  موارد شامل <span className="font-normal text-slate-400">— با «،» جدا کنید</span>
                </label>
                <input
                  id={includesId}
                  type="text"
                  dir="rtl"
                  value={includes}
                  onChange={(event) => setIncludes(event.target.value)}
                  disabled={isSaving}
                  placeholder="کتاب و جزوه، بیمه حوادث"
                  className={inputClass}
                />
              </div>
            </>
          ) : null}

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

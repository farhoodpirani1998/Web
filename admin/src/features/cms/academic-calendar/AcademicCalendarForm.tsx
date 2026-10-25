import { useId, useState, type FormEvent } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createAcademicCalendarEntry, updateAcademicCalendarEntry } from "./api";
import {
  ACADEMIC_CALENDAR_KIND_LABELS,
  type AcademicCalendarEntryKind,
  type CmsAcademicCalendarEntry,
} from "./types";

/** Create/edit dialog for `POST/PATCH /admin/academic-calendar-entries`. */
export interface AcademicCalendarFormProps {
  entry: CmsAcademicCalendarEntry | null;
  onCancel: () => void;
  onSaved: (entry: CmsAcademicCalendarEntry) => void;
}

const KIND_OPTIONS = Object.entries(ACADEMIC_CALENDAR_KIND_LABELS) as [
  AcademicCalendarEntryKind,
  string,
][];

/**
 * Which extra fields each kind uses — mirrors the backend entity's
 * field roles. Only the fields relevant to the selected kind are shown
 * (and sent), so the form stays understandable despite the kinds
 * sharing one entity.
 */
const KIND_FIELDS: Record<
  AcademicCalendarEntryKind,
  { value: boolean; dateRange: boolean; date: boolean; description: boolean }
> = {
  year_stat: { value: true, dateRange: false, date: false, description: false },
  term: { value: true, dateRange: true, date: false, description: true },
  holiday: { value: false, dateRange: false, date: true, description: true },
  exam_period: { value: false, dateRange: true, date: false, description: true },
  important_date: { value: false, dateRange: false, date: true, description: true },
};

const VALUE_LABEL: Record<AcademicCalendarEntryKind, string> = {
  year_stat: "مقدار",
  term: "ترتیب",
  holiday: "",
  exam_period: "",
  important_date: "",
};

export function AcademicCalendarForm({ entry, onCancel, onSaved }: AcademicCalendarFormProps) {
  const isEdit = entry !== null;

  const kindId = useId();
  const titleFaId = useId();
  const titleEnId = useId();
  const valueId = useId();
  const dateRangeId = useId();
  const dateId = useId();
  const descriptionFaId = useId();

  const [kind, setKind] = useState<AcademicCalendarEntryKind>(entry?.kind ?? "term");
  const [titleFa, setTitleFa] = useState(entry?.title.fa ?? "");
  const [titleEn, setTitleEn] = useState(entry?.title.en ?? "");
  const [value, setValue] = useState(entry?.value ?? "");
  const [dateRange, setDateRange] = useState(entry?.dateRange ?? "");
  const [date, setDate] = useState(entry?.date ?? "");
  const [descriptionFa, setDescriptionFa] = useState(entry?.description?.fa ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = KIND_FIELDS[kind];

  const { isDirty } = useIsDirty({
    kind,
    titleFa,
    titleEn,
    value,
    dateRange,
    date,
    descriptionFa,
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

    const payload = {
      kind,
      title: { fa: titleFa.trim(), ...(trimmedTitleEn ? { en: trimmedTitleEn } : {}) },
      value: fields.value ? value.trim() : undefined,
      dateRange: fields.dateRange ? dateRange.trim() : undefined,
      date: fields.date ? date.trim() : undefined,
      description: fields.description
        ? { fa: trimmedDescription }
        : undefined,
    };

    try {
      const saved = isEdit
        ? await updateAcademicCalendarEntry(entry.id, payload)
        : await createAcademicCalendarEntry(payload);
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
          {isEdit ? "ویرایش ورودی تقویم" : "ورودی جدید تقویم"}
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
              onChange={(event) => setKind(event.target.value as AcademicCalendarEntryKind)}
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
                {VALUE_LABEL[kind]}{" "}
                <span className="font-normal text-slate-400">— اختیاری</span>
              </label>
              <input
                id={valueId}
                type="text"
                dir="rtl"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={isSaving}
                className={inputClass}
              />
            </div>
          ) : null}

          {fields.dateRange ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={dateRangeId} className="text-sm font-medium text-slate-900">
                بازه تاریخ <span className="font-normal text-slate-400">— اختیاری</span>
              </label>
              <input
                id={dateRangeId}
                type="text"
                dir="rtl"
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value)}
                disabled={isSaving}
                placeholder="مثلاً ۱۵ شهریور تا ۳۰ دی ۱۴۰۴"
                className={inputClass}
              />
            </div>
          ) : null}

          {fields.date ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={dateId} className="text-sm font-medium text-slate-900">
                تاریخ <span className="font-normal text-slate-400">— اختیاری</span>
              </label>
              <input
                id={dateId}
                type="text"
                dir="rtl"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={isSaving}
                placeholder="مثلاً ۱۰ مهر ۱۴۰۴"
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

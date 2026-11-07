/**
 * Modern create/edit form for Academic Calendar using React Hook Form + Zod.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createAcademicCalendarEntry, updateAcademicCalendarEntry } from "./api";
import { kindSchema, translatableSchema, createAcademicCalendarPayloadSchema, updateAcademicCalendarPayloadSchema } from "./schema";
import { ACADEMIC_CALENDAR_KIND_LABELS, type CmsAcademicCalendarEntry, type AcademicCalendarEntryKind } from "./types";

export interface AcademicCalendarFormProps {
  entry: CmsAcademicCalendarEntry | null;
  onCancel: () => void;
  onSaved: (entry: CmsAcademicCalendarEntry) => void;
}

const formSchema = z.object({
  kind: kindSchema,
  titleFa: z.string().min(1, "عنوان فارسی الزامی است"),
  titleEn: z.string().optional(),
  value: z.string().optional(),
  dateRange: z.string().optional(),
  date: z.string().optional(),
  descriptionFa: z.string().optional(),
  descriptionEn: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const KIND_OPTIONS = Object.entries(ACADEMIC_CALENDAR_KIND_LABELS) as [AcademicCalendarEntryKind, string][];

export function AcademicCalendarForm({ entry, onCancel, onSaved }: AcademicCalendarFormProps) {
  const isEdit = entry !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: entry
      ? {
          kind: entry.kind,
          titleFa: entry.title.fa ?? "",
          titleEn: entry.title.en ?? "",
          value: entry.value ?? "",
          dateRange: entry.dateRange ?? "",
          date: entry.date ?? "",
          descriptionFa: entry.description?.fa ?? "",
          descriptionEn: entry.description?.en ?? "",
        }
      : {
          kind: "important_date",
          titleFa: "",
          titleEn: "",
          value: "",
          dateRange: "",
          date: "",
          descriptionFa: "",
          descriptionEn: "",
        },
  });

  const [saveError, setSaveError] = useState<string | null>(null);
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);

  async function onSubmit(data: FormData) {
    setSaveError(null);
    try {
      if (isEdit && entry) {
        const saved = await updateAcademicCalendarEntry(entry.id, {
          kind: data.kind,
          title: { fa: data.titleFa, en: data.titleEn || undefined },
          value: data.value || undefined,
          dateRange: data.dateRange || undefined,
          date: data.date || undefined,
          description: (data.descriptionFa || data.descriptionEn) ? { fa: data.descriptionFa || undefined, en: data.descriptionEn || undefined } : undefined,
        });
        onSaved(saved);
      } else {
        const saved = await createAcademicCalendarEntry({
          kind: data.kind,
          title: { fa: data.titleFa, en: data.titleEn || undefined },
          value: data.value || undefined,
          dateRange: data.dateRange || undefined,
          date: data.date || undefined,
          description: (data.descriptionFa || data.descriptionEn) ? { fa: data.descriptionFa || undefined, en: data.descriptionEn || undefined } : undefined,
        });
        onSaved(saved);
      }
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
    }
  }

  return (
    <form dir="rtl" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="kind" className="block text-sm font-medium">نوع</label>
          <select id="kind" {...register("kind")} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            {KIND_OPTIONS.map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
          {errors.kind && <p className="mt-1 text-xs text-red-600">{errors.kind.message}</p>}
        </div>
        <div>
          <label htmlFor="titleFa" className="block text-sm font-medium">عنوان فارسی</label>
          <input id="titleFa" {...register("titleFa")} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          {errors.titleFa && <p className="mt-1 text-xs text-red-600">{errors.titleFa.message}</p>}
        </div>
        <div>
          <label htmlFor="titleEn" className="block text-sm font-medium">عنوان انگلیسی</label>
          <input id="titleEn" {...register("titleEn")} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium">تاریخ</label>
          <input id="date" type="date" {...register("date")} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium">بازه زمانی</label>
          <input id="dateRange" {...register("dateRange")} placeholder="مثلاً 1403/01/01 تا 1403/06/30" className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label htmlFor="value" className="block text-sm font-medium">مقدار</label>
          <input id="value" {...register("value")} placeholder="مثلاً 20 ساعت" className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
      </div>
      <div>
        <label htmlFor="descriptionFa" className="block text-sm font-medium">توضیحات فارسی</label>
        <textarea id="descriptionFa" rows={3} {...register("descriptionFa")} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>
      <div>
        <label htmlFor="descriptionEn" className="block text-sm font-medium">توضیحات انگلیسی</label>
        <textarea id="descriptionEn" rows={3} {...register("descriptionEn")} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>
      {saveError && <p className="text-sm text-red-600">{saveError}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">{isEdit ? "ذخیره" : "ایجاد"}</button>
        <button type="button" onClick={onCancel} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">لغو</button>
      </div>
      <UnsavedChangesDialog open={isConfirmOpen} onConfirm={confirmLeave} onCancel={cancelLeave} />
    </form>
  );
}

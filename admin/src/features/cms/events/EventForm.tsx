import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { CampusSelect } from "@/features/cms/campuses";
import type { ApiError } from "@/lib/apiError";
import { createCalendarEvent, updateCalendarEvent } from "./api";
import { eventFormSchema, formDataToCreatePayload, formDataToUpdatePayload, eventToFormData, type EventFormData } from "./schema";
import type { CmsCalendarEvent } from "./types";
import type { z } from "zod";

export interface EventFormProps {
  event: CmsCalendarEvent | null;
  onCancel: () => void;
  onSaved: (event: CmsCalendarEvent) => void;
}

export function EventForm({ event, onCancel, onSaved }: EventFormProps) {
  const isEdit = event !== null;
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<
    z.input<typeof eventFormSchema>,
    unknown,
    EventFormData
  >({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event ? eventToFormData(event) : {
      titleFa: "", titleEn: "", slug: "", excerptFa: "", excerptEn: "", bodyFa: "", bodyEn: "",
      category: "", tags: "", locationFa: "", locationEn: "", locationUrl: "",
      campusId: "",
      startAt: "", endAt: "", allDay: false, featuredImageMediaId: null,
      metaTitle: "", metaDescription: "", ogImageUrl: "", canonicalUrl: "", noindex: false,
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const campusId = watch("campusId") ?? "";

  const onSubmit = async (data: EventFormData) => {
    setIsSaving(true); setError(null);
    try {
      const result =
        isEdit && event
          ? await updateCalendarEvent(event.id, formDataToUpdatePayload(data))
          : await createCalendarEvent(formDataToCreatePayload(data));
      onSaved(result);
    } catch (e) {
      setError((e as ApiError).message || "خطا");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form dir="rtl" onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <h2 className="text-lg font-bold">{isEdit ? "ویرایش رویداد" : "رویداد جدید"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="titleFa">عنوان فارسی</label>
          <input id="titleFa" {...register("titleFa")} aria-invalid={!!errors.titleFa} aria-describedby={errors.titleFa ? "titleFa-error" : undefined} className="w-full border rounded px-2 py-1" />
          {errors.titleFa && <span id="titleFa-error" className="text-red-600 text-xs">{errors.titleFa.message}</span>}
        </div>
        <CampusSelect
          id="event-campus"
          label="پردیس"
          value={campusId}
          onChange={(value) => setValue("campusId", value, { shouldDirty: true })}
        />
        <div>
          <label htmlFor="titleEn">عنوان انگلیسی</label>
          <input id="titleEn" dir="ltr" {...register("titleEn")} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label htmlFor="slug">نامک</label>
          <input id="slug" dir="ltr" {...register("slug")} aria-invalid={!!errors.slug} aria-describedby={errors.slug ? "slug-error" : undefined} className="w-full border rounded px-2 py-1" />
          {errors.slug && <span id="slug-error" className="text-red-600 text-xs">{errors.slug.message}</span>}
        </div>
        <div>
          <label htmlFor="category">دسته‌بندی</label>
          <input id="category" dir="auto" {...register("category")} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label htmlFor="startAt">زمان شروع</label>
          <input id="startAt" type="datetime-local" dir="ltr" {...register("startAt")} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label htmlFor="endAt">زمان پایان</label>
          <input id="endAt" type="datetime-local" dir="ltr" {...register("endAt")} className="w-full border rounded px-2 py-1" />
        </div>
      </div>
      <div>
        <label htmlFor="bodyFa">متن فارسی</label>
        <textarea id="bodyFa" dir="rtl" {...register("bodyFa")} rows={4} aria-invalid={!!errors.bodyFa} aria-describedby={errors.bodyFa ? "bodyFa-error" : undefined} className="w-full border rounded px-2 py-1" />
        {errors.bodyFa && <span id="bodyFa-error" className="text-red-600 text-xs">{errors.bodyFa.message}</span>}
      </div>
      {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1 border rounded">لغو</button>
        <button type="submit" disabled={isSaving} className="px-3 py-1 bg-blue-700 text-white rounded">{isEdit ? "ذخیره" : "ایجاد"}</button>
      </div>
    </form>
  );
}

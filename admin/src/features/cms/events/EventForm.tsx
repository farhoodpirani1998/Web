import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useId, useState } from "react";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";
import { createCalendarEvent, updateCalendarEvent } from "./api";
import { eventFormSchema, formDataToCreatePayload, formDataToUpdatePayload, eventToFormData, type EventFormData } from "./schema";
import type { CmsCalendarEvent } from "./types";

export interface EventFormProps {
  event: CmsCalendarEvent | null;
  onCancel: () => void;
  onSaved: (event: CmsCalendarEvent) => void;
}

export function EventForm({ event, onCancel, onSaved }: EventFormProps) {
  const isEdit = event !== null;
  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting }, setValue, watch, reset } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event ? eventToFormData(event) : {
      titleFa: "", titleEn: "", slug: "", excerptFa: "", excerptEn: "", bodyFa: "", bodyEn: "",
      category: "", tags: "", locationFa: "", locationEn: "", locationUrl: "",
      startAt: "", endAt: "", allDay: false, featuredImageMediaId: null,
      metaTitle: "", metaDescription: "", ogImageUrl: "", canonicalUrl: "", noindex: false,
    },
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (data: EventFormData) => {
    setIsSaving(true); setError(null);
    try {
      const payload = isEdit ? formDataToUpdatePayload(data) : formDataToCreatePayload(data);
      const result = isEdit ? await updateCalendarEvent(event!.id, payload as any) : await createCalendarEvent(payload as any);
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
          <input id="titleFa" {...register("titleFa")} className="w-full border rounded px-2 py-1" />
          {errors.titleFa && <span className="text-red-600 text-xs">{errors.titleFa.message}</span>}
        </div>
        <div>
          <label htmlFor="titleEn">عنوان انگلیسی</label>
          <input id="titleEn" {...register("titleEn")} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label htmlFor="slug">نامک</label>
          <input id="slug" {...register("slug")} className="w-full border rounded px-2 py-1" />
          {errors.slug && <span className="text-red-600 text-xs">{errors.slug.message}</span>}
        </div>
        <div>
          <label htmlFor="category">دسته‌بندی</label>
          <input id="category" {...register("category")} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label htmlFor="startAt">زمان شروع</label>
          <input id="startAt" type="datetime-local" {...register("startAt")} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label htmlFor="endAt">زمان پایان</label>
          <input id="endAt" type="datetime-local" {...register("endAt")} className="w-full border rounded px-2 py-1" />
        </div>
      </div>
      <div>
        <label htmlFor="bodyFa">متن فارسی</label>
        <textarea id="bodyFa" {...register("bodyFa")} rows={4} className="w-full border rounded px-2 py-1" />
        {errors.bodyFa && <span className="text-red-600 text-xs">{errors.bodyFa.message}</span>}
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1 border rounded">لغو</button>
        <button type="submit" disabled={isSaving} className="px-3 py-1 bg-blue-700 text-white rounded">{isEdit ? "ذخیره" : "ایجاد"}</button>
      </div>
    </form>
  );
}

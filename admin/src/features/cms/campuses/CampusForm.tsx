/** Modern RHF+Zod campus form — replaces old useState form. Persian/RTL preserved. */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";
import { createCampus, updateCampus } from "./api";
import { campusFormSchema, formDataToCreatePayload, formDataToUpdatePayload, type CampusFormData, campusToFormData } from "./schema";
import type { CmsCampus } from "./types";

export interface CampusFormProps { campus: CmsCampus | null; onCancel: () => void; onSaved: (c: CmsCampus) => void; }

export function CampusForm({ campus, onCancel, onSaved }: CampusFormProps) {
  const isEdit = campus !== null;
  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting }, watch, reset, setValue } = useForm<CampusFormData>({
    resolver: zodResolver(campusFormSchema),
    defaultValues: campus ? campusToFormData(campus) : {
      titleFa: "", titleEn: "", slug: "", excerptFa: "", excerptEn: "",
      bodyFa: "", bodyEn: "", addressFa: "", addressEn: "", mapUrl: "",
      phone: "", email: "", featuredImageMediaId: null,
      metaTitle: "", metaDescription: "", ogImageUrl: "", canonicalUrl: "", noindex: false,
    },
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);
  const mediaId = watch("featuredImageMediaId");
  async function onSubmit(data: CampusFormData) {
    setSaveError(null);
    try {
      if (isEdit && campus) { const saved = await updateCampus(campus.id, formDataToUpdatePayload(data)); onSaved(saved); }
      else { const saved = await createCampus(formDataToCreatePayload(data)); onSaved(saved); }
      reset(); onCancel();
    } catch (e) { setSaveError(e instanceof ApiError ? e.message : "خطا در ذخیره"); }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} dir="rtl" className="space-y-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm" aria-label="فرم پردیس">
      <h2 className="text-lg font-bold text-slate-800">{isEdit ? "ویرایش پردیس" : "افزودن پردیس"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label htmlFor="titleFa" className="block text-sm font-medium text-slate-700">عنوان (فارسی)</label><input id="titleFa" {...register("titleFa")} className="w-full border rounded px-3 py-2 text-sm" />{errors.titleFa && <span className="text-xs text-red-600">{errors.titleFa.message}</span>}</div>
        <div><label htmlFor="titleEn" className="block text-sm font-medium text-slate-700">عنوان (انگلیسی)</label><input id="titleEn" {...register("titleEn")} className="w-full border rounded px-3 py-2 text-sm" /></div>
        <div><label htmlFor="slug" className="block text-sm font-medium text-slate-700">نامک</label><input id="slug" {...register("slug")} className="w-full border rounded px-3 py-2 text-sm" />{errors.slug && <span className="text-xs text-red-600">{errors.slug.message}</span>}</div>
        <div><label htmlFor="excerptFa" className="block text-sm font-medium text-slate-700">چکیده (فارسی)</label><input id="excerptFa" {...register("excerptFa")} className="w-full border rounded px-3 py-2 text-sm" /></div>
      </div>
      <div><label htmlFor="bodyFa" className="block text-sm font-medium text-slate-700">متن (فارسی)</label><textarea id="bodyFa" {...register("bodyFa")} rows={4} className="w-full border rounded px-3 py-2 text-sm" />{errors.bodyFa && <span className="text-xs text-red-600">{errors.bodyFa.message}</span>}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label htmlFor="addressFa" className="block text-sm font-medium text-slate-700">نشانی (فارسی)</label><input id="addressFa" {...register("addressFa")} className="w-full border rounded px-3 py-2 text-sm" /></div>
        <div><label htmlFor="mapUrl" className="block text-sm font-medium text-slate-700">لینک نقشه</label><input id="mapUrl" {...register("mapUrl")} className="w-full border rounded px-3 py-2 text-sm" /></div>
        <div><label htmlFor="phone" className="block text-sm font-medium text-slate-700">تلفن</label><input id="phone" {...register("phone")} className="w-full border rounded px-3 py-2 text-sm" /></div>
        <div><label htmlFor="email" className="block text-sm font-medium text-slate-700">ایمیل</label><input id="email" type="email" {...register("email")} className="w-full border rounded px-3 py-2 text-sm" />{errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}</div>
      </div>
      <div className="flex items-center gap-2"><button type="button" onClick={() => setIsPickerOpen(true)} className="px-3 py-2 border rounded text-sm">انتخاب تصویر</button>{mediaId && <span className="text-xs text-slate-500">{mediaId}</span>}</div>
      <div className="border-t pt-3"><h3 className="font-semibold text-sm mb-2">SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input placeholder="metaTitle" {...register("metaTitle")} className="w-full border rounded px-3 py-2 text-sm" />
        <input placeholder="metaDescription" {...register("metaDescription")} className="w-full border rounded px-3 py-2 text-sm" />
        <input placeholder="ogImageUrl" {...register("ogImageUrl")} className="w-full border rounded px-3 py-2 text-sm" />
        <input placeholder="canonicalUrl" {...register("canonicalUrl")} className="w-full border rounded px-3 py-2 text-sm" />
      </div><label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("noindex")} /> noindex</label></div>
      {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
      <div className="flex gap-2 justify-end"><button type="button" onClick={onCancel} className="px-4 py-2 border rounded text-sm">لغو</button><button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm">{isEdit ? "ذخیره تغییرات" : "ایجاد"}</button></div>
      <UnsavedChangesDialog open={isConfirmOpen} onConfirm={guardedAction} onCancel={cancelLeave} />
    </form>
  );
}

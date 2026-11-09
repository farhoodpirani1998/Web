/** Modern RHF+Zod campus form — replaces old useState form. Persian/RTL preserved. */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import type { z } from "zod";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker } from "@/features/cms/media";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";
import { createCampus, updateCampus } from "./api";
import { CampusMapEmbed } from "./CampusMap";
import {
  campusFormSchema,
  formDataToCreatePayload,
  formDataToUpdatePayload,
  type CampusFormData,
  campusToFormData,
} from "./schema";
import type { CmsCampus } from "./types";

export interface CampusFormProps {
  campus: CmsCampus | null;
  onCancel: () => void;
  onSaved: (c: CmsCampus) => void;
}

export function CampusForm({ campus, onCancel, onSaved }: CampusFormProps) {
  const isEdit = campus !== null;
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm<z.input<typeof campusFormSchema>, unknown, CampusFormData>({
    resolver: zodResolver(campusFormSchema),
    defaultValues: campus
      ? campusToFormData(campus)
      : {
          titleFa: "",
          titleEn: "",
          slug: "",
          excerptFa: "",
          excerptEn: "",
          bodyFa: "",
          bodyEn: "",
          addressFa: "",
          addressEn: "",
          mapUrl: "",
          latitude: "",
          longitude: "",
          phone: "",
          email: "",
          gradeLevels: "",
          featuredImageMediaId: null,
          metaTitle: "",
          metaDescription: "",
          ogImageUrl: "",
          canonicalUrl: "",
          noindex: false,
        },
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(pickerRef, isPickerOpen, () => setIsPickerOpen(false));
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } =
    useUnsavedChangesGuard(isDirty);
  const mediaId = watch("featuredImageMediaId");
  const mapUrl = watch("mapUrl");
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  async function onSubmit(data: CampusFormData) {
    setSaveError(null);
    try {
      if (isEdit && campus) {
        const saved = await updateCampus(campus.id, formDataToUpdatePayload(data));
        onSaved(saved);
      } else {
        const saved = await createCampus(formDataToCreatePayload(data));
        onSaved(saved);
      }
      reset();
      onCancel();
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "خطا در ذخیره");
    }
  }
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      dir="rtl"
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      aria-label="فرم پردیس"
    >
      <h2 className="text-lg font-bold text-slate-800">
        {isEdit ? "ویرایش پردیس" : "افزودن پردیس"}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="titleFa" className="block text-sm font-medium text-slate-700">
            عنوان (فارسی)
          </label>
          <input
            id="titleFa"
            dir="rtl"
            {...register("titleFa")}
            aria-invalid={!!errors.titleFa}
            aria-describedby={errors.titleFa ? "titleFa-error" : undefined}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {errors.titleFa && (
            <span id="titleFa-error" className="text-xs text-red-600">
              {errors.titleFa.message}
            </span>
          )}
        </div>
        <div>
          <label htmlFor="titleEn" className="block text-sm font-medium text-slate-700">
            عنوان (انگلیسی)
          </label>
          <input
            id="titleEn"
            dir="ltr"
            {...register("titleEn")}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-slate-700">
            نامک
          </label>
          <input
            id="slug"
            dir="ltr"
            {...register("slug")}
            aria-invalid={!!errors.slug}
            aria-describedby={errors.slug ? "slug-error" : undefined}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {errors.slug && (
            <span id="slug-error" className="text-xs text-red-600">
              {errors.slug.message}
            </span>
          )}
        </div>
        <div>
          <label htmlFor="excerptFa" className="block text-sm font-medium text-slate-700">
            چکیده (فارسی)
          </label>
          <input
            id="excerptFa"
            {...register("excerptFa")}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="bodyFa" className="block text-sm font-medium text-slate-700">
          متن (فارسی)
        </label>
        <textarea
          id="bodyFa"
          dir="rtl"
          {...register("bodyFa")}
          rows={4}
          aria-invalid={!!errors.bodyFa}
          aria-describedby={errors.bodyFa ? "bodyFa-error" : undefined}
          className="w-full rounded border px-3 py-2 text-sm"
        />
        {errors.bodyFa && (
          <span id="bodyFa-error" className="text-xs text-red-600">
            {errors.bodyFa.message}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="addressFa" className="block text-sm font-medium text-slate-700">
            نشانی (فارسی)
          </label>
          <input
            id="addressFa"
            {...register("addressFa")}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="mapUrl" className="block text-sm font-medium text-slate-700">
            لینک نقشه
          </label>
          <input
            id="mapUrl"
            dir="ltr"
            {...register("mapUrl")}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-slate-700">
            عرض جغرافیایی (−۹۰ تا ۹۰)
          </label>
          <input
            id="latitude"
            type="number"
            min="-90"
            max="90"
            step="any"
            dir="ltr"
            {...register("latitude")}
            aria-invalid={!!errors.latitude}
            aria-describedby={errors.latitude ? "latitude-error" : undefined}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {errors.latitude && (
            <span id="latitude-error" className="text-xs text-red-600">
              {errors.latitude.message}
            </span>
          )}
        </div>
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-slate-700">
            طول جغرافیایی (−۱۸۰ تا ۱۸۰)
          </label>
          <input
            id="longitude"
            type="number"
            min="-180"
            max="180"
            step="any"
            dir="ltr"
            {...register("longitude")}
            aria-invalid={!!errors.longitude}
            aria-describedby={errors.longitude ? "longitude-error" : undefined}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {errors.longitude && (
            <span id="longitude-error" className="text-xs text-red-600">
              {errors.longitude.message}
            </span>
          )}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            تلفن
          </label>
          <input
            id="phone"
            dir="ltr"
            {...register("phone")}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            ایمیل
          </label>
          <input
            id="email"
            type="email"
            dir="ltr"
            {...register("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {errors.email && (
            <span id="email-error" className="text-xs text-red-600">
              {errors.email.message}
            </span>
          )}
        </div>
        <div>
          <label htmlFor="gradeLevels" className="block text-sm font-medium text-slate-700">
            پایه‌های تحصیلی
          </label>
          <textarea
            id="gradeLevels"
            {...register("gradeLevels")}
            rows={2}
            placeholder="پایه اول، پایه دوم"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <span className="text-xs text-slate-500">پایه‌ها را با ویرگول یا خط جدید جدا کنید.</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="rounded border px-3 py-2 text-sm"
        >
          انتخاب تصویر
        </button>
        {mediaId && <span className="text-xs text-slate-500">{mediaId}</span>}
      </div>
      <div className="border-t pt-3">
        <h3 className="mb-2 text-sm font-semibold">بهینه‌سازی برای موتورهای جست‌وجو</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label htmlFor="metaTitle" className="text-sm">
            عنوان متا
            <input
              id="metaTitle"
              {...register("metaTitle")}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </label>
          <label htmlFor="metaDescription" className="text-sm">
            توضیحات متا
            <input
              id="metaDescription"
              {...register("metaDescription")}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </label>
          <label htmlFor="ogImageUrl" className="text-sm">
            نشانی تصویر شبکه‌های اجتماعی
            <input
              id="ogImageUrl"
              dir="ltr"
              {...register("ogImageUrl")}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </label>
          <label htmlFor="canonicalUrl" className="text-sm">
            نشانی اصلی صفحه
            <input
              id="canonicalUrl"
              dir="ltr"
              {...register("canonicalUrl")}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("noindex")} /> جلوگیری از نمایه‌سازی
        </label>
      </div>
      {mapUrl || (latitude && longitude) ? (
        <CampusMapEmbed
          mapUrl={mapUrl}
          latitude={latitude ? Number(latitude) : undefined}
          longitude={longitude ? Number(longitude) : undefined}
          title="موقعیت پردیس"
        />
      ) : null}
      {saveError && (
        <p role="alert" className="text-sm text-red-600">
          {saveError}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => guardedAction(onCancel)}
          className="rounded border px-4 py-2 text-sm"
        >
          لغو
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-indigo-600 px-4 py-2 text-sm text-white"
        >
          {isSubmitting ? "در حال ذخیره…" : isEdit ? "ذخیره تغییرات" : "ایجاد"}
        </button>
      </div>
      {isPickerOpen ? (
        <div
          ref={pickerRef}
          className="fixed inset-0 z-[60] overflow-y-auto bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="انتخاب تصویر"
          tabIndex={-1}
        >
          <div className="mx-auto max-w-3xl rounded-lg bg-white p-4">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="rounded border px-3 py-1 text-sm"
              >
                بستن
              </button>
            </div>
            <MediaPicker
              selectedId={mediaId}
              onSelect={(media) => {
                setValue("featuredImageMediaId", media.id, { shouldDirty: true });
                setIsPickerOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}
      {isConfirmOpen ? (
        <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} />
      ) : null}
    </form>
  );
}

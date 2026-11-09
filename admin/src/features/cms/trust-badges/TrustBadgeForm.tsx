import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MediaPicker } from "@/features/cms/media";
import { ApiError } from "@/lib/apiError";
import { createTrustBadge, updateTrustBadge } from "./api";
import {
  formDataToCreatePayload,
  formDataToUpdatePayload,
  trustBadgeFormSchema,
  trustBadgeToFormData,
  type TrustBadgeFormData,
} from "./schema";
import type { CmsTrustBadge } from "./types";

export interface TrustBadgeFormProps {
  trustBadge: CmsTrustBadge | null;
  onCancel: () => void;
  onSaved: () => void;
}

export function TrustBadgeForm({
  trustBadge,
  onCancel,
  onSaved,
}: TrustBadgeFormProps) {
  const [saveError, setSaveError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TrustBadgeFormData>({
    resolver: zodResolver(trustBadgeFormSchema),
    defaultValues: trustBadge
      ? trustBadgeToFormData(trustBadge)
      : { nameFa: "", nameEn: "", url: "", imageMediaId: "" },
  });

  useEffect(() => {
    if (trustBadge) reset(trustBadgeToFormData(trustBadge));
  }, [trustBadge, reset]);

  const imageMediaId = watch("imageMediaId");

  async function onSubmit(data: TrustBadgeFormData) {
    setSaveError(null);
    try {
      if (trustBadge) {
        await updateTrustBadge(
          trustBadge.id,
          formDataToUpdatePayload(data),
        );
      } else {
        await createTrustBadge(formDataToCreatePayload(data));
      }
      onSaved();
    } catch (error) {
      setSaveError(
        error instanceof ApiError
          ? error.message
          : "ذخیره نشان اعتماد با خطا روبه‌رو شد.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      dir="rtl"
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-4"
      aria-label="فرم نشان اعتماد"
    >
      <h2 className="text-lg font-semibold">
        {trustBadge ? "ویرایش نشان اعتماد" : "افزودن نشان اعتماد"}
      </h2>
      <div>
        <label htmlFor="trust-badge-name-fa">عنوان فارسی</label>
        <input
          id="trust-badge-name-fa"
          {...register("nameFa")}
          className="block w-full rounded-md border border-slate-300 px-3 py-2"
          aria-invalid={!!errors.nameFa}
        />
        {errors.nameFa ? (
          <p role="alert" className="text-xs text-red-600">
            {errors.nameFa.message}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="trust-badge-name-en">عنوان انگلیسی</label>
        <input
          id="trust-badge-name-en"
          dir="ltr"
          {...register("nameEn")}
          className="block w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="trust-badge-url">پیوند تأیید (اختیاری)</label>
        <input
          id="trust-badge-url"
          dir="ltr"
          type="url"
          {...register("url")}
          className="block w-full rounded-md border border-slate-300 px-3 py-2"
          aria-invalid={!!errors.url}
        />
        {errors.url ? (
          <p role="alert" className="text-xs text-red-600">
            {errors.url.message}
          </p>
        ) : null}
      </div>
      <div>
        <p className="text-sm font-medium">تصویر نشان</p>
        <MediaPicker
          selectedId={imageMediaId}
          onSelect={(media) =>
            setValue("imageMediaId", media.id, { shouldValidate: true })
          }
          fallback={
            <p className="text-sm text-slate-500">
              برای انتخاب تصویر به مجوز مدیریت رسانه نیاز دارید.
            </p>
          }
        />
        {errors.imageMediaId ? (
          <p role="alert" className="text-xs text-red-600">
            {errors.imageMediaId.message}
          </p>
        ) : null}
      </div>
      {saveError ? (
        <p role="alert" className="text-sm text-red-600">
          {saveError}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          ذخیره
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm"
        >
          لغو
        </button>
      </div>
    </form>
  );
}

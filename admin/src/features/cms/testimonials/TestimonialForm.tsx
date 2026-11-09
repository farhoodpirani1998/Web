import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useState } from "react";

import { createTestimonial, updateTestimonial } from "./api";
import { ApiError } from "@/lib/apiError";
import { MediaPicker } from "@/features/cms/media";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

import { formDataToCreatePayload, formDataToUpdatePayload, testimonialFormSchema, type TestimonialFormData, testimonialToFormData } from "./schema";
import type { CmsTestimonial } from "./types";

export interface TestimonialFormProps {
  testimonial: CmsTestimonial | null;
  onCancel: () => void;
  onSaved: (testimonial: CmsTestimonial) => void;
}

export function TestimonialForm({ testimonial, onCancel, onSaved }: TestimonialFormProps) {
  const [saveError, setSaveError] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty, isSubmitting } } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: testimonial ? testimonialToFormData(testimonial) : { authorName: "", authorRoleFa: "", authorRoleEn: "", contentFa: "", contentEn: "", rating: "", avatarMediaId: null, isFeatured: false },
  });

  useEffect(() => { if (testimonial) reset(testimonialToFormData(testimonial)); }, [testimonial, reset]);

  const avatarMediaId = watch("avatarMediaId");
  const { isDirty: mediaDirty } = useIsDirty({ avatarMediaId });
  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty || mediaDirty);

  const onSubmit = async (data: TestimonialFormData) => {
    setSaveError(null);
    try {
      const saved = testimonial
        ? await updateTestimonial(testimonial.id, formDataToUpdatePayload(data))
        : await createTestimonial(formDataToCreatePayload(data));
      onSaved(saved);
    } catch (error) {
      setSaveError(error instanceof ApiError ? error.message : "ذخیره نظر با خطا روبه‌رو شد.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} dir="rtl" className="space-y-4" aria-label="فرم نظر مشتری">
      <div>
        <label htmlFor="authorName">نام نویسنده</label>
        <input id="authorName" {...register("authorName")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500" aria-invalid={!!errors.authorName} aria-describedby={errors.authorName ? "authorName-error" : undefined} />
        {errors.authorName && <span id="authorName-error" className="text-xs text-red-600">{errors.authorName.message}</span>}
      </div>
      <div>
        <label htmlFor="authorRoleFa">نقش نویسنده (فارسی)</label>
        <input id="authorRoleFa" dir="rtl" {...register("authorRoleFa")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500" />
      </div>
      <div>
        <label htmlFor="authorRoleEn">نقش نویسنده (انگلیسی)</label>
        <input id="authorRoleEn" dir="ltr" {...register("authorRoleEn")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500" />
      </div>
      <div>
        <label htmlFor="contentFa">متن نظر (فارسی)</label>
        <textarea id="contentFa" dir="rtl" rows={4} {...register("contentFa")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500" aria-invalid={!!errors.contentFa} aria-describedby={errors.contentFa ? "contentFa-error" : undefined} />
        {errors.contentFa && <span id="contentFa-error" className="text-xs text-red-600">{errors.contentFa.message}</span>}
      </div>
      <div>
        <label htmlFor="contentEn">متن نظر (انگلیسی)</label>
        <textarea id="contentEn" dir="ltr" rows={4} {...register("contentEn")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500" />
      </div>
      <div>
        <label htmlFor="rating">امتیاز (۱ تا ۵)</label>
        <input id="rating" {...register("rating")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500" />
      </div>
      <div>
        <p className="text-sm font-medium">تصویر پروفایل</p>
        <MediaPicker
          selectedId={avatarMediaId}
          onSelect={(media) => setValue("avatarMediaId", media.id)}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isFeatured")} />
        نمایش در اسلایدر برجسته‌ی سایت
      </label>
      {saveError ? <p role="alert" className="text-sm text-red-600">{saveError}</p> : null}
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={isSubmitting} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">ذخیره</button>
        <button
          type="button"
          onClick={() => guardedAction(onCancel)}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm"
        >
          لغو
        </button>
      </div>
      {isConfirmOpen ? (
        <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} />
      ) : null}
    </form>
  );
}

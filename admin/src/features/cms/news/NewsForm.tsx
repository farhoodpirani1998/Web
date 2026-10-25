/**
 * Modern create/edit form for News using React Hook Form + Zod.
 * Replaces manual state management with typed form control, validation,
 * and dirty/submitting tracking. RTL + Persian labels preserved.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createNewsArticle, updateNewsArticle } from "./api";
import {
  newsFormSchema,
  formDataToCreatePayload,
  formDataToUpdatePayload,
  newsToFormData,
  type NewsFormData,
} from "./schema";
import type { CmsNewsArticle } from "./types";

export interface NewsFormProps {
  article: CmsNewsArticle | null;
  onCancel: () => void;
  onSaved: (article: CmsNewsArticle) => void;
}

export function NewsForm({ article, onCancel, onSaved }: NewsFormProps) {
  const isEdit = article !== null;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: article ? newsToFormData(article) : {
      titleFa: "", titleEn: "", slug: "", excerptFa: "", excerptEn: "",
      bodyFa: "", bodyEn: "", category: "", tags: "", featuredImageMediaId: null,
      metaTitle: "", metaDescription: "", ogImageUrl: "", canonicalUrl: "", noindex: false,
    },
  });

  useIsDirty(isDirty);
  useUnsavedChangesGuard(isDirty);

  const featuredImageId = watch("featuredImageMediaId");
  const { data: media } = useMediaById(featuredImageId ?? undefined);

  const onSubmit = handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      if (isEdit && article) {
        const payload = formDataToUpdatePayload(data);
        const updated = await updateNewsArticle(article.id, payload);
        onSaved(updated);
      } else {
        const payload = formDataToCreatePayload(data);
        const created = await createNewsArticle(payload);
        onSaved(created);
      }
      reset(data);
    } catch (err) {
      setSubmitError((err as ApiError).message || "خطا در ذخیره");
    }
  });

  return (
    <form dir="rtl" onSubmit={onSubmit} className="space-y-6" aria-label="فرم خبر">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="titleFa" className="block text-sm font-medium">عنوان فارسی</label>
          <input id="titleFa" {...register("titleFa")} className="w-full border rounded px-3 py-2" />
          {errors.titleFa && <span className="text-red-600 text-xs">{errors.titleFa.message}</span>}
        </div>
        <div>
          <label htmlFor="titleEn" className="block text-sm font-medium">عنوان انگلیسی</label>
          <input id="titleEn" {...register("titleEn")} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium">نامک (slug)</label>
        <input id="slug" {...register("slug")} className="w-full border rounded px-3 py-2" />
        {errors.slug && <span className="text-red-600 text-xs">{errors.slug.message}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="excerptFa" className="block text-sm font-medium">خلاصه فارسی</label>
          <textarea id="excerptFa" {...register("excerptFa")} rows={2} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label htmlFor="excerptEn" className="block text-sm font-medium">خلاصه انگلیسی</label>
          <textarea id="excerptEn" {...register("excerptEn")} rows={2} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="bodyFa" className="block text-sm font-medium">متن فارسی</label>
          <textarea id="bodyFa" {...register("bodyFa")} rows={4} className="w-full border rounded px-3 py-2" />
          {errors.bodyFa && <span className="text-red-600 text-xs">{errors.bodyFa.message}</span>}
        </div>
        <div>
          <label htmlFor="bodyEn" className="block text-sm font-medium">متن انگلیسی</label>
          <textarea id="bodyEn" {...register("bodyEn")} rows={4} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium">دسته‌بندی</label>
          <input id="category" {...register("category")} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium">برچسب‌ها (کاما جدا)</label>
          <input id="tags" {...register("tags")} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label htmlFor="featuredImageMediaId" className="block text-sm font-medium">تصویر شاخص</label>
          <MediaPicker
            value={featuredImageId}
            onChange={(id) => setValue("featuredImageMediaId", id, { shouldDirty: true })}
          />
          {media && <div className="text-xs text-gray-500 mt-1">{media.fileName}</div>}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">SEO</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium">عنوان متا</label>
            <input id="metaTitle" {...register("metaTitle")} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium">توضیحات متا</label>
            <textarea id="metaDescription" {...register("metaDescription")} rows={2} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div>
            <label htmlFor="ogImageUrl" className="block text-sm font-medium">تصویر OG</label>
            <input id="ogImageUrl" {...register("ogImageUrl")} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="canonicalUrl" className="block text-sm font-medium">کانونیکال</label>
            <input id="canonicalUrl" {...register("canonicalUrl")} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input id="noindex" type="checkbox" {...register("noindex")} />
            <label htmlFor="noindex" className="text-sm">noindex</label>
          </div>
        </div>
      </div>

      {submitError && <div className="text-red-600 text-sm">{submitError}</div>}

      <div className="flex items-center gap-3 pt-2" role="group" aria-label="اقدامات فرم">
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-brand text-white disabled:opacity-50">
          {isSubmitting ? "در حال ذخیره..." : isEdit ? "به‌روزرسانی" : "ایجاد"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded border">لغو</button>
      </div>

      <UnsavedChangesDialog open={isDirty} onConfirm={onCancel} />
    </form>
  );
}

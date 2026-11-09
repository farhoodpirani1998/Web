import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker } from "@/features/cms/media";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

import { createPage, updatePage } from "./api";
import { usePageOptions } from "./hooks/usePages";
import {
  pageFormSchema,
  formDataToCreatePayload,
  formDataToUpdatePayload,
  pageToFormData,
  type PageFormData,
} from "./schema";
import { CMS_PAGE_TEMPLATES } from "./types";
import type { CmsPage, CmsPageTemplate } from "./types";

const TEMPLATE_LABEL: Record<CmsPageTemplate, string> = {
  default: "پیش‌فرض",
  full_width: "تمام‌عرض",
  landing: "لندینگ",
  contact: "تماس",
  sidebar: "نوار کناری",
};

export interface PageFormProps {
  page: CmsPage | null;
  onCancel: () => void;
  onSaved: (page: CmsPage) => void;
}

export function PageForm({ page, onCancel, onSaved }: PageFormProps) {
  const isEdit = page !== null;
  const { options: parentOptions } = usePageOptions();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    watch,
    setValue,
  } = useForm<z.input<typeof pageFormSchema>, unknown, PageFormData>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: isEdit && page ? pageToFormData(page) : {
      titleFa: "",
      titleEn: "",
      slug: "",
      bodyFa: "",
      bodyEn: "",
      template: "default",
      parentId: "",
      showInMenu: true,
      featuredImageMediaId: "",
      metaTitle: "",
      metaDescription: "",
      ogImageUrl: "",
      canonicalUrl: "",
      noindex: false,
    },
  });

  const featuredImageMediaId = watch("featuredImageMediaId");

  const titleFaId = useId();
  const titleEnId = useId();
  const slugId = useId();
  const bodyFaId = useId();
  const bodyEnId = useId();
  const templateId = useId();
  const parentFieldId = useId();
  const showInMenuId = useId();
  const metaTitleId = useId();
  const metaDescriptionId = useId();
  const ogImageUrlId = useId();
  const canonicalUrlId = useId();
  const noindexId = useId();

  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);

  const onSubmit = async (data: PageFormData) => {
    try {
      if (isEdit && page) {
        const payload = formDataToUpdatePayload(data);
        const updated = await updatePage(page.id, payload);
        onSaved(updated);
      } else {
        const payload = formDataToCreatePayload(data);
        const created = await createPage(payload);
        onSaved(created);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div dir="rtl" className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={titleFaId} className="block text-sm font-medium mb-1">عنوان (فارسی)</label>
            <input id={titleFaId} {...register("titleFa")} className="w-full border rounded-md px-3 py-2" />
            {errors.titleFa && <span className="text-red-500 text-xs">{errors.titleFa.message}</span>}
          </div>
          <div>
            <label htmlFor={titleEnId} className="block text-sm font-medium mb-1">عنوان (انگلیسی)</label>
            <input id={titleEnId} {...register("titleEn")} className="w-full border rounded-md px-3 py-2" />
          </div>
        </div>
        <div>
          <label htmlFor={slugId} className="block text-sm font-medium mb-1">نامک</label>
          <input id={slugId} {...register("slug")} className="w-full border rounded-md px-3 py-2" />
          {errors.slug && <span className="text-red-500 text-xs">{errors.slug.message}</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={bodyFaId} className="block text-sm font-medium mb-1">محتوا (فارسی)</label>
            <textarea id={bodyFaId} rows={5} {...register("bodyFa")} className="w-full border rounded-md px-3 py-2" />
            {errors.bodyFa && <span className="text-red-500 text-xs">{errors.bodyFa.message}</span>}
          </div>
          <div>
            <label htmlFor={bodyEnId} className="block text-sm font-medium mb-1">محتوا (انگلیسی)</label>
            <textarea id={bodyEnId} rows={5} {...register("bodyEn")} className="w-full border rounded-md px-3 py-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor={templateId} className="block text-sm font-medium mb-1">قالب</label>
            <select id={templateId} {...register("template")} className="w-full border rounded-md px-3 py-2">
              {CMS_PAGE_TEMPLATES.map((t) => (
                <option key={t} value={t}>{TEMPLATE_LABEL[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={parentFieldId} className="block text-sm font-medium mb-1">صفحه والد</label>
            <select id={parentFieldId} {...register("parentId")} className="w-full border rounded-md px-3 py-2">
              <option value="">— بدون والد —</option>
              {(parentOptions ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.title.fa}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label htmlFor={showInMenuId} className="inline-flex items-center gap-2 text-sm font-medium mb-2">
              <input id={showInMenuId} type="checkbox" {...register("showInMenu")} /> نمایش در منو
            </label>
          </div>
        </div>
        <div>
          <p className="block text-sm font-medium mb-1">تصویر برجسته</p>
          <MediaPicker
            selectedId={featuredImageMediaId}
            onSelect={(media) => setValue("featuredImageMediaId", media.id, { shouldDirty: true })}
          />
          {featuredImageMediaId && <div className="mt-2 text-xs">شناسه رسانه: {featuredImageMediaId}</div>}
        </div>
        <div className="border-t pt-4 space-y-3">
          <h3 className="text-sm font-semibold">سئو</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={metaTitleId} className="block text-sm font-medium mb-1">عنوان متا</label>
              <input id={metaTitleId} {...register("metaTitle")} className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label htmlFor={metaDescriptionId} className="block text-sm font-medium mb-1">توضیحات متا</label>
              <input id={metaDescriptionId} {...register("metaDescription")} className="w-full border rounded-md px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={ogImageUrlId} className="block text-sm font-medium mb-1">OG Image</label>
              <input id={ogImageUrlId} {...register("ogImageUrl")} className="w-full border rounded-md px-3 py-2" />
              {errors.ogImageUrl && <span className="text-red-500 text-xs">{errors.ogImageUrl.message}</span>}
            </div>
            <div>
              <label htmlFor={canonicalUrlId} className="block text-sm font-medium mb-1">Canonical URL</label>
              <input id={canonicalUrlId} {...register("canonicalUrl")} className="w-full border rounded-md px-3 py-2" />
              {errors.canonicalUrl && <span className="text-red-500 text-xs">{errors.canonicalUrl.message}</span>}
            </div>
          </div>
          <div>
            <label htmlFor={noindexId} className="inline-flex items-center gap-2 text-sm font-medium">
              <input id={noindexId} type="checkbox" {...register("noindex")} /> Noindex
            </label>
          </div>
        </div>
        <div className="flex gap-3 pt-3">
          <button type="button" onClick={() => guardedAction(onCancel)} className="px-4 py-2 border rounded-md">لغو</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md">{isEdit ? "ذخیره" : "ایجاد"}</button>
        </div>
      </form>
      {isConfirmOpen && <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} />}
    </div>
  );
}

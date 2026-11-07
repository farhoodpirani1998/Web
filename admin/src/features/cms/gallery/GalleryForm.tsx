/**
 * Modern create/edit form for Gallery using React Hook Form + Zod.
 * Replaces old `useState`-heavy `GalleryItemForm.tsx` with typed management.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useId, useState } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createGalleryItem, updateGalleryItem } from "./api";
import { galleryFormSchema, formDataToCreatePayload, formDataToUpdatePayload, galleryToFormData, type GalleryFormData } from "./schema";
import type { CmsGalleryItem } from "./types";

export interface GalleryFormProps {
  item: CmsGalleryItem | null;
  onCancel: () => void;
  onSaved: (item: CmsGalleryItem) => void;
}

export function GalleryForm({ item, onCancel, onSaved }: GalleryFormProps) {
  const isEdit = item !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<GalleryFormData>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: item ? galleryToFormData(item) : {
      imageMediaId: "",
      captionFa: "",
      captionEn: "",
      category: "",
    },
  });

  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);

  const imageMediaId = watch("imageMediaId");

  async function onSubmit(data: GalleryFormData) {
    setSaveError(null);
    try {
      if (isEdit && item) {
        const payload = formDataToUpdatePayload(data);
        const saved = await updateGalleryItem(item.id, payload);
        onSaved(saved);
      } else {
        const payload = formDataToCreatePayload(data);
        const saved = await createGalleryItem(payload);
        onSaved(saved);
      }
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" dir="rtl">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "ویرایش تصویر گالری" : "تصویر گالری جدید"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto" noValidate>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-900">تصویر</label>
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                {imageMediaId ? (
                  <GalleryImagePreview mediaId={imageMediaId} />
                ) : (
                  <span className="text-xs text-slate-400">هیچ‌کدام</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                {imageMediaId ? "تغییر…" : "انتخاب…"}
              </button>
            </div>
            <input type="hidden" {...register("imageMediaId")} />
            {errors.imageMediaId ? <p className="text-xs text-red-600">{errors.imageMediaId.message}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="captionFa" className="text-sm font-medium text-slate-900">
              Caption (Farsi) <span className="font-normal text-slate-400">— اختیاری</span>
            </label>
            <input
              id="captionFa"
              type="text"
              dir="rtl"
              {...register("captionFa")}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            {errors.captionFa ? <p className="text-xs text-red-600">{errors.captionFa.message}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="captionEn" className="text-sm font-medium text-slate-900">
              Caption (English) <span className="font-normal text-slate-400">— اختیاری</span>
            </label>
            <input
              id="captionEn"
              type="text"
              {...register("captionEn")}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            {errors.captionEn ? <p className="text-xs text-red-600">{errors.captionEn.message}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium text-slate-900">
              دسته‌بندی <span className="font-normal text-slate-400">— اختیاری</span>
            </label>
            <input
              id="category"
              type="text"
              {...register("category")}
              placeholder="e.g. campus, events, sports"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            {errors.category ? <p className="text-xs text-red-600">{errors.category.message}</p> : null}
          </div>

          {saveError ? (
            <p role="alert" className="text-sm text-red-600">{saveError}</p>
          ) : null}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => guardedAction(onCancel)}
              disabled={isSubmitting}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !imageMediaId}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "در حال ذخیره…" : isEdit ? "ذخیره تغییرات" : "ایجاد آیتم"}
            </button>
          </div>
        </form>
      </div>

      {isPickerOpen ? (
        <GalleryMediaPickerDialog
          selectedId={imageMediaId || ""}
          onSelect={(media) => {
            setValue("imageMediaId", media.id, { shouldDirty: true });
            setIsPickerOpen(false);
          }}
          onCancel={() => setIsPickerOpen(false)}
        />
      ) : null}

      {isConfirmOpen ? (
        <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} />
      ) : null}
    </div>
  );
}

function GalleryImagePreview({ mediaId }: { mediaId: string }) {
  const { media, isLoading } = useMediaById(mediaId);
  return (
    <>
      {isLoading ? (
        <span className="text-xs text-slate-400">…</span>
      ) : media ? (
        <img src={media.thumbnailUrl ?? media.url} alt={media.altText} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs text-slate-400">—</span>
      )}
    </>
  );
}

function GalleryMediaPickerDialog({
  selectedId,
  onSelect,
  onCancel,
}: {
  selectedId: string;
  onSelect: (media: { id: string }) => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4" dir="rtl">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">انتخاب رسانه</h2>
          <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-slate-900">بستن</button>
        </div>
        <MediaPicker
          selectedId={selectedId || null}
          onSelect={onSelect}
          fallback={
            <p className="text-sm text-slate-600">Choosing media requires the Media permission. Contact an admin if you need access.</p>
          }
        />
      </div>
    </div>
  );
}

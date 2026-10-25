/**
 * Modern create/edit form for Teachers using React Hook Form + Zod.
 * Replaces the old `useState`-heavy `TeacherForm.tsx` with typed form management,
 * automatic validation, and cleaner state handling.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useId, useState } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { MediaPicker, useMediaById } from "@/features/cms/media";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import {
  createTeacher,
  updateTeacher,
  type CreateTeacherPayload,
  type UpdateTeacherPayload,
} from "./api";
import { teacherFormSchema, formDataToCreatePayload, formDataToUpdatePayload, type TeacherFormData } from "./schema";
import type { CmsTeacher } from "./types";

export interface TeacherFormProps {
  teacher: CmsTeacher | null;
  onCancel: () => void;
  onSaved: (teacher: CmsTeacher) => void;
}

export function TeacherForm({ teacher, onCancel, onSaved }: TeacherFormProps) {
  const isEdit = teacher !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: teacher
      ? {
          fullName: teacher.fullName,
          slug: teacher.slug,
          jobTitleFa: teacher.jobTitle.fa,
          jobTitleEn: teacher.jobTitle.en ?? "",
          excerptFa: teacher.excerpt?.fa ?? "",
          excerptEn: teacher.excerpt?.en ?? "",
          bioFa: teacher.bio.fa,
          bioEn: teacher.bio.en ?? "",
          departmentFa: teacher.department?.fa ?? "",
          departmentEn: teacher.department?.en ?? "",
          campusId: teacher.campusId ?? "",
          phone: teacher.phone ?? "",
          email: teacher.email ?? "",
          avatarMediaId: teacher.avatarMediaId ?? null,
          metaTitle: teacher.seo.metaTitle ?? "",
          metaDescription: teacher.seo.metaDescription ?? "",
          ogImageUrl: teacher.seo.ogImageUrl ?? "",
          canonicalUrl: teacher.seo.canonicalUrl ?? "",
          noindex: teacher.seo.noindex ?? false,
        }
      : {
          fullName: "",
          slug: "",
          jobTitleFa: "",
          jobTitleEn: "",
          excerptFa: "",
          excerptEn: "",
          bioFa: "",
          bioEn: "",
          departmentFa: "",
          departmentEn: "",
          campusId: "",
          phone: "",
          email: "",
          avatarMediaId: null,
          metaTitle: "",
          metaDescription: "",
          ogImageUrl: "",
          canonicalUrl: "",
          noindex: false,
        },
  });

  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);

  const avatarMediaId = watch("avatarMediaId");

  async function onSubmit(data: TeacherFormData) {
    setSaveError(null);
    try {
      if (isEdit && teacher) {
        const payload: UpdateTeacherPayload = formDataToUpdatePayload(data);
        const saved = await updateTeacher(teacher.id, payload);
        onSaved(saved);
      } else {
        const payload: CreateTeacherPayload = formDataToCreatePayload(data);
        const saved = await createTeacher(payload);
        onSaved(saved);
      }
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "ویرایش استاد" : "استاد جدید"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex max-h-[75vh] flex-col gap-4 overflow-y-auto" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="نام کامل" error={errors.fullName}>
              <input {...register("fullName")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} aria-invalid={!!errors.fullName} />
            </Field>
            <Field label="نامک (slug)" error={errors.slug}>
              <input {...register("slug")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} placeholder="jane-smith" aria-invalid={!!errors.slug} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="عنوان شغلی (فارسی)" error={errors.jobTitleFa} required>
              <input {...register("jobTitleFa")} dir="rtl" className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} aria-invalid={!!errors.jobTitleFa} />
            </Field>
            <Field label="عنوان شغلی (انگلیسی)" error={errors.jobTitleEn}>
              <input {...register("jobTitleEn")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} aria-invalid={!!errors.jobTitleEn} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="دپارتمان (فارسی)" error={errors.departmentFa}>
              <input {...register("departmentFa")} dir="rtl" className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} aria-invalid={!!errors.departmentFa} />
            </Field>
            <Field label="دپارتمان (انگلیسی)" error={errors.departmentEn}>
              <input {...register("departmentEn")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} aria-invalid={!!errors.departmentEn} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="خلاصه (فارسی)" error={errors.excerptFa}>
              <textarea {...register("excerptFa")} dir="rtl" rows={2} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} aria-invalid={!!errors.excerptFa} />
            </Field>
            <Field label="خلاصه (انگلیسی)" error={errors.excerptEn}>
              <textarea {...register("excerptEn")} rows={2} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} aria-invalid={!!errors.excerptEn} />
            </Field>
          </div>

          <Field label="بیوگرافی (فارسی)" error={errors.bioFa} required>
            <textarea {...register("bioFa")} dir="rtl" rows={8} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} aria-invalid={!!errors.bioFa} />
          </Field>
          <Field label="بیوگرافی (انگلیسی)" error={errors.bioEn}>
            <textarea {...register("bioEn")} rows={8} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} aria-invalid={!!errors.bioEn} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="تلفن" error={errors.phone}>
              <input {...register("phone")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} aria-invalid={!!errors.phone} />
            </Field>
            <Field label="ایمیل" error={errors.email}>
              <input {...register("email")} type="email" className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} aria-invalid={!!errors.email} />
            </Field>
          </div>

          <Field label="شناسه پردیس (campusId)" error={errors.campusId}>
            <input {...register("campusId")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6" aria-invalid={!!errors.campusId} />
          </Field>

          <AvatarField mediaId={avatarMediaId} disabled={isSubmitting} onChoose={() => setIsPickerOpen(true)} onClear={() => setValue("avatarMediaId", null)} />

          <fieldset className="rounded-md border border-slate-200 p-3">
            <legend className="px-1 text-sm font-medium text-slate-900">SEO — اختیاری</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-2">
              <Field label="عنوان متا" error={errors.metaTitle}>
                <input {...register("metaTitle")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} />
              </Field>
              <Field label="توضیحات متا" error={errors.metaDescription}>
                <textarea {...register("metaDescription")} rows={2} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="نشانی OG" error={errors.ogImageUrl}>
                <input {...register("ogImageUrl")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} placeholder="https://…" aria-invalid={!!errors.ogImageUrl} />
              </Field>
              <Field label="نشانی کانونیکال" error={errors.canonicalUrl}>
                <input {...register("canonicalUrl")} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100" disabled={isSubmitting} placeholder="https://…" aria-invalid={!!errors.canonicalUrl} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-900 mt-2">
              <input {...register("noindex")} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-slate-900" disabled={isSubmitting} />
              پنهان‌سازی از موتورهای جستجو (noindex)
            </label>
          </fieldset>

          {saveError ? <p role="alert" className="text-sm text-red-600">{saveError}</p> : null}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => guardedAction(onCancel)} disabled={isSubmitting} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">انصراف</button>
            <button type="submit" disabled={isSubmitting} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">{isSubmitting ? "در حال ذخیره…" : isEdit ? "ذخیره تغییرات" : "ایجاد استاد"}</button>
          </div>
        </form>
      </div>

      {isPickerOpen ? (
        <MediaPickerDialog selectedId={avatarMediaId} onSelect={(media) => { setValue("avatarMediaId", media.id); setIsPickerOpen(false); }} onCancel={() => setIsPickerOpen(false)} />
      ) : null}

      {isConfirmOpen ? <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} /> : null}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function Field({ label, error, required, children }: { label: string; error?: { message?: string }; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-900">
        {label} {required ? <span className="text-red-500">*</span> : <span className="font-normal text-slate-400">— اختیاری</span>}
      </label>
      {children}
      {error?.message ? <p className="text-xs text-red-600">{error.message}</p> : null}
    </div>
  );
}

function AvatarField({ mediaId, disabled, onChoose, onClear }: { mediaId: string | null; disabled: boolean; onChoose: () => void; onClear: () => void }) {
  const { media, isLoading } = useMediaById(mediaId);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-900">آواتار <span className="font-normal text-slate-400">— اختیاری</span></span>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
          {mediaId && isLoading ? <span className="text-xs text-slate-400">…</span> : media ? <img src={media.thumbnailUrl ?? media.url} alt={media.altText} className="h-full w-full object-cover" /> : <span className="text-xs text-slate-400">هیچ‌کدام</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <button type="button" onClick={onChoose} disabled={disabled} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">{mediaId ? "تغییر…" : "انتخاب…"}</button>
          {mediaId ? <button type="button" onClick={onClear} disabled={disabled} className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">حذف</button> : null}
        </div>
      </div>
    </div>
  );
}

function MediaPickerDialog({ selectedId, onSelect, onCancel }: { selectedId: string | null; onSelect: (media: { id: string }) => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">انتخاب رسانه</h2><button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-slate-900">بستن</button></div>
        <MediaPicker selectedId={selectedId} onSelect={onSelect} fallback={<p className="text-sm text-slate-600">انتخاب رسانه نیازمند دسترسی «رسانه» است.</p>} />
      </div>
    </div>
  );
}


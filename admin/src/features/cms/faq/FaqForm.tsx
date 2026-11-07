/**
 * Modern create/edit form for FAQs using React Hook Form + Zod.
 * Replaces old useState-heavy form with typed validation, automatic
 * dirty-check, and Persian RTL layout.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { ApiError } from "@/lib/apiError";

import { createFaq, updateFaq } from "./api";
import {
  faqFormSchema,
  formDataToCreatePayload,
  formDataToUpdatePayload,
  faqToFormData,
  type FaqFormData,
} from "./schema";
import type { CmsFaq } from "./types";

export interface FaqFormProps {
  faq: CmsFaq | null;
  onCancel: () => void;
  onSaved: (faq: CmsFaq) => void;
}

export function FaqForm({ faq, onCancel, onSaved }: FaqFormProps) {
  const isEdit = faq !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<FaqFormData>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: faq ? faqToFormData(faq) : {
      questionFa: "",
      questionEn: "",
      answerFa: "",
      answerEn: "",
      category: "",
    },
  });

  const [saveError, setSaveError] = useState<string | null>(null);

  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);

  async function onSubmit(data: FaqFormData) {
    setSaveError(null);
    try {
      if (isEdit && faq) {
        const payload = formDataToUpdatePayload(data);
        const saved = await updateFaq(faq.id, payload);
        onSaved(saved);
      } else {
        const payload = formDataToCreatePayload(data);
        const saved = await createFaq(payload);
        onSaved(saved);
      }
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "خطایی رخ داد. دوباره تلاش کنید.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" dir="rtl">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "ویرایش پرسش متداول" : "پرسش متداول جدید"}
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="questionFa" className="text-sm font-medium text-slate-900">
              پرسش (فارسی) <span className="text-red-600">*</span>
            </label>
            <input
              id="questionFa"
              dir="rtl"
              {...register("questionFa")}
              disabled={isSubmitting}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
            {errors.questionFa ? (
              <p className="text-xs text-red-600">{errors.questionFa.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="questionEn" className="text-sm font-medium text-slate-900">
              پرسش (انگلیسی) <span className="font-normal text-slate-400">— اختیاری</span>
            </label>
            <input
              id="questionEn"
              {...register("questionEn")}
              disabled={isSubmitting}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="answerFa" className="text-sm font-medium text-slate-900">
              پاسخ (فارسی) <span className="text-red-600">*</span>
            </label>
            <textarea
              id="answerFa"
              dir="rtl"
              rows={4}
              {...register("answerFa")}
              disabled={isSubmitting}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
            {errors.answerFa ? (
              <p className="text-xs text-red-600">{errors.answerFa.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="answerEn" className="text-sm font-medium text-slate-900">
              پاسخ (انگلیسی) <span className="font-normal text-slate-400">— اختیاری</span>
            </label>
            <textarea
              id="answerEn"
              rows={4}
              {...register("answerEn")}
              disabled={isSubmitting}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium text-slate-900">
              دسته‌بندی <span className="font-normal text-slate-400">— اختیاری</span>
            </label>
            <input
              id="category"
              type="text"
              dir="rtl"
              placeholder="مثلاً پذیرش، شهریه"
              {...register("category")}
              disabled={isSubmitting}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
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
              disabled={isSubmitting}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "در حال ذخیره…" : isEdit ? "ذخیره تغییرات" : "ایجاد پرسش متداول"}
            </button>
          </div>
        </form>
      </div>

      {isConfirmOpen ? (
        <UnsavedChangesDialog onDiscard={confirmLeave} onKeepEditing={cancelLeave} />
      ) : null}
    </div>
  );
}

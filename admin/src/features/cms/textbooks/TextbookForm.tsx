import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PermissionGate } from "@/components/ui/PermissionGate";
import { ApiError } from "@/lib/apiError";

import {
  createTextbook,
  updateTextbook,
  updateTextbookStatus,
} from "./api";
import {
  availableTextbookStatuses,
  formDataToPayload,
  textbookFormSchema,
  textbookToFormData,
  type TextbookFormData,
} from "./schema";
import type {
  CmsTextbook,
  CmsTextbookSourceType,
  CmsTextbookStatus,
  CmsTextbookTaxonomy,
  CmsTextbookTaxonomyType,
} from "./types";

const STATUS_LABELS: Record<CmsTextbookStatus, string> = {
  draft: "پیش‌نویس",
  published: "منتشرشده",
  archived: "بایگانی‌شده",
};

const SOURCE_LABELS: Record<CmsTextbookSourceType, string> = {
  UPLOADED: "فایل بارگذاری‌شده",
  EXTERNAL_LINK: "پیوند بیرونی",
};

const TAXONOMY_LABELS: Record<CmsTextbookTaxonomyType, string> = {
  stage: "مقطع",
  grade: "پایه",
  field: "رشته",
  subject: "درس",
};

const inputClass = "block w-full rounded-md border border-slate-300 px-3 py-2 text-sm";

export interface TextbookFormProps {
  textbook: CmsTextbook | null;
  taxonomies: CmsTextbookTaxonomy[];
  onCancel: () => void;
  onSaved: () => void;
}

export function TextbookForm({
  textbook,
  taxonomies,
  onCancel,
  onSaved,
}: TextbookFormProps) {
  const [saveError, setSaveError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TextbookFormData>({
    resolver: zodResolver(textbookFormSchema),
    defaultValues: textbookToFormData(textbook),
  });

  useEffect(() => {
    reset(textbookToFormData(textbook));
  }, [textbook, reset]);

  const sourceType = watch("sourceType");
  const status = watch("status");

  async function onSubmit(data: TextbookFormData) {
    setSaveError(null);
    try {
      const payload = formDataToPayload(data, textbook);
      const saved = textbook
        ? await updateTextbook(textbook.id, payload)
        : await createTextbook(payload);
      if (saved.status !== data.status) {
        await updateTextbookStatus(saved.id, data.status);
      }
      onSaved();
    } catch (error) {
      setSaveError(error instanceof ApiError ? error.message : "ذخیره کتاب انجام نشد.");
    }
  }

  function renderTaxonomyField(type: CmsTextbookTaxonomyType) {
    const options = taxonomies.filter((item) => item.type === type);
    const field = type;
    return options.length ? (
      <select className={inputClass} {...register(field)}>
        <option value="">انتخاب {TAXONOMY_LABELS[type]}</option>
        {options.map((item) => (
          <option key={item.id} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    ) : (
      <input className={inputClass} {...register(field)} />
    );
  }

  return (
    <form
      dir="rtl"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      aria-label="فرم کتاب درسی"
    >
      <h2 className="text-lg font-semibold">
        {textbook ? "ویرایش کتاب" : "افزودن کتاب"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-sm">
          عنوان فارسی
          <input className={inputClass} maxLength={200} {...register("title")} />
          {errors.title ? <span role="alert" className="block text-xs text-red-600">{errors.title.message}</span> : null}
        </label>
        <label className="space-y-1 text-sm">
          کد کتاب
          <input className={inputClass} maxLength={80} {...register("code")} />
          {errors.code ? <span role="alert" className="block text-xs text-red-600">{errors.code.message}</span> : null}
        </label>
        <label className="space-y-1 text-sm">
          مقطع
          {renderTaxonomyField("stage")}
          {errors.stage ? <span role="alert" className="block text-xs text-red-600">{errors.stage.message}</span> : null}
        </label>
        <label className="space-y-1 text-sm">
          پایه
          {renderTaxonomyField("grade")}
          {errors.grade ? <span role="alert" className="block text-xs text-red-600">{errors.grade.message}</span> : null}
        </label>
        <label className="space-y-1 text-sm">
          رشته
          {renderTaxonomyField("field")}
          {errors.field ? <span role="alert" className="block text-xs text-red-600">{errors.field.message}</span> : null}
        </label>
        <label className="space-y-1 text-sm">
          درس
          {renderTaxonomyField("subject")}
          {errors.subject ? <span role="alert" className="block text-xs text-red-600">{errors.subject.message}</span> : null}
        </label>
        <label className="space-y-1 text-sm">
          سال تحصیلی
          <input className={inputClass} maxLength={24} placeholder="۱۴۰۵-۱۴۰۶" {...register("academicYear")} />
          {errors.academicYear ? <span role="alert" className="block text-xs text-red-600">{errors.academicYear.message}</span> : null}
        </label>
        <label className="space-y-1 text-sm">
          نوع منبع
          <select
            className={inputClass}
            {...register("sourceType", {
              onChange: (event) => {
                if (event.target.value === "UPLOADED" && status === "published") {
                  setValue("status", "draft");
                }
              },
            })}
          >
            {Object.entries(SOURCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          وضعیت
          <PermissionGate
            permission="website.content:publish"
            fallback={<p className="pt-2">{STATUS_LABELS[status]}</p>}
          >
            <select className={inputClass} {...register("status")}>
              {availableTextbookStatuses(sourceType, status).map((value) => (
                <option key={value} value={value}>{STATUS_LABELS[value]}</option>
              ))}
            </select>
          </PermissionGate>
          {sourceType === "UPLOADED" ? <span className="block text-xs text-slate-500">برای انتشار، ابتدا فایل PDF باید بارگذاری شود.</span> : null}
        </label>
        {sourceType === "EXTERNAL_LINK" ? (
          <label className="space-y-1 text-sm sm:col-span-2">
            پیوند بیرونی (HTTPS)
            <input className={inputClass} type="url" dir="ltr" {...register("externalUrl")} />
            {errors.externalUrl ? <span role="alert" className="block text-xs text-red-600">{errors.externalUrl.message}</span> : null}
          </label>
        ) : null}
        <label className="space-y-1 text-sm sm:col-span-2">
          منبع / پدیدآورنده
          <input className={inputClass} maxLength={300} {...register("sourceAttribution")} />
          {errors.sourceAttribution ? <span role="alert" className="block text-xs text-red-600">{errors.sourceAttribution.message}</span> : null}
        </label>
      </div>
      {saveError ? <p role="alert" className="text-sm text-red-600">{saveError}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">
          {isSubmitting ? "در حال ذخیره…" : "ذخیره"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm">لغو</button>
      </div>
    </form>
  );
}

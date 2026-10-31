/**
 * Modern Statistics create/edit form using React Hook Form + Zod.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";

import { ApiError } from "@/lib/apiError";
import { createStatistic, updateStatistic } from "./api";
import { statisticLabelSchema, createStatisticPayloadSchema, updateStatisticPayloadSchema } from "./schema";
import type { CmsStatistic, CreateStatisticPayloadInput, UpdateStatisticPayloadInput } from "./types";

export interface StatisticFormProps {
  statistic: CmsStatistic | null;
  onCancel: () => void;
  onSaved: (stat: CmsStatistic) => void;
}

const formSchema = z.object({
  labelFa: z.string().min(1, "عنوان فارسی الزامی است"),
  labelEn: z.string().optional(),
  value: z.number().min(0, "مقدار باید غیرمنفی باشد"),
  suffix: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function StatisticForm({ statistic, onCancel, onSaved }: StatisticFormProps) {
  const isEdit = statistic !== null;
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: statistic
      ? {
          labelFa: statistic.label.fa ?? "",
          labelEn: statistic.label.en ?? "",
          value: statistic.value ?? 0,
          suffix: statistic.suffix ?? "",
        }
      : { labelFa: "", labelEn: "", value: 0, suffix: "" },
  });

  async function onSubmit(data: FormData) {
    setSaveError(null);
    try {
      if (isEdit && statistic) {
        const payload: UpdateStatisticPayloadInput = {
          label: { fa: data.labelFa, en: data.labelEn || undefined },
          value: data.value,
          suffix: data.suffix || undefined,
        };
        const saved = await updateStatistic(statistic.id, payload);
        onSaved(saved);
      } else {
        const payload: CreateStatisticPayloadInput = {
          label: { fa: data.labelFa, en: data.labelEn || undefined },
          value: data.value,
          suffix: data.suffix || undefined,
        };
        const saved = await createStatistic(payload);
        onSaved(saved);
      }
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "مشکلی پیش آمد.");
    }
  }

  return (
    <form dir="rtl" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="labelFa" className="block text-sm font-medium">عنوان فارسی</label>
          <input id="labelFa" {...register("labelFa")} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          {errors.labelFa && <p className="mt-1 text-xs text-red-600">{errors.labelFa.message}</p>}
        </div>
        <div>
          <label htmlFor="labelEn" className="block text-sm font-medium">عنوان انگلیسی</label>
          <input id="labelEn" {...register("labelEn")} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label htmlFor="value" className="block text-sm font-medium">مقدار</label>
          <input id="value" type="number" {...register("value", { valueAsNumber: true })} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          {errors.value && <p className="mt-1 text-xs text-red-600">{errors.value.message}</p>}
        </div>
        <div>
          <label htmlFor="suffix" className="block text-sm font-medium">پسوند</label>
          <input id="suffix" {...register("suffix")} placeholder="مثلاً %" className="mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
      </div>
      {saveError && <p className="text-sm text-red-600">{saveError}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">{isEdit ? "ذخیره" : "ایجاد"}</button>
        <button type="button" onClick={onCancel} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">لغو</button>
      </div>
    </form>
  );
}

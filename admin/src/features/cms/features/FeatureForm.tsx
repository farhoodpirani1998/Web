/**
 * Modern create/edit form for CMS Features — RHF + Zod.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import type { z } from "zod";
import {
  featureFormSchema,
  formDataToCreatePayload,
  formDataToUpdatePayload,
  type FeatureFormData,
} from "./schema";
import type { CmsFeature } from "./types";
import { createFeature, updateFeature } from "./api";
import { FEATURE_ICON_KEYS, FEATURE_ICON_OPTIONS } from "./iconOptions";
import { ApiError, applyApiFieldErrors } from "@/lib/apiError";

export interface FeatureFormProps {
  feature: CmsFeature | null;
  onCancel: () => void;
  onSaved: (feature: CmsFeature) => void;
}

export function FeatureForm({ feature, onCancel, onSaved }: FeatureFormProps) {
  const isEdit = feature !== null;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<z.input<typeof featureFormSchema>, unknown, FeatureFormData>({
    resolver: zodResolver(featureFormSchema),
    defaultValues: feature
      ? {
          titleFa: feature.title.fa,
          titleEn: feature.title.en ?? "",
          descriptionFa: feature.description.fa,
          descriptionEn: feature.description.en ?? "",
          icon: FEATURE_ICON_KEYS.find((key) => key === feature.icon) ?? "",
          position: feature.position ?? 0,
          status: feature.status ?? "draft",
        }
      : {
          titleFa: "",
          titleEn: "",
          descriptionFa: "",
          descriptionEn: "",
          icon: "",
          position: 0,
          status: "draft",
        },
  });

  useEffect(() => {
    if (feature)
      reset({
        titleFa: feature.title.fa,
        titleEn: feature.title.en ?? "",
        descriptionFa: feature.description.fa,
        descriptionEn: feature.description.en ?? "",
        icon: FEATURE_ICON_KEYS.find((key) => key === feature.icon) ?? "",
        position: feature.position ?? 0,
        status: feature.status ?? "draft",
      });
  }, [feature, reset]);

  const onSubmit = async (data: FeatureFormData) => {
    setSubmitError(null);
    try {
      const saved = feature
        ? await updateFeature(feature.id, formDataToUpdatePayload(data))
        : await createFeature(formDataToCreatePayload(data));
      onSaved(saved);
    } catch (error) {
      const appliedFieldErrors = applyApiFieldErrors(error, setError, [
        "titleFa",
        "titleEn",
        "descriptionFa",
        "descriptionEn",
        "icon",
        "position",
        "status",
      ]);
      setSubmitError(
        appliedFieldErrors
          ? null
          : error instanceof ApiError
            ? error.message
            : "ذخیره ویژگی ناموفق بود.",
      );
    }
  };
  const selectedIcon = watch("icon");

  return (
    <form onSubmit={handleSubmit(onSubmit)} dir="rtl" className="space-y-4">
      <h2 className="text-xl font-bold">{isEdit ? "ویرایش ویژگی" : "افزودن ویژگی"}</h2>

      <div>
        <label htmlFor="titleFa">عنوان فارسی</label>
        <input
          id="titleFa"
          {...register("titleFa")}
          className="w-full rounded border p-2"
        />
        {errors.titleFa && (
          <span className="text-sm text-red-600">{errors.titleFa.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="titleEn">عنوان انگلیسی</label>
        <input
          id="titleEn"
          {...register("titleEn")}
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label htmlFor="descriptionFa">توضیح فارسی</label>
        <textarea
          id="descriptionFa"
          {...register("descriptionFa")}
          className="w-full rounded border p-2"
          rows={3}
        />
        {errors.descriptionFa && (
          <span className="text-sm text-red-600">{errors.descriptionFa.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="descriptionEn">توضیح انگلیسی</label>
        <textarea
          id="descriptionEn"
          {...register("descriptionEn")}
          className="w-full rounded border p-2"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="icon">آیکون</label>
        <select id="icon" {...register("icon")} className="w-full rounded border p-2">
          <option value="">انتخاب آیکون</option>
          {FEATURE_ICON_OPTIONS.map(({ key, label }) => (
            <option key={key} value={key}>
              {label} ({key})
            </option>
          ))}
        </select>
        {FEATURE_ICON_OPTIONS.map(({ key, icon: Icon }) =>
          key === selectedIcon ? (
            <Icon key={key} aria-hidden="true" className="mt-2 h-6 w-6" />
          ) : null,
        )}
      </div>

      {submitError ? (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          ذخیره
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-gray-200 px-4 py-2"
        >
          لغو
        </button>
      </div>
    </form>
  );
}

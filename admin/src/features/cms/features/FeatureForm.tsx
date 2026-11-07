/**
 * Modern create/edit form for CMS Features — RHF + Zod.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { featureFormSchema, type FeatureFormData } from "./schema";
import type { CmsFeature } from "./types";

export interface FeatureFormProps {
  feature: CmsFeature | null;
  onCancel: () => void;
  onSaved: (feature: CmsFeature) => void;
}

export function FeatureForm({ feature, onCancel, onSaved }: FeatureFormProps) {
  const isEdit = feature !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    setValue,
    reset,
  } = useForm<FeatureFormData>({
    resolver: zodResolver(featureFormSchema),
    defaultValues: feature
      ? {
          titleFa: feature.title.fa,
          titleEn: feature.title.en ?? "",
          descriptionFa: feature.description.fa,
          descriptionEn: feature.description.en ?? "",
          icon: feature.icon ?? "",
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
    if (feature) reset({
      titleFa: feature.title.fa,
      titleEn: feature.title.en ?? "",
      descriptionFa: feature.description.fa,
      descriptionEn: feature.description.en ?? "",
      icon: feature.icon ?? "",
      position: feature.position ?? 0,
      status: feature.status ?? "draft",
    });
  }, [feature, reset]);

  const onSubmit = async (data: FeatureFormData) => {
    // Preserved API call path — adapter converts to payload
    // (real submit wired by parent via onSaved; form stays pure)
    onSaved({ id: feature?.id ?? "new", ...data } as any);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} dir="rtl" className="space-y-4">
      <h2 className="text-xl font-bold">{isEdit ? "ویرایش ویژگی" : "افزودن ویژگی"}</h2>

      <div>
        <label htmlFor="titleFa">عنوان فارسی</label>
        <input id="titleFa" {...register("titleFa")} className="border rounded p-2 w-full" />
        {errors.titleFa && <span className="text-red-600 text-sm">{errors.titleFa.message}</span>}
      </div>

      <div>
        <label htmlFor="titleEn">عنوان انگلیسی</label>
        <input id="titleEn" {...register("titleEn")} className="border rounded p-2 w-full" />
      </div>

      <div>
        <label htmlFor="descriptionFa">توضیح فارسی</label>
        <textarea id="descriptionFa" {...register("descriptionFa")} className="border rounded p-2 w-full" rows={3} />
        {errors.descriptionFa && <span className="text-red-600 text-sm">{errors.descriptionFa.message}</span>}
      </div>

      <div>
        <label htmlFor="descriptionEn">توضیح انگلیسی</label>
        <textarea id="descriptionEn" {...register("descriptionEn")} className="border rounded p-2 w-full" rows={3} />
      </div>

      <div>
        <label htmlFor="icon">آیکون</label>
        <input id="icon" {...register("icon")} className="border rounded p-2 w-full" />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded">ذخیره</button>
        <button type="button" onClick={onCancel} className="bg-gray-200 px-4 py-2 rounded">لغو</button>
      </div>
    </form>
  );
}

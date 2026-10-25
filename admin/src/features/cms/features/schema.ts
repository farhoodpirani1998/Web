/**
 * Zod validation schemas for CMS Features (modern pattern — teachers mirror).
 */
import { z } from "zod";
import type { Translatable } from "../types";

const translatableSchema = z.object({
  fa: z.string().min(1, "فیلد فارسی الزامی است"),
  en: z.string().optional(),
});

export const createFeaturePayloadSchema = z.object({
  title: translatableSchema,
  description: translatableSchema,
  icon: z.string().optional(),
});

export const updateFeaturePayloadSchema = z.object({
  title: translatableSchema.partial().optional(),
  description: translatableSchema.partial().optional(),
  icon: z.string().optional(),
  position: z.number().optional(),
  status: z.string().optional(),
});

export type CreateFeaturePayload = z.infer<typeof createFeaturePayloadSchema>;
export type UpdateFeaturePayload = z.infer<typeof updateFeaturePayloadSchema>;

export const featureFormSchema = z.object({
  titleFa: z.string().min(1, "عنوان فارسی الزامی است"),
  titleEn: z.string().optional(),
  descriptionFa: z.string().min(1, "توضیح فارسی الزامی است"),
  descriptionEn: z.string().optional(),
  icon: z.string().optional(),
  position: z.coerce.number().min(0),
  status: z.string().optional(),
});

export type FeatureFormData = z.infer<typeof featureFormSchema>;

export function formDataToCreatePayload(data: FeatureFormData): CreateFeaturePayload {
  return {
    title: { fa: data.titleFa.trim(), ...(data.titleEn?.trim() ? { en: data.titleEn.trim() } : {}) },
    description: { fa: data.descriptionFa.trim(), ...(data.descriptionEn?.trim() ? { en: data.descriptionEn.trim() } : {}) },
    ...(data.icon?.trim() ? { icon: data.icon.trim() } : {}),
  };
}

export function formDataToUpdatePayload(data: FeatureFormData): UpdateFeaturePayload {
  const payload: UpdateFeaturePayload = {
    ...(data.titleFa?.trim() ? { title: { fa: data.titleFa.trim(), ...(data.titleEn?.trim() ? { en: data.titleEn.trim() } : {}) } } : {}),
    ...(data.descriptionFa?.trim() ? { description: { fa: data.descriptionFa.trim(), ...(data.descriptionEn?.trim() ? { en: data.descriptionEn.trim() } : {}) } } : {}),
    ...(data.icon?.trim() ? { icon: data.icon.trim() } : {}),
    position: data.position,
    status: data.status,
  };
  return payload;
}

export function featureToFormData(feature: {
  id: string;
  title: Translatable<string>;
  description: Translatable<string>;
  icon?: string;
  position: number;
  status: string;
}): FeatureFormData {
  return {
    titleFa: feature.title.fa,
    titleEn: feature.title.en ?? "",
    descriptionFa: feature.description.fa,
    descriptionEn: feature.description.en ?? "",
    icon: feature.icon ?? "",
    position: feature.position ?? 0,
    status: feature.status ?? "draft",
  };
}

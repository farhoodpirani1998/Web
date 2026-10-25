/**
 * Zod validation schemas for the Gallery module.
 */
import { z } from "zod";
import type { Translatable } from "../types";

export const translatableSchema = z.object({
  fa: z.string().min(1, "فیلد فارسی الزامی است"),
  en: z.string().optional(),
});

export const createGalleryPayloadSchema = z.object({
  imageMediaId: z.string().min(1, "شناسه تصویر الزامی است"),
  caption: translatableSchema.partial().optional(),
  category: z.string().optional(),
});
export type CreateGalleryPayload = z.infer<typeof createGalleryPayloadSchema>;

export const updateGalleryPayloadSchema = z.object({
  imageMediaId: z.string().min(1).optional(),
  caption: translatableSchema.partial().optional(),
  category: z.string().optional(),
});
export type UpdateGalleryPayload = z.infer<typeof updateGalleryPayloadSchema>;

export const galleryFormSchema = z.object({
  imageMediaId: z.string().min(1, "انتخاب تصویر الزامی است"),
  captionFa: z.string().optional(),
  captionEn: z.string().optional(),
  category: z.string().optional(),
});
export type GalleryFormData = z.infer<typeof galleryFormSchema>;

export function formDataToCreatePayload(data: GalleryFormData): CreateGalleryPayload {
  return {
    imageMediaId: data.imageMediaId.trim(),
    ...(data.captionFa?.trim()
      ? { caption: { fa: data.captionFa.trim(), ...(data.captionEn?.trim() ? { en: data.captionEn.trim() } : {}) } }
      : {}),
    ...(data.category?.trim() ? { category: data.category.trim() } : {}),
  };
}

export function formDataToUpdatePayload(data: GalleryFormData): UpdateGalleryPayload {
  return {
    ...(data.imageMediaId?.trim() ? { imageMediaId: data.imageMediaId.trim() } : {}),
    ...(data.captionFa?.trim()
      ? { caption: { fa: data.captionFa.trim(), ...(data.captionEn?.trim() ? { en: data.captionEn.trim() } : {}) } }
      : {}),
    ...(data.category?.trim() ? { category: data.category.trim() } : {}),
  };
}

export function galleryToFormData(gallery: {
  imageMediaId: string;
  caption?: Translatable<string>;
  category?: string;
}): GalleryFormData {
  return {
    imageMediaId: gallery.imageMediaId,
    captionFa: gallery.caption?.fa ?? "",
    captionEn: gallery.caption?.en ?? "",
    category: gallery.category ?? "",
  };
}

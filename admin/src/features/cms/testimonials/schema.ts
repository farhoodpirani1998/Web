/**
 * Zod validation schemas for the Testimonials module.
 */
import { z } from "zod";

import type { Translatable } from "../types";

export const translatableSchema = z.object({
  fa: z.string().min(1, "فیلد فارسی الزامی است"),
  en: z.string().optional(),
});

export const testimonialFormSchema = z.object({
  authorName: z.string().min(1, "نام نویسنده الزامی است"),
  authorRoleFa: z.string().optional(),
  authorRoleEn: z.string().optional(),
  contentFa: z.string().min(1, "متن نظبر الزامی است"),
  contentEn: z.string().optional(),
  rating: z.string().optional().or(z.literal("")),
  avatarMediaId: z.string().uuid().nullable().optional().or(z.literal("")),
});

export type TestimonialFormData = z.infer<typeof testimonialFormSchema>;

export const createTestimonialPayloadSchema = z.object({
  authorName: z.string().min(1),
  authorRole: translatableSchema.partial().optional(),
  content: translatableSchema,
  rating: z.number().min(1).max(5).optional(),
  avatarMediaId: z.string().uuid().optional(),
});

export const updateTestimonialPayloadSchema = z.object({
  authorName: z.string().min(1).optional(),
  authorRole: translatableSchema.partial().optional(),
  content: translatableSchema.partial().optional(),
  rating: z.number().min(1).max(5).optional(),
  avatarMediaId: z.string().uuid().nullable().optional(),
});

export function formDataToCreatePayload(data: TestimonialFormData) {
  const trimmedRoleFa = data.authorRoleFa?.trim();
  const trimmedContentEn = data.contentEn?.trim();
  return {
    authorName: data.authorName.trim(),
    ...(trimmedRoleFa ? { authorRole: { fa: trimmedRoleFa, ...(data.authorRoleEn?.trim() ? { en: data.authorRoleEn.trim() } : {}) } } : {}),
    content: { fa: data.contentFa.trim(), ...(trimmedContentEn ? { en: trimmedContentEn } : {}) },
    ...(data.rating?.trim() ? { rating: Number(data.rating.trim()) } : {}),
    ...(data.avatarMediaId ? { avatarMediaId: data.avatarMediaId } : {}),
  };
}

export function formDataToUpdatePayload(data: TestimonialFormData) {
  const trimmedRoleFa = data.authorRoleFa?.trim();
  const trimmedContentEn = data.contentEn?.trim();
  return {
    ...(data.authorName?.trim() ? { authorName: data.authorName.trim() } : {}),
    ...(trimmedRoleFa ? { authorRole: { fa: trimmedRoleFa, ...(data.authorRoleEn?.trim() ? { en: data.authorRoleEn.trim() } : {}) } } : {}),
    ...(data.contentFa?.trim() ? { content: { fa: data.contentFa.trim(), ...(trimmedContentEn ? { en: trimmedContentEn } : {}) } } : {}),
    ...(data.rating?.trim() ? { rating: Number(data.rating.trim()) } : {}),
    avatarMediaId: data.avatarMediaId?.trim() || null,
  };
}

export function testimonialToFormData(t: { authorName: string; authorRole?: Translatable<string>; content: Translatable<string>; rating?: number; avatarMediaId?: string }) {
  return {
    authorName: t.authorName,
    authorRoleFa: t.authorRole?.fa ?? "",
    authorRoleEn: t.authorRole?.en ?? "",
    contentFa: t.content.fa,
    contentEn: t.content.en ?? "",
    rating: t.rating !== undefined ? String(t.rating) : "",
    avatarMediaId: t.avatarMediaId ?? null,
  };
}

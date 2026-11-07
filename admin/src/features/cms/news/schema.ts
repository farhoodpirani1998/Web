/**
 * Zod validation schemas for the News module.
 * Centralizes validation for create/update payloads and form fields.
 * Persian labels preserved; dir=rtl honored via label text.
 */
import { z } from "zod";
import type { Translatable } from "../types";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const translatableSchema = z.object({
  fa: z.string().min(1, "فیلد فارسی الزامی است"),
  en: z.string().optional(),
});

export const seoMetadataSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().url("نشانی معتبر نیست").optional().or(z.literal("")),
  canonicalUrl: z.string().url("نشانی معتبر نیست").optional().or(z.literal("")),
  noindex: z.boolean().default(false),
});
export type SeoMetadataInput = z.infer<typeof seoMetadataSchema>;

export const createNewsPayloadSchema = z.object({
  title: translatableSchema,
  slug: z.string().min(1, "نامک الزامی است").regex(SLUG_PATTERN, "نامک باید kebab-case باشد"),
  excerpt: translatableSchema.partial().optional(),
  body: translatableSchema,
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featuredImageMediaId: z.string().uuid("شناسه رسانه معتبر نیست").optional(),
  seo: seoMetadataSchema.partial().optional(),
});
export type CreateNewsPayload = z.infer<typeof createNewsPayloadSchema>;

export const updateNewsPayloadSchema = z.object({
  title: translatableSchema.partial().optional(),
  slug: z.string().min(1).regex(SLUG_PATTERN).optional(),
  excerpt: translatableSchema.partial().optional(),
  body: translatableSchema.partial().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featuredImageMediaId: z.string().uuid().nullable().optional(),
  seo: seoMetadataSchema.partial().optional(),
});
export type UpdateNewsPayload = z.infer<typeof updateNewsPayloadSchema>;

export const scheduleNewsPayloadSchema = z.object({
  publishAt: z.string().datetime().nullable(),
});
export type ScheduleNewsPayload = z.infer<typeof scheduleNewsPayloadSchema>;

export const newsFormSchema = z.object({
  titleFa: z.string().min(1, "عنوان فارسی الزامی است"),
  titleEn: z.string().optional(),
  slug: z.string().min(1, "نامک الزامی است").regex(SLUG_PATTERN, "نامک باید kebab-case باشد"),
  excerptFa: z.string().optional(),
  excerptEn: z.string().optional(),
  bodyFa: z.string().min(1, "متن فارسی الزامی است"),
  bodyEn: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  featuredImageMediaId: z.string().uuid().nullable().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().url("نشانی معتبر نیست").optional().or(z.literal("")),
  canonicalUrl: z.string().url("نشانی معتبر نیست").optional().or(z.literal("")),
  noindex: z.boolean().default(false),
});
export type NewsFormData = z.infer<typeof newsFormSchema>;

export function formDataToCreatePayload(data: NewsFormData): CreateNewsPayload {
  const seo =
    data.metaTitle || data.metaDescription || data.ogImageUrl || data.canonicalUrl || data.noindex
      ? {
          ...(data.metaTitle ? { metaTitle: data.metaTitle } : {}),
          ...(data.metaDescription ? { metaDescription: data.metaDescription } : {}),
          ...(data.ogImageUrl ? { ogImageUrl: data.ogImageUrl } : {}),
          ...(data.canonicalUrl ? { canonicalUrl: data.canonicalUrl } : {}),
          noindex: data.noindex,
        }
      : undefined;
  return {
    title: { fa: data.titleFa.trim(), en: data.titleEn?.trim() || undefined },
    slug: data.slug.trim(),
    excerpt: data.excerptFa || data.excerptEn ? { fa: data.excerptFa?.trim() || "", en: data.excerptEn?.trim() || undefined } : undefined,
    body: { fa: data.bodyFa.trim(), en: data.bodyEn?.trim() || undefined },
    category: data.category?.trim() || undefined,
    tags: data.tags ? data.tags.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
    featuredImageMediaId: data.featuredImageMediaId || undefined,
    seo,
  };
}

export function formDataToUpdatePayload(data: NewsFormData): UpdateNewsPayload {
  const seo =
    data.metaTitle || data.metaDescription || data.ogImageUrl || data.canonicalUrl || data.noindex
      ? {
          ...(data.metaTitle ? { metaTitle: data.metaTitle } : {}),
          ...(data.metaDescription ? { metaDescription: data.metaDescription } : {}),
          ...(data.ogImageUrl ? { ogImageUrl: data.ogImageUrl } : {}),
          ...(data.canonicalUrl ? { canonicalUrl: data.canonicalUrl } : {}),
          noindex: data.noindex,
        }
      : undefined;
  const payload: UpdateNewsPayload = {};
  if (data.titleFa !== undefined) payload.title = { fa: data.titleFa.trim(), en: data.titleEn?.trim() || undefined };
  if (data.slug !== undefined) payload.slug = data.slug.trim();
  if (data.excerptFa !== undefined || data.excerptEn !== undefined)
    payload.excerpt = { fa: data.excerptFa?.trim() || "", en: data.excerptEn?.trim() || undefined };
  if (data.bodyFa !== undefined) payload.body = { fa: data.bodyFa.trim(), en: data.bodyEn?.trim() || undefined };
  if (data.category !== undefined) payload.category = data.category.trim() || undefined;
  if (data.tags !== undefined) payload.tags = data.tags ? data.tags.split(",").map((s) => s.trim()).filter(Boolean) : [];
  if (data.featuredImageMediaId !== undefined) payload.featuredImageMediaId = data.featuredImageMediaId || null;
  if (seo !== undefined) payload.seo = seo;
  return payload;
}

export function newsToFormData(article: {
  title: Translatable<string>;
  slug: string;
  excerpt?: Translatable<string>;
  body: Translatable<string>;
  category?: string;
  tags?: string[];
  featuredImageMediaId?: string;
  seo: { metaTitle?: string; metaDescription?: string; ogImageUrl?: string; canonicalUrl?: string; noindex: boolean };
}): NewsFormData {
  return {
    titleFa: article.title.fa ?? "",
    titleEn: article.title.en ?? "",
    slug: article.slug,
    excerptFa: article.excerpt?.fa ?? "",
    excerptEn: article.excerpt?.en ?? "",
    bodyFa: article.body.fa ?? "",
    bodyEn: article.body.en ?? "",
    category: article.category ?? "",
    tags: article.tags?.join(", ") ?? "",
    featuredImageMediaId: article.featuredImageMediaId ?? null,
    metaTitle: article.seo.metaTitle ?? "",
    metaDescription: article.seo.metaDescription ?? "",
    ogImageUrl: article.seo.ogImageUrl ?? "",
    canonicalUrl: article.seo.canonicalUrl ?? "",
    noindex: article.seo.noindex ?? false,
  };
}

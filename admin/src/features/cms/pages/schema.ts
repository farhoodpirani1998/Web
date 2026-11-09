import { z } from "zod";
import type {
  CmsPage,
  CreatePagePayload as CmsCreatePagePayload,
  SchedulePagePayload as CmsSchedulePagePayload,
  UpdatePagePayload as CmsUpdatePagePayload,
} from "./types";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const translatableSchema = z.object({
  fa: z.string().min(1, "فیلد فارسی الزامی است"),
  en: z.string().optional(),
});

export const seoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().url("نشانی معتبر نیست").optional().or(z.literal("")),
  canonicalUrl: z.string().url("نشانی معتبر نیست").optional().or(z.literal("")),
  noindex: z.boolean().default(false),
});
export type SeoMetadataInput = z.infer<typeof seoSchema>;

export const createPagePayloadSchema = z.object({
  title: translatableSchema,
  slug: z.string().min(1).regex(SLUG_PATTERN),
  body: translatableSchema,
  template: z.enum(["default", "full_width", "landing", "contact", "sidebar"]).optional(),
  parentId: z.string().uuid().optional(),
  showInMenu: z.boolean().optional(),
  featuredImageMediaId: z.string().uuid().optional(),
  seo: seoSchema.partial().optional(),
});
export const updatePagePayloadSchema = z.object({
  title: translatableSchema.partial().optional(),
  slug: z.string().min(1).regex(SLUG_PATTERN).optional(),
  body: translatableSchema.partial().optional(),
  template: z.enum(["default", "full_width", "landing", "contact", "sidebar"]).optional(),
  parentId: z.string().uuid().nullable().optional(),
  showInMenu: z.boolean().optional(),
  featuredImageMediaId: z.string().uuid().nullable().optional(),
  seo: seoSchema.partial().optional(),
});
export const schedulePagePayloadSchema = z.object({ publishAt: z.string().datetime().nullable() });

export type CreatePagePayload = z.infer<typeof createPagePayloadSchema>;
export type UpdatePagePayload = z.infer<typeof updatePagePayloadSchema>;
export type SchedulePagePayloadSchema = z.infer<typeof schedulePagePayloadSchema>;

export const pageFormSchema = z.object({
  titleFa: z.string().min(1),
  titleEn: z.string().optional(),
  slug: z.string().min(1).regex(SLUG_PATTERN),
  bodyFa: z.string().min(1),
  bodyEn: z.string().optional(),
  template: z.enum(["default", "full_width", "landing", "contact", "sidebar"]),
  parentId: z.string().optional(),
  showInMenu: z.boolean(),
  featuredImageMediaId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  noindex: z.boolean().default(false),
});
export type PageFormData = z.infer<typeof pageFormSchema>;

function getSeo(data: PageFormData) {
  return {
    ...(data.metaTitle ? { metaTitle: data.metaTitle } : {}),
    ...(data.metaDescription ? { metaDescription: data.metaDescription } : {}),
    ...(data.ogImageUrl ? { ogImageUrl: data.ogImageUrl } : {}),
    ...(data.canonicalUrl ? { canonicalUrl: data.canonicalUrl } : {}),
    noindex: data.noindex,
  };
}

export function formDataToCreatePayload(data: PageFormData): CmsCreatePagePayload {
  return {
    title: { fa: data.titleFa.trim(), en: data.titleEn?.trim() || undefined },
    slug: data.slug.trim(),
    body: { fa: data.bodyFa.trim(), en: data.bodyEn?.trim() || undefined },
    template: data.template,
    parentId: data.parentId || undefined,
    showInMenu: data.showInMenu,
    featuredImageMediaId: data.featuredImageMediaId || undefined,
    seo: getSeo(data),
  };
}

export function formDataToUpdatePayload(data: PageFormData): CmsUpdatePagePayload {
  return {
    title: { fa: data.titleFa.trim(), en: data.titleEn?.trim() || undefined },
    slug: data.slug.trim(),
    body: { fa: data.bodyFa.trim(), en: data.bodyEn?.trim() || undefined },
    template: data.template,
    parentId: data.parentId || null,
    showInMenu: data.showInMenu,
    featuredImageMediaId: data.featuredImageMediaId || null,
    seo: getSeo(data),
  };
}

export function pageToFormData(page: CmsPage): PageFormData {
  return {
    titleFa: page.title.fa || "",
    titleEn: page.title.en || "",
    slug: page.slug,
    bodyFa: page.body.fa || "",
    bodyEn: page.body.en || "",
    template: page.template,
    parentId: page.parentId || "",
    showInMenu: page.showInMenu,
    featuredImageMediaId: page.featuredImageMediaId || "",
    metaTitle: page.seo?.metaTitle || "",
    metaDescription: page.seo?.metaDescription || "",
    ogImageUrl: page.seo?.ogImageUrl || "",
    canonicalUrl: page.seo?.canonicalUrl || "",
    noindex: page.seo?.noindex ?? false,
  };
}

export type SchedulePagePayload = CmsSchedulePagePayload;

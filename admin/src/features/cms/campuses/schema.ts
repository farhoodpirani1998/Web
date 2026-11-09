/**
 * Zod validation schemas for the Campuses module.
 * Mirrors backend DTOs; uses translatableSchema + payload schemas.
 */
import { z } from "zod";
import type { Translatable } from "../types";
import type {
  CreateCampusPayload as CmsCreateCampusPayload,
  UpdateCampusPayload as CmsUpdateCampusPayload,
} from "./types";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const translatableSchema = z.object({
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

export const createCampusPayloadSchema = z.object({
  title: translatableSchema,
  slug: z.string().min(1, "نامک الزامی است").regex(SLUG_PATTERN, "نامک kebab-case باشد"),
  excerpt: translatableSchema.partial().optional(),
  body: translatableSchema,
  address: translatableSchema.partial().optional(),
  mapUrl: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  phone: z.string().optional(),
  email: z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")),
  gradeLevels: z.array(z.string()).optional(),
  featuredImageMediaId: z.string().uuid("شناسه رسانه معتبر نیست").optional(),
  seo: seoMetadataSchema.partial().optional(),
});

export type CreateCampusPayload = z.infer<typeof createCampusPayloadSchema>;

export const updateCampusPayloadSchema = z.object({
  title: translatableSchema.partial().optional(),
  slug: z.string().min(1).regex(SLUG_PATTERN).optional(),
  excerpt: translatableSchema.partial().optional(),
  body: translatableSchema.partial().optional(),
  address: translatableSchema.partial().optional(),
  mapUrl: z.string().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  gradeLevels: z.array(z.string()).nullable().optional(),
  featuredImageMediaId: z.string().uuid().nullable().optional(),
  seo: seoMetadataSchema.partial().optional(),
});

export type UpdateCampusPayload = z.infer<typeof updateCampusPayloadSchema>;

export const scheduleCampusPayloadSchema = z.object({
  publishAt: z.string().datetime().nullable(),
});

export type ScheduleCampusPayload = z.infer<typeof scheduleCampusPayloadSchema>;

export const campusFormSchema = z.object({
  titleFa: z.string().min(1, "عنوان فارسی الزامی است"),
  titleEn: z.string().optional(),
  slug: z.string().min(1, "نامک الزامی است").regex(SLUG_PATTERN, "نامک kebab-case باشد"),
  excerptFa: z.string().optional(),
  excerptEn: z.string().optional(),
  bodyFa: z.string().min(1, "متن فارسی الزامی است"),
  bodyEn: z.string().optional(),
  addressFa: z.string().optional(),
  addressEn: z.string().optional(),
  mapUrl: z.string().optional(),
  latitude: z.string().optional().refine((value) => {
    if (!value?.trim()) return true;
    const latitude = Number(value);
    return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
  }, "عرض جغرافیایی باید بین ۹۰- و ۹۰ باشد"),
  longitude: z.string().optional().refine((value) => {
    if (!value?.trim()) return true;
    const longitude = Number(value);
    return Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
  }, "طول جغرافیایی باید بین ۱۸۰- و ۱۸۰ باشد"),
  phone: z.string().optional(),
  email: z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")),
  gradeLevels: z.string().optional(),
  featuredImageMediaId: z.string().uuid().nullable().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().url("نشانی معتبر نیست").optional().or(z.literal("")),
  canonicalUrl: z.string().url("نشانی معتبر نیست").optional().or(z.literal("")),
  noindex: z.boolean().default(false),
});

export type CampusFormData = z.infer<typeof campusFormSchema>;

function parseGradeLevels(value: string | undefined): string[] {
  return Array.from(
    new Set(
      (value ?? "")
        .split(/[،,\n]/)
        .map((level) => level.trim())
        .filter(Boolean),
    ),
  );
}

export function formDataToCreatePayload(data: CampusFormData): CmsCreateCampusPayload {
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
    title: { fa: data.titleFa.trim(), ...(data.titleEn?.trim() ? { en: data.titleEn.trim() } : {}) },
    slug: data.slug.trim(),
    ...(data.excerptFa?.trim() ? { excerpt: { fa: data.excerptFa.trim(), ...(data.excerptEn?.trim() ? { en: data.excerptEn.trim() } : {}) } } : {}),
    body: { fa: data.bodyFa.trim(), ...(data.bodyEn?.trim() ? { en: data.bodyEn.trim() } : {}) },
    ...(data.addressFa?.trim() ? { address: { fa: data.addressFa.trim(), ...(data.addressEn?.trim() ? { en: data.addressEn.trim() } : {}) } } : {}),
    ...(data.mapUrl?.trim() ? { mapUrl: data.mapUrl.trim() } : {}),
    ...(data.latitude?.trim() ? { latitude: Number(data.latitude) } : {}),
    ...(data.longitude?.trim() ? { longitude: Number(data.longitude) } : {}),
    ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
    ...(data.email?.trim() ? { email: data.email.trim() } : {}),
    ...(parseGradeLevels(data.gradeLevels).length
      ? { gradeLevels: parseGradeLevels(data.gradeLevels) }
      : {}),
    ...(data.featuredImageMediaId ? { featuredImageMediaId: data.featuredImageMediaId } : {}),
    ...(seo ? { seo } : {}),
  };
}

export function formDataToUpdatePayload(data: CampusFormData): CmsUpdateCampusPayload {
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
    ...(data.titleFa?.trim() ? { title: { fa: data.titleFa.trim(), ...(data.titleEn?.trim() ? { en: data.titleEn.trim() } : {}) } } : {}),
    ...(data.slug?.trim() ? { slug: data.slug.trim() } : {}),
    ...(data.excerptFa?.trim() ? { excerpt: { fa: data.excerptFa.trim(), ...(data.excerptEn?.trim() ? { en: data.excerptEn.trim() } : {}) } } : {}),
    ...(data.bodyFa?.trim() ? { body: { fa: data.bodyFa.trim(), ...(data.bodyEn?.trim() ? { en: data.bodyEn.trim() } : {}) } } : {}),
    ...(data.addressFa?.trim() ? { address: { fa: data.addressFa.trim(), ...(data.addressEn?.trim() ? { en: data.addressEn.trim() } : {}) } } : {}),
    mapUrl: data.mapUrl?.trim() || null,
    latitude: data.latitude?.trim() ? Number(data.latitude) : null,
    longitude: data.longitude?.trim() ? Number(data.longitude) : null,
    phone: data.phone?.trim() || null,
    email: data.email?.trim() || null,
    gradeLevels: parseGradeLevels(data.gradeLevels).length
      ? parseGradeLevels(data.gradeLevels)
      : null,
    featuredImageMediaId: data.featuredImageMediaId ?? null,
    ...(seo ? { seo } : {}),
  };
}

export function campusToFormData(campus: {
  title: Translatable<string>;
  slug: string;
  excerpt?: Translatable<string>;
  body: Translatable<string>;
  address?: Translatable<string>;
  mapUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  email?: string;
  gradeLevels?: string[] | null;
  featuredImageMediaId?: string;
  seo: { metaTitle?: string; metaDescription?: string; ogImageUrl?: string; canonicalUrl?: string; noindex: boolean };
}): CampusFormData {
  return {
    titleFa: campus.title.fa,
    titleEn: campus.title.en ?? "",
    slug: campus.slug,
    excerptFa: campus.excerpt?.fa ?? "",
    excerptEn: campus.excerpt?.en ?? "",
    bodyFa: campus.body.fa,
    bodyEn: campus.body.en ?? "",
    addressFa: campus.address?.fa ?? "",
    addressEn: campus.address?.en ?? "",
    mapUrl: campus.mapUrl ?? "",
    latitude: campus.latitude == null ? "" : String(campus.latitude),
    longitude: campus.longitude == null ? "" : String(campus.longitude),
    phone: campus.phone ?? "",
    email: campus.email ?? "",
    gradeLevels: campus.gradeLevels?.join("، ") ?? "",
    featuredImageMediaId: campus.featuredImageMediaId ?? null,
    metaTitle: campus.seo.metaTitle ?? "",
    metaDescription: campus.seo.metaDescription ?? "",
    ogImageUrl: campus.seo.ogImageUrl ?? "",
    canonicalUrl: campus.seo.canonicalUrl ?? "",
    noindex: campus.seo.noindex ?? false,
  };
}

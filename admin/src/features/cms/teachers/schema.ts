/**
 * Zod validation schemas for the Teachers module.
 *
 * Centralizes all validation logic (create/update payloads, form fields)
 * so the form, the API layer, and any future server-driven validation
 * all share the exact same rules. Mirrors the backend DTOs in
 * `backend/src/modules/website/content/teachers/dto/*.ts`.
 */
import { z } from "zod";

import type { Translatable } from "../types";

/** Mirrors the backend's `SLUG_PATTERN` — lowercase kebab-case only. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Shared translatable text shape (fa required, en optional). */
const translatableSchema = z.object({
  fa: z.string().min(1, "فیلد فارسی الزامی است"),
  en: z.string().optional(),
});

/** SEO metadata — all fields optional, matching `SeoMetadataDto`. */
export const seoMetadataSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().url("نشانی معتبر نیست").optional().or(z.literal("")),
  canonicalUrl: z.string().url("نشانی معتبر نیست").optional().or(z.literal("")),
  noindex: z.boolean().default(false),
});

export type SeoMetadataInput = z.infer<typeof seoMetadataSchema>;

/** Payload for `POST /admin/teachers` — mirrors `CreateTeacherDto`. */
export const createTeacherPayloadSchema = z.object({
  fullName: z.string().min(1, "نام کامل الزامی است"),
  slug: z.string().min(1, "نامک الزامی است").regex(SLUG_PATTERN, "نامک باید kebab-case باشد (مثال: jane-smith)"),
  jobTitle: translatableSchema,
  excerpt: translatableSchema.partial().optional(),
  bio: translatableSchema,
  department: translatableSchema.partial().optional(),
  campusId: z.string().uuid("شناسه پردیس معتبر نیست").optional(),
  phone: z.string().optional(),
  email: z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")),
  avatarMediaId: z.string().uuid("شناسه رسانه معتبر نیست").optional(),
  seo: seoMetadataSchema.partial().optional(),
});

export type CreateTeacherPayload = z.infer<typeof createTeacherPayloadSchema>;

/** Payload for `PATCH /admin/teachers/:id` — mirrors `UpdateTeacherDto`. */
export const updateTeacherPayloadSchema = z.object({
  fullName: z.string().min(1).optional(),
  slug: z.string().min(1).regex(SLUG_PATTERN).optional(),
  jobTitle: translatableSchema.partial().optional(),
  excerpt: translatableSchema.partial().optional(),
  bio: translatableSchema.partial().optional(),
  department: translatableSchema.partial().optional(),
  campusId: z.string().uuid().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  avatarMediaId: z.string().uuid().nullable().optional(),
  seo: seoMetadataSchema.partial().optional(),
});

export type UpdateTeacherPayload = z.infer<typeof updateTeacherPayloadSchema>;

/** Payload for `PATCH /admin/teachers/:id/schedule` — mirrors `ScheduleTeacherDto`. */
export const scheduleTeacherPayloadSchema = z.object({
  publishAt: z.string().datetime().nullable(),
});

export type ScheduleTeacherPayload = z.infer<typeof scheduleTeacherPayloadSchema>;

/** Form field schema (what the React Hook Form actually validates). */
export const teacherFormSchema = z.object({
  fullName: z.string().min(1, "نام کامل الزامی است"),
  slug: z.string().min(1, "نامک الزامی است").regex(SLUG_PATTERN, "نامک باید kebab-case باشد (مثال: jane-smith)"),
  jobTitleFa: z.string().min(1, "عنوان شغلی (فارسی) الزامی است"),
  jobTitleEn: z.string().optional(),
  excerptFa: z.string().optional(),
  excerptEn: z.string().optional(),
  bioFa: z.string().min(1, "بیوگرافی (فارسی) الزامی است"),
  bioEn: z.string().optional(),
  departmentFa: z.string().optional(),
  departmentEn: z.string().optional(),
  campusId: z.string().uuid("شناسه پردیس معتبر نیست").optional(),
  phone: z.string().optional(),
  email: z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")),
  avatarMediaId: z.string().uuid().nullable().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().url("نشانی معتبر نیست").optional().or(z.literal("")),
  canonicalUrl: z.string().url("نشانی معتبر نیست").optional().or(z.literal("")),
  noindex: z.boolean().default(false),
});

export type TeacherFormData = z.infer<typeof teacherFormSchema>;

/**
 * Transforms the flat form data into the nested API payload shape.
 * Keeps the form simple (flat fields) while sending the correct nested structure.
 */
export function formDataToCreatePayload(data: TeacherFormData): CreateTeacherPayload {
  const seo: SeoMetadataInput | undefined =
    data.metaTitle ||
    data.metaDescription ||
    data.ogImageUrl ||
    data.canonicalUrl ||
    data.noindex
      ? {
          ...(data.metaTitle ? { metaTitle: data.metaTitle } : {}),
          ...(data.metaDescription ? { metaDescription: data.metaDescription } : {}),
          ...(data.ogImageUrl ? { ogImageUrl: data.ogImageUrl } : {}),
          ...(data.canonicalUrl ? { canonicalUrl: data.canonicalUrl } : {}),
          noindex: data.noindex,
        }
      : undefined;

  return {
    fullName: data.fullName.trim(),
    slug: data.slug.trim(),
    jobTitle: {
      fa: data.jobTitleFa.trim(),
      ...(data.jobTitleEn?.trim() ? { en: data.jobTitleEn.trim() } : {}),
    },
    ...(data.excerptFa?.trim()
      ? {
          excerpt: {
            fa: data.excerptFa.trim(),
            ...(data.excerptEn?.trim() ? { en: data.excerptEn.trim() } : {}),
          },
        }
      : {}),
    bio: {
      fa: data.bioFa.trim(),
      ...(data.bioEn?.trim() ? { en: data.bioEn.trim() } : {}),
    },
    ...(data.departmentFa?.trim()
      ? {
          department: {
            fa: data.departmentFa.trim(),
            ...(data.departmentEn?.trim() ? { en: data.departmentEn.trim() } : {}),
          },
        }
      : {}),
    ...(data.campusId?.trim() ? { campusId: data.campusId.trim() } : {}),
    ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
    ...(data.email?.trim() ? { email: data.email.trim() } : {}),
    ...(data.avatarMediaId ? { avatarMediaId: data.avatarMediaId } : {}),
    ...(seo ? { seo } : {}),
  };
}

export function formDataToUpdatePayload(data: TeacherFormData): UpdateTeacherPayload {
  const seo: SeoMetadataInput | undefined =
    data.metaTitle ||
    data.metaDescription ||
    data.ogImageUrl ||
    data.canonicalUrl ||
    data.noindex
      ? {
          ...(data.metaTitle ? { metaTitle: data.metaTitle } : {}),
          ...(data.metaDescription ? { metaDescription: data.metaDescription } : {}),
          ...(data.ogImageUrl ? { ogImageUrl: data.ogImageUrl } : {}),
          ...(data.canonicalUrl ? { canonicalUrl: data.canonicalUrl } : {}),
          noindex: data.noindex,
        }
      : undefined;

  return {
    ...(data.fullName?.trim() ? { fullName: data.fullName.trim() } : {}),
    ...(data.slug?.trim() ? { slug: data.slug.trim() } : {}),
    ...(data.jobTitleFa?.trim()
      ? {
          jobTitle: {
            fa: data.jobTitleFa.trim(),
            ...(data.jobTitleEn?.trim() ? { en: data.jobTitleEn.trim() } : {}),
          },
        }
      : {}),
    ...(data.excerptFa?.trim()
      ? {
          excerpt: {
            fa: data.excerptFa.trim(),
            ...(data.excerptEn?.trim() ? { en: data.excerptEn.trim() } : {}),
          },
        }
      : {}),
    ...(data.bioFa?.trim()
      ? {
          bio: {
            fa: data.bioFa.trim(),
            ...(data.bioEn?.trim() ? { en: data.bioEn.trim() } : {}),
          },
        }
      : {}),
    ...(data.departmentFa?.trim()
      ? {
          department: {
            fa: data.departmentFa.trim(),
            ...(data.departmentEn?.trim() ? { en: data.departmentEn.trim() } : {}),
          },
        }
      : {}),
    campusId: data.campusId?.trim() || null,
    phone: data.phone?.trim() || null,
    email: data.email?.trim() || null,
    avatarMediaId: data.avatarMediaId ?? null,
    ...(seo ? { seo } : {}),
  };
}

/**
 * Transforms an existing `CmsTeacher` entity into the flat form data shape
 * for pre-populating the edit form.
 */
export function teacherToFormData(teacher: {
  fullName: string;
  slug: string;
  jobTitle: Translatable<string>;
  excerpt?: Translatable<string>;
  bio: Translatable<string>;
  department?: Translatable<string>;
  campusId?: string;
  phone?: string;
  email?: string;
  avatarMediaId?: string;
  seo: { metaTitle?: string; metaDescription?: string; ogImageUrl?: string; canonicalUrl?: string; noindex: boolean };
}): TeacherFormData {
  return {
    fullName: teacher.fullName,
    slug: teacher.slug,
    jobTitleFa: teacher.jobTitle.fa,
    jobTitleEn: teacher.jobTitle.en ?? "",
    excerptFa: teacher.excerpt?.fa ?? "",
    excerptEn: teacher.excerpt?.en ?? "",
    bioFa: teacher.bio.fa,
    bioEn: teacher.bio.en ?? "",
    departmentFa: teacher.department?.fa ?? "",
    departmentEn: teacher.department?.en ?? "",
    campusId: teacher.campusId ?? "",
    phone: teacher.phone ?? "",
    email: teacher.email ?? "",
    avatarMediaId: teacher.avatarMediaId ?? null,
    metaTitle: teacher.seo.metaTitle ?? "",
    metaDescription: teacher.seo.metaDescription ?? "",
    ogImageUrl: teacher.seo.ogImageUrl ?? "",
    canonicalUrl: teacher.seo.canonicalUrl ?? "",
    noindex: teacher.seo.noindex ?? false,
  };
}
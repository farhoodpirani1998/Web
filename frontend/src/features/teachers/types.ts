import type { PublicSeoDto, StructuredDataItem } from "@/shared/seo";

/**
 * `Teacher` shape for the `teachers` feature — the backend's Teachers
 * content-module data (Website Frontend Architecture §4, §8),
 * consumed by the feature's data-fetching hook (`./api`, `./useTeachers`).
 *
 * Two shapes live here (same split as `@/features/campuses`):
 * - `PublicTeacherListItemDto`/`PublicMediaRef`/`Translatable` mirror
 *   the real wire response from `GET /public/teachers`
 *   (`backend/src/modules/website/public-api/teachers/public-teachers.controller.ts`)
 *   — a flat, position-ordered array, no pagination. "Mirror, don't
 *   import" — this feature never imports backend code.
 * - `Teacher` is the shape `TeacherCard`/`TeacherGrid`/`TeacherDetails`
 *   already render — `./api.ts`'s `toTeacher` adapts each DTO into
 *   this shape so no section component needs to change shape.
 *
 * Contract gaps vs. the original frontend-only `Teacher` type:
 * - The backend has no "specialties" concept at all (the Teacher
 *   entity carries `fullName`/`jobTitle`/`excerpt`/`bio`/`department`/
 *   `campusId`/`phone`/`email`/`avatarMediaId` — see the entity's doc
 *   comment). `specialties` has no backend equivalent, so `toTeacher`
 *   maps it to an empty array rather than inventing labels — same
 *   "degrade gracefully rather than fabricate data" approach
 *   `campuses`'s `toCampus` uses for its own backend-less fields.
 * - The list endpoint carries `excerpt`, never the teacher's full
 *   `bio` — that only exists on the (unused-by-this-feature)
 *   `GET /public/teachers/:slug` detail response. `toTeacher` falls
 *   back to `department` and then `""` when `excerpt` is absent, same
 *   "degrade gracefully" approach `campuses`'s `toCampus` uses for its
 *   own `body`-vs-`excerpt` gap.
 */

/** Local mirror of the backend kernel's `Translatable<T>` — `fa` required, `en` optional. */
export interface Translatable<T = string> {
  fa: T;
  en?: T;
}

/** Local mirror of the public-api layer's `PublicMediaRef` — only the fields the public site needs. */
export interface PublicMediaRef {
  url: string;
  thumbnailUrl?: string;
  cardUrl?: string;
  altText: string;
}

/** Wire shape of one entry in `GET {publicApiBaseUrl}/teachers`'s response array. */
export interface PublicTeacherListItemDto {
  id: string;
  fullName: string;
  slug: string;
  jobTitle: Translatable<string>;
  excerpt?: Translatable<string>;
  department?: Translatable<string>;
  campusId?: string;
  phone?: string;
  email?: string;
  position: number;
  avatar: PublicMediaRef | null;
}

/**
 * Wire shape of `GET {publicApiBaseUrl}/teachers/:slug}`'s response —
 * mirrors the backend's `PublicTeacherDetailDto`
 * (`public-teachers.controller.ts`), which extends the list item DTO
 * with `bio`/`seo`/`structuredData`/`updatedAt`. `seo`/
 * `structuredData` are typed via the shared `@/shared/seo` layer
 * (`PublicSeoDto`/`StructuredDataItem`, §21) rather than re-mirrored
 * here, same as `@/features/campuses`'s `PublicCampusDetailDto`.
 */
export interface PublicTeacherDetailDto extends PublicTeacherListItemDto {
  bio: Translatable<string>;
  seo: PublicSeoDto;
  structuredData: readonly StructuredDataItem[];
  updatedAt: string;
}

export interface TeacherImage {
  /** Required alt text (§26) — describes the teacher, not "placeholder". */
  alt: string;
  /**
   * Real asset URL, from the Teachers module's `avatar`.
   * Undefined when the teacher has no avatar set — sections render a
   * labelled placeholder surface instead of guessing a URL (same
   * convention as `GalleryGrid`/`CampusCard`).
   */
  src?: string;
}

export interface Teacher {
  /** Stable identifier, also used as the React list key. */
  id: string;
  /** Public slug (`/public/teachers/:slug`); not currently routed to, kept for future per-teacher pages. */
  slug: string;
  name: string;
  /** Subject or role, e.g. "دبیر ریاضی". */
  subject: string;
  /** Short biography shown on `TeacherCard`. */
  bio: string;
  image: TeacherImage;
  /** Not modeled on the backend today — always empty, rendered conditionally by callers. */
  specialties: readonly string[];
}

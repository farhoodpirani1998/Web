import type { PublicSeoDto, StructuredDataItem } from "@/shared/seo";

/**
 * Types for the `static-pages` feature — the backend's Static Pages
 * content module (`backend/src/modules/website/content/pages`),
 * consumed by this feature's data-fetching layer (`./api`).
 *
 * `PublicStaticPageDto`/`PublicMediaRef`/`Translatable`/
 * `PageTemplate` mirror the real wire response from both
 * `GET /public/pages/homepage` and `GET /public/pages/:slug`
 * (`backend/.../public-api/pages/public-pages.controller.ts`) — the
 * same singleton-shaped `PublicPageDto` backs both routes there, so
 * one type here does too. "Mirror, don't import" — this feature never
 * imports backend code, same convention `@/features/about`,
 * `@/features/campuses`, and `@/features/teachers` already follow for
 * their own DTOs.
 *
 * No section/adapted shape lives here (unlike those other features'
 * `Campus`/`Teacher`/etc.) — per this sprint's scope, only the wire
 * DTO and fetch functions are implemented; no page or component
 * consumes this feature yet.
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

/**
 * Local mirror of the backend's `PageTemplate` enum
 * (`backend/.../content/pages/entities/page-template.enum.ts`) — the
 * fixed set of layout templates a page can render with.
 */
export type PageTemplate = "default" | "full_width" | "landing" | "contact" | "sidebar";

/**
 * Wire shape of both `GET {publicApiBaseUrl}/pages/homepage`'s and
 * `GET {publicApiBaseUrl}/pages/:slug}`'s response — a singleton
 * object, not a list/paginated shape.
 */
export interface PublicStaticPageDto {
  id: string;
  title: Translatable<string>;
  slug: string;
  body: Translatable<string>;
  template: PageTemplate;
  isHomepage: boolean;
  featuredImage: PublicMediaRef | null;
  seo: PublicSeoDto;
  structuredData: readonly StructuredDataItem[];
  updatedAt: string;
}

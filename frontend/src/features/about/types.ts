import type { PublicSeoDto, StructuredDataItem } from "@/shared/seo";

/**
 * Types for the `about` feature — the backend's **Static Pages /
 * About** content module (Website Frontend Architecture §4, §8),
 * consumed by the feature's data-fetching hook (`./api`,
 * `./useAboutPage`).
 *
 * Two shapes live here (same split as `@/features/campuses` and
 * `@/features/teachers`):
 * - `PublicAboutDto`/`PublicMediaRef`/`Translatable` mirror the real
 *   wire response from `GET /public/about`
 *   (`backend/src/modules/website/public-api/about/public-about.controller.ts`)
 *   — a singleton object (`{ title, body, image, seo, structuredData,
 *   updatedAt }`), not the section-by-section shape below. "Mirror,
 *   don't import" — this feature never imports backend code. `seo`/
 *   `structuredData` themselves are typed via the shared `@/shared/seo`
 *   layer (`PublicSeoDto`/`StructuredDataItem`, §21) rather than
 *   re-mirrored here, same as any other public-api DTO carrying those
 *   two fields.
 * - `AboutPageContent` (and its `AboutHeroContent`/`AboutStatItem`/
 *   etc. section shapes) is what `./AboutHero.tsx`, `./AboutStats.tsx`,
 *   `./AboutStory.tsx`, `./AboutValues.tsx`, `./AboutTimeline.tsx`,
 *   and `./AboutTeam.tsx` already render — `./api.ts`'s
 *   `toAboutPageContent` adapts the single DTO into this shape so no
 *   section component needs to change shape.
 *
 * Contract gap vs. the original frontend-only `AboutPageContent`
 * shape: the backend's `AboutPage` entity only carries `title`/`body`
 * (plus `image`/`seo`, unused by these sections) — see the entity's
 * doc comment. It has no `stats`/`values`/`timeline`/`team` concept at
 * all, so `toAboutPageContent` maps those to `[]` rather than
 * inventing entries — same "degrade gracefully rather than fabricate
 * data" approach `teachers`'s `toTeacher` uses for its own
 * backend-less fields. (`faq` is likewise always `[]` here — `AboutFAQ`
 * doesn't actually read `data.faq`; it's backed by the separate
 * `@/features/faq`'s `useFaq()` hook instead.) `hero.description` and
 * `story.paragraphs` both derive from the one `body` field the
 * backend does provide — same "degrade gracefully" approach
 * `campuses`'s `toCampus` uses for its own `body`-vs-`excerpt` gap.
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

/** Wire shape of `GET {publicApiBaseUrl}/about`'s response — a singleton object, not a list. */
export interface PublicAboutDto {
  title: Translatable<string>;
  body: Translatable<string>;
  image: PublicMediaRef | null;
  seo: PublicSeoDto;
  structuredData: readonly StructuredDataItem[];
  updatedAt: string;
}

export interface AboutHeroContent {
  /** Small kicker/eyebrow label shown above the headline. */
  eyebrow?: string;
  title: string;
  description: string;
}

export interface AboutStatItem {
  /** Stable identifier, also used as the React list key. */
  id: string;
  /** Display value, Persian-digit formatted (e.g. "۱۲٬۰۰۰+"). */
  value: string;
  label: string;
}

export interface AboutStoryContent {
  title: string;
  /** Ordered paragraphs; the first renders with the "lead" emphasis
   *  treatment, the rest as regular body copy. */
  paragraphs: readonly string[];
}

export interface AboutValueItem {
  /** Stable identifier, also used as the React list key. */
  id: string;
  /** Persian-digit display index (e.g. "۰۱"), used as the card marker. */
  index: string;
  title: string;
  description: string;
}

export interface AboutTimelineItem {
  /** Stable identifier, also used as the React list key. */
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface AboutTeamMember {
  /** Stable identifier, also used as the React list key. */
  id: string;
  name: string;
  role: string;
  /** Photo asset URL; omitted while no Media module-backed value
   *  exists — `Avatar` falls back to initials in that case. */
  avatarUrl?: string;
}

export interface AboutFAQItem {
  /** Stable identifier, also used as the React list key. */
  id: string;
  question: string;
  answer: string;
}

/**
 * Section-by-section shape the About page's components render.
 * Produced from `PublicAboutDto` by `./api.ts`'s `toAboutPageContent`
 * — not a 1:1 mirror of `GET {publicApiBaseUrl}/about`'s response.
 *
 * `seo`/`structuredData` are the one exception to "not a 1:1 mirror":
 * they pass through from `PublicAboutDto` unchanged, so `AboutPage`
 * can hand them straight to the shared `<Seo />` component (§21).
 */
export interface AboutPageContent {
  hero: AboutHeroContent;
  stats: readonly AboutStatItem[];
  story: AboutStoryContent;
  values: readonly AboutValueItem[];
  timeline: readonly AboutTimelineItem[];
  team: readonly AboutTeamMember[];
  faq: readonly AboutFAQItem[];
  seo: PublicSeoDto;
  structuredData: readonly StructuredDataItem[];
}

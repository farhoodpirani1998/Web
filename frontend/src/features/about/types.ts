import type { PublicSeoDto, StructuredDataItem } from "@/shared/seo";
import type { AboutBodyBlock } from "./markdown";

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
 *   — a singleton object (`{ title, body, image, sections, seo,
 *   structuredData, updatedAt }`), not the section-by-section shape below. "Mirror,
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
 * The CMS now stores stats, values, timeline entries, team members, and
 * the About FAQ heading/description alongside the page title/body.
 * FAQ entries themselves remain in the separate FAQ module.
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
  sections: {
    stats: PublicAboutSection<PublicAboutStatItem>;
    values: PublicAboutSection<PublicAboutValueItem>;
    timeline: PublicAboutSection<PublicAboutTimelineItem>;
    team: PublicAboutSection<PublicAboutTeamMember>;
    faq?: {
      title?: Translatable<string>;
      description?: Translatable<string>;
    };
  };
  seo: PublicSeoDto;
  structuredData: readonly StructuredDataItem[];
  updatedAt: string;
}

export interface PublicAboutSection<TItem> {
  title?: Translatable<string>;
  description?: Translatable<string>;
  items: TItem[];
}

export interface PublicAboutStatItem {
  id: string;
  value: string;
  suffix?: string;
  label: Translatable<string>;
}

export interface PublicAboutValueItem {
  id: string;
  title: Translatable<string>;
  description: Translatable<string>;
}

export interface PublicAboutTimelineItem {
  id: string;
  year: string;
  title: Translatable<string>;
  description: Translatable<string>;
}

export interface PublicAboutTeamMember {
  id: string;
  name: Translatable<string>;
  role: Translatable<string>;
  avatar: PublicMediaRef | null;
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
  /** Display value, formatted with `Intl.NumberFormat('fa-IR')`. */
  value: string;
  suffix?: string;
  label: string;
}

export interface AboutStoryContent {
  title: string;
  blocks: readonly AboutBodyBlock[];
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
  /** Photo asset URL; omitted when no Media entry is attached. */
  avatarUrl?: string;
  avatarAlt?: string;
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
  image: PublicMediaRef | null;
  stats: AboutSectionContent<AboutStatItem>;
  story: AboutStoryContent;
  values: AboutSectionContent<AboutValueItem>;
  timeline: AboutSectionContent<AboutTimelineItem>;
  team: AboutSectionContent<AboutTeamMember>;
  faq: readonly AboutFAQItem[];
  faqSection: {
    title?: string;
    description?: string;
  };
  seo: PublicSeoDto;
  structuredData: readonly StructuredDataItem[];
}

export interface AboutSectionContent<TItem> {
  title?: string;
  description?: string;
  items: readonly TItem[];
}

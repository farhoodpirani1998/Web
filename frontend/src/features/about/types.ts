/**
 * Public API response types for the backend's **Static Pages / About**
 * content module (Website Frontend Architecture §4, §8), consumed by
 * the `about` feature's data-fetching hook (`./api`, `./useAboutPage`).
 *
 * Shaped to match what `./AboutHero.tsx`, `./AboutStats.tsx`,
 * `./AboutStory.tsx`, `./AboutValues.tsx`, `./AboutTimeline.tsx`,
 * `./AboutTeam.tsx`, and `./AboutFAQ.tsx` currently render as
 * placeholder copy, the same "one aggregate object" shape
 * `@/features/site`'s `SiteSettings` already uses — so wiring each
 * section to real data is a matter of swapping its data source, not
 * its markup.
 */

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
 * Full shape returned by `GET {publicApiBaseUrl}/about`.
 */
export interface AboutPageContent {
  hero: AboutHeroContent;
  stats: readonly AboutStatItem[];
  story: AboutStoryContent;
  values: readonly AboutValueItem[];
  timeline: readonly AboutTimelineItem[];
  team: readonly AboutTeamMember[];
  faq: readonly AboutFAQItem[];
}

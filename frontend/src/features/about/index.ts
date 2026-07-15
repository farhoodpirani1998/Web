/**
 * Public surface of the `about` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * `./AboutHero`, `./AboutStats`, etc. files directly.
 *
 * `fetchAboutPage`/`useAboutPage`/`aboutPageQueryKey` and the
 * `AboutPageContent` family of types are additive exports, following
 * the same shape `@/features/news`'s and `@/features/site`'s public
 * surfaces already export their fetch layer through.
 */
export { HomeAbout } from "./HomeAbout";
export { AboutHero } from "./AboutHero";
export { AboutStats } from "./AboutStats";
export { AboutStory } from "./AboutStory";
export { AboutValues } from "./AboutValues";
export { AboutTimeline } from "./AboutTimeline";
export { AboutTeam } from "./AboutTeam";
export { AboutFAQ } from "./AboutFAQ";

export { fetchAboutPage } from "./api";
export { useAboutPage, aboutPageQueryKey } from "./useAboutPage";
export type {
  AboutPageContent,
  AboutHeroContent,
  AboutStatItem,
  AboutStoryContent,
  AboutValueItem,
  AboutTimelineItem,
  AboutTeamMember,
  AboutFAQItem,
} from "./types";

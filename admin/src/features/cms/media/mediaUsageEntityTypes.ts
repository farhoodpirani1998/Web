import { ROUTE_PATHS } from "@/routes/paths";

/**
 * Display label + admin route for each `MediaUsage.entityType` value a
 * content module currently writes (see every content service's
 * `ENTITY_TYPE` constant, e.g. `content/hero/hero.service.ts`).
 *
 * A plain lookup table, not a per-id deep link: no content module
 * exposes a per-entity route today (each admin page — `/admin/hero-slides`,
 * `/admin/news`, etc. — lists/edits its rows in place), so "where is
 * this used" links to the owning list page, and the row itself is
 * identified by `entityType`'s label alongside the raw `entityId`.
 *
 * An `entityType` not in this map (e.g. a future content module that
 * starts calling `MediaService.attach` before this table is updated)
 * falls back to showing the raw value with no link — see
 * `MediaUsageDialog`.
 */
export const MEDIA_USAGE_ENTITY_TYPES: Record<string, { label: string; route: string }> = {
  hero: { label: "Hero slide", route: ROUTE_PATHS.ADMIN_HERO_SLIDES },
  about: { label: "About page", route: ROUTE_PATHS.ADMIN_ABOUT },
  news_article: { label: "News article", route: ROUTE_PATHS.ADMIN_NEWS },
  static_page: { label: "Page", route: ROUTE_PATHS.ADMIN_PAGES },
  calendar_event: { label: "Event", route: ROUTE_PATHS.ADMIN_EVENTS },
  campus: { label: "Campus", route: ROUTE_PATHS.ADMIN_CAMPUSES },
  teacher: { label: "Teacher", route: ROUTE_PATHS.ADMIN_TEACHERS },
  testimonial: { label: "Testimonial", route: ROUTE_PATHS.ADMIN_TESTIMONIALS },
  site_settings: { label: "Site settings", route: ROUTE_PATHS.ADMIN_SETTINGS },
  cta: { label: "CTA banner", route: ROUTE_PATHS.ADMIN_CTA },
  faq: { label: "FAQ", route: ROUTE_PATHS.ADMIN_FAQS },
  feature: { label: "Feature", route: ROUTE_PATHS.ADMIN_FEATURES },
  gallery_item: { label: "Gallery item", route: ROUTE_PATHS.ADMIN_GALLERY },
  statistic: { label: "Statistic", route: ROUTE_PATHS.ADMIN_STATISTICS },
};

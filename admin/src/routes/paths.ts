/**
 * Centralized route path constants.
 *
 * Sprint 1.5 note: ADMIN_CONTENT, ADMIN_MEDIA, and ADMIN_SETTINGS are
 * now registered in the router (`routes/index.tsx`) with placeholder
 * pages, matching the sidebar nav config (`routes/nav.config.ts`).
 *
 * Sprint 3.7 note: ADMIN_SETTINGS now points at the real Site Settings
 * page (see `pages/SettingsPage.tsx`); ADMIN_PORTAL_LINKS is new.
 *
 * Sprint 3.10 note: ADMIN_NEWS is new (see `pages/NewsPage.tsx`).
 *
 * Sprint 3.11 note: ADMIN_PAGES is new (see `pages/PagesPage.tsx`).
 *
 * Sprint 3.12 note: ADMIN_EVENTS is new (see `pages/EventsPage.tsx`).
 *
 * Sprint 3.13 note: ADMIN_TEACHERS is new (see `pages/TeachersPage.tsx`).
 *
 * Sprint 3.14 note: ADMIN_CAMPUSES is new (see `pages/CampusesPage.tsx`).
 *
 * Sprint 3.15 note: ADMIN_TESTIMONIALS is new (see `pages/TestimonialsPage.tsx`).
 *
 * Sprint 3.16 note: ADMIN_FEATURES is new (see `pages/FeaturesPage.tsx`).
 *
 * Sprint 3.17 note: ADMIN_STATISTICS is new (see `pages/StatisticsPage.tsx`).
 *
 * Sprint 3.18 note: ADMIN_ABOUT is new (see `pages/AboutPage.tsx`).
 *
 * Sprint 3.19 note: ADMIN_CTA is new (see `pages/CtaPage.tsx`).
 *
 * Sprint — CMS Navigation Admin: ADMIN_MENUS is new (see
 * `pages/MenusPage.tsx`).
 *
 * Sprint — Pre-Registration Form: ADMIN_PRE_REGISTRATIONS is new (see
 * `pages/PreRegistrationsPage.tsx`).
 */

export const ROUTE_PATHS = {
  ROOT: "/",
  LOGIN: "/login",
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_CONTENT: "/admin/content",
  ADMIN_MEDIA: "/admin/media",
  ADMIN_FAQS: "/admin/faqs",
  ADMIN_PORTAL_LINKS: "/admin/portal-links",
  ADMIN_GALLERY: "/admin/gallery",
  ADMIN_HERO_SLIDES: "/admin/hero-slides",
  ADMIN_NEWS: "/admin/news",
  ADMIN_PAGES: "/admin/pages",
  ADMIN_EVENTS: "/admin/events",
  ADMIN_TEACHERS: "/admin/teachers",
  ADMIN_CAMPUSES: "/admin/campuses",
  ADMIN_TESTIMONIALS: "/admin/testimonials",
  ADMIN_FEATURES: "/admin/features",
  ADMIN_STATISTICS: "/admin/statistics",
  ADMIN_ABOUT: "/admin/about",
  ADMIN_CTA: "/admin/cta",
  ADMIN_MENUS: "/admin/menus",
  ADMIN_PRE_REGISTRATIONS: "/admin/pre-registrations",
  ADMIN_SETTINGS: "/admin/settings",
} as const;

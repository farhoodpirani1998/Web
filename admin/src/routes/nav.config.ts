/**
 * Centralized sidebar navigation configuration.
 *
 * Sprint 1.4 scope: navigation foundation only. Each entry is just an
 * id/label/route triple — no permissions/role field yet (that's a
 * later sprint). `AdminSidebar` renders this list; nothing else should
 * hardcode nav labels or paths.
 */
import { ROUTE_PATHS } from "@/routes/paths";

export interface NavItem {
  id: string;
  label: string;
  route: string;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", route: ROUTE_PATHS.ADMIN_DASHBOARD },
  { id: "content", label: "Content", route: ROUTE_PATHS.ADMIN_CONTENT },
  { id: "media", label: "Media", route: ROUTE_PATHS.ADMIN_MEDIA },
  { id: "faq", label: "FAQ", route: ROUTE_PATHS.ADMIN_FAQS },
  { id: "portal-links", label: "Portal Links", route: ROUTE_PATHS.ADMIN_PORTAL_LINKS },
  { id: "gallery", label: "Gallery", route: ROUTE_PATHS.ADMIN_GALLERY },
  { id: "hero-slides", label: "Hero Slides", route: ROUTE_PATHS.ADMIN_HERO_SLIDES },
  { id: "news", label: "News", route: ROUTE_PATHS.ADMIN_NEWS },
  { id: "pages", label: "Pages", route: ROUTE_PATHS.ADMIN_PAGES },
  { id: "events", label: "Events", route: ROUTE_PATHS.ADMIN_EVENTS },
  { id: "teachers", label: "Teachers", route: ROUTE_PATHS.ADMIN_TEACHERS },
  { id: "campuses", label: "Campuses", route: ROUTE_PATHS.ADMIN_CAMPUSES },
  { id: "testimonials", label: "Testimonials", route: ROUTE_PATHS.ADMIN_TESTIMONIALS },
  { id: "features", label: "Features", route: ROUTE_PATHS.ADMIN_FEATURES },
  { id: "statistics", label: "Statistics", route: ROUTE_PATHS.ADMIN_STATISTICS },
  { id: "about", label: "About", route: ROUTE_PATHS.ADMIN_ABOUT },
  { id: "cta", label: "CTA", route: ROUTE_PATHS.ADMIN_CTA },
  { id: "menus", label: "Menus", route: ROUTE_PATHS.ADMIN_MENUS },
  {
    id: "pre-registrations",
    label: "Pre-Registrations",
    route: ROUTE_PATHS.ADMIN_PRE_REGISTRATIONS,
  },
  { id: "settings", label: "Settings", route: ROUTE_PATHS.ADMIN_SETTINGS },
];

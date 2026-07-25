/**
 * Router configuration.
 *
 * Sprint 1.3 scope: adds the AdminLayout shell around `/admin/*` routes.
 * Sprint 1.5 scope: registers the remaining placeholder routes
 * (content, media, settings) alongside dashboard.
 * Sprint 2.4B scope: wraps `/login` in `RedirectIfAuthenticated` and
 * `/admin` in `RequireAuth` (see `features/auth`). The route tree shape
 * itself is unchanged — these are guard wrappers around the existing
 * `element`s, not new routes.
 * Sprint 3.7 scope: registers `/admin/portal-links` (new) and rewires
 * `/admin/settings` to the real Site Settings page — the route tree
 * shape itself is otherwise unchanged.
 * Sprint 3.10 scope: registers `/admin/news` (new) — the route tree
 * shape itself is otherwise unchanged.
 * Sprint 3.11 scope: registers `/admin/pages` (new) — the route tree
 * shape itself is otherwise unchanged.
 * Sprint 3.12 scope: registers `/admin/events` (new) — the route tree
 * shape itself is otherwise unchanged.
 * Sprint 3.13 scope: registers `/admin/teachers` (new) — the route
 * tree shape itself is otherwise unchanged.
 * Sprint 3.14 scope: registers `/admin/campuses` (new) — the route
 * tree shape itself is otherwise unchanged.
 * Sprint 3.15 scope: registers `/admin/testimonials` (new) — the
 * route tree shape itself is otherwise unchanged.
 * Sprint 3.16 scope: registers `/admin/features` (new) — the route
 * tree shape itself is otherwise unchanged.
 * Sprint 3.17 scope: registers `/admin/statistics` (new) — the route
 * tree shape itself is otherwise unchanged.
 * Sprint 3.18 scope: registers `/admin/about` (new) — the route tree
 * shape itself is otherwise unchanged.
 * Sprint 3.19 scope: registers `/admin/cta` (new) — the route tree
 * shape itself is otherwise unchanged.
 * Sprint — CMS Navigation Admin scope: registers `/admin/menus` (new)
 * — the route tree shape itself is otherwise unchanged.
 * Sprint — Pre-Registration Form scope: registers
 * `/admin/pre-registrations` (new) — the route tree shape itself is
 * otherwise unchanged.
 */
import { createBrowserRouter, Navigate } from "react-router-dom";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { RedirectIfAuthenticated, RequireAuth } from "@/features/auth";
import { AboutPage } from "@/pages/AboutPage";
import { CampusesPage } from "@/pages/CampusesPage";
import { ContentPage } from "@/pages/ContentPage";
import { CtaPage } from "@/pages/CtaPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { EventsPage } from "@/pages/EventsPage";
import { FaqPage } from "@/pages/FaqPage";
import { FeaturesPage } from "@/pages/FeaturesPage";
import { GalleryPage } from "@/pages/GalleryPage";
import { HeroSlidesPage } from "@/pages/HeroSlidesPage";
import { LoginPage } from "@/pages/LoginPage";
import { MediaPage } from "@/pages/MediaPage";
import { MenusPage } from "@/pages/MenusPage";
import { NewsPage } from "@/pages/NewsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PagesPage } from "@/pages/PagesPage";
import { PortalLinksPage } from "@/pages/PortalLinksPage";
import { PreRegistrationsPage } from "@/pages/PreRegistrationsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { StatisticsPage } from "@/pages/StatisticsPage";
import { TeachersPage } from "@/pages/TeachersPage";
import { TestimonialsPage } from "@/pages/TestimonialsPage";

import { ROUTE_PATHS } from "@/routes/paths";

export const router = createBrowserRouter([
  {
    path: ROUTE_PATHS.ROOT,
    element: <Navigate to={ROUTE_PATHS.LOGIN} replace />,
  },
  {
    path: ROUTE_PATHS.LOGIN,
    element: (
      <RedirectIfAuthenticated>
        <LoginPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: ROUTE_PATHS.ADMIN,
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ROUTE_PATHS.ADMIN_DASHBOARD} replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "content",
        element: <ContentPage />,
      },
      {
        path: "media",
        element: <MediaPage />,
      },
      {
        path: "faqs",
        element: <FaqPage />,
      },
      {
        path: "portal-links",
        element: <PortalLinksPage />,
      },
      {
        path: "gallery",
        element: <GalleryPage />,
      },
      {
        path: "hero-slides",
        element: <HeroSlidesPage />,
      },
      {
        path: "news",
        element: <NewsPage />,
      },
      {
        path: "pages",
        element: <PagesPage />,
      },
      {
        path: "events",
        element: <EventsPage />,
      },
      {
        path: "teachers",
        element: <TeachersPage />,
      },
      {
        path: "campuses",
        element: <CampusesPage />,
      },
      {
        path: "testimonials",
        element: <TestimonialsPage />,
      },
      {
        path: "features",
        element: <FeaturesPage />,
      },
      {
        path: "statistics",
        element: <StatisticsPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "cta",
        element: <CtaPage />,
      },
      {
        path: "menus",
        element: <MenusPage />,
      },
      {
        path: "pre-registrations",
        element: <PreRegistrationsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

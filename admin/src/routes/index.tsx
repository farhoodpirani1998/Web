/**
 * Lazy-loaded admin routes. Login redirects authenticated users; the
 * `/admin` tree is protected by authentication and route permissions.
 */
import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  RedirectIfAuthenticated,
  RequireAuth,
  RequireRouteAccess,
} from "@/features/auth";

import { ROUTE_PATHS } from "@/routes/paths";

const AchievementsPage = lazy(() =>
  import("@/pages/AchievementsPage").then((module) => ({
    default: module.AchievementsPage,
  })),
);
const AuditLogPage = lazy(() =>
  import("@/pages/AuditLogPage").then((module) => ({ default: module.AuditLogPage })),
);
const AdminUsersPage = lazy(() =>
  import("@/pages/AdminUsersPage").then((module) => ({ default: module.AdminUsersPage })),
);
const AcademicCalendarPage = lazy(() =>
  import("@/pages/AcademicCalendarPage").then((module) => ({
    default: module.AcademicCalendarPage,
  })),
);
const AdmissionsPage = lazy(() =>
  import("@/pages/AdmissionsPage").then((module) => ({ default: module.AdmissionsPage })),
);
const AboutPage = lazy(() =>
  import("@/pages/AboutPage").then((module) => ({ default: module.AboutPage })),
);
const CampusesPage = lazy(() =>
  import("@/pages/CampusesPage").then((module) => ({ default: module.CampusesPage })),
);
const CampusPage = lazy(() =>
  import("@/pages/CampusPage").then((module) => ({ default: module.CampusPage })),
);
const ContentPage = lazy(() =>
  import("@/pages/ContentPage").then((module) => ({ default: module.ContentPage })),
);
const CtaPage = lazy(() =>
  import("@/pages/CtaPage").then((module) => ({ default: module.CtaPage })),
);
const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
const EventsPage = lazy(() =>
  import("@/pages/EventsPage").then((module) => ({ default: module.EventsPage })),
);
const FaqPage = lazy(() =>
  import("@/pages/FaqPage").then((module) => ({ default: module.FaqPage })),
);
const FeaturesPage = lazy(() =>
  import("@/pages/FeaturesPage").then((module) => ({ default: module.FeaturesPage })),
);
const GalleryPage = lazy(() =>
  import("@/pages/GalleryPage").then((module) => ({ default: module.GalleryPage })),
);
const HeroSlidesPage = lazy(() =>
  import("@/pages/HeroSlidesPage").then((module) => ({ default: module.HeroSlidesPage })),
);
const LoginPage = lazy(() =>
  import("@/pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const MediaPage = lazy(() =>
  import("@/pages/MediaPage").then((module) => ({ default: module.MediaPage })),
);
const MenusPage = lazy(() =>
  import("@/pages/MenusPage").then((module) => ({ default: module.MenusPage })),
);
const NewsPage = lazy(() =>
  import("@/pages/NewsPage").then((module) => ({ default: module.NewsPage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })),
);
const PagesPage = lazy(() =>
  import("@/pages/PagesPage").then((module) => ({ default: module.PagesPage })),
);
const PortalLinksPage = lazy(() =>
  import("@/pages/PortalLinksPage").then((module) => ({
    default: module.PortalLinksPage,
  })),
);
const PreRegistrationsPage = lazy(() =>
  import("@/pages/PreRegistrationsPage").then((module) => ({
    default: module.PreRegistrationsPage,
  })),
);
const ContactMessagesPage = lazy(() =>
  import("@/pages/ContactMessagesPage").then((module) => ({
    default: module.ContactMessagesPage,
  })),
);
const NewsletterPage = lazy(() =>
  import("@/pages/NewsletterPage").then((module) => ({
    default: module.NewsletterPage,
  })),
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((module) => ({ default: module.SettingsPage })),
);
const StatisticsPage = lazy(() =>
  import("@/pages/StatisticsPage").then((module) => ({ default: module.StatisticsPage })),
);
const TextbooksPage = lazy(() =>
  import("@/features/cms/textbooks/TextbooksPage").then((module) => ({
    default: module.TextbooksPage,
  })),
);
const TeachersPage = lazy(() =>
  import("@/pages/TeachersPage").then((module) => ({ default: module.TeachersPage })),
);
const TestimonialsPage = lazy(() =>
  import("@/pages/TestimonialsPage").then((module) => ({
    default: module.TestimonialsPage,
  })),
);
const TrustBadgesPage = lazy(() =>
  import("@/pages/TrustBadgesPage").then((module) => ({
    default: module.TrustBadgesPage,
  })),
);

function withPageLoading(page: ReactNode) {
  return (
    <Suspense
      fallback={
        <div role="status" className="py-8 text-center text-sm text-slate-500">
          Ø¯Ø± Ø­Ø§Ù„ Ø¨Ø§Ø±Ú¯Ø°Ø§Ø±ÛŒ ØµÙØ­Ù‡â€¦
        </div>
      }
    >
      {page}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: ROUTE_PATHS.ROOT,
    element: <Navigate to={ROUTE_PATHS.LOGIN} replace />,
  },
  {
    path: ROUTE_PATHS.LOGIN,
    element: (
      <RedirectIfAuthenticated>{withPageLoading(<LoginPage />)}</RedirectIfAuthenticated>
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
        // Pathless layout route: puts one permission gate in front of
        // every admin page â€” including ones added later â€” instead of
        // repeating a guard on each child. See RequireRouteAccess.
        element: <RequireRouteAccess />,
        children: [
          {
            path: "dashboard",
            element: withPageLoading(<DashboardPage />),
          },
          {
            path: "content",
            element: withPageLoading(<ContentPage />),
          },
          {
            path: "media",
            element: withPageLoading(<MediaPage />),
          },
          {
            path: "faqs",
            element: withPageLoading(<FaqPage />),
          },
          {
            path: "achievements",
            element: withPageLoading(<AchievementsPage />),
          },
          {
            path: "academic-calendar",
            element: withPageLoading(<AcademicCalendarPage />),
          },
          {
            path: "admissions",
            element: withPageLoading(<AdmissionsPage />),
          },
          {
            path: "audit-log",
            element: withPageLoading(<AuditLogPage />),
          },
          {
            path: "admin-users",
            element: withPageLoading(<AdminUsersPage />),
          },
          {
            path: "portal-links",
            element: withPageLoading(<PortalLinksPage />),
          },
          {
            path: "gallery",
            element: withPageLoading(<GalleryPage />),
          },
          {
            path: "hero-slides",
            element: withPageLoading(<HeroSlidesPage />),
          },
          {
            path: "news",
            element: withPageLoading(<NewsPage />),
          },
          {
            path: "pages",
            element: withPageLoading(<PagesPage />),
          },
          {
            path: "events",
            element: withPageLoading(<EventsPage />),
          },
          {
            path: "textbooks",
            element: withPageLoading(<TextbooksPage />),
          },
          {
            path: "teachers",
            element: withPageLoading(<TeachersPage />),
          },
          {
            path: "campuses",
            element: withPageLoading(<CampusesPage />),
          },
          {
            path: "campuses-map",
            element: withPageLoading(<CampusPage />),
          },
          {
            path: "testimonials",
            element: withPageLoading(<TestimonialsPage />),
          },
          {
            path: "trust-badges",
            element: withPageLoading(<TrustBadgesPage />),
          },
          {
            path: "features",
            element: withPageLoading(<FeaturesPage />),
          },
          {
            path: "statistics",
            element: withPageLoading(<StatisticsPage />),
          },
          {
            path: "about",
            element: withPageLoading(<AboutPage />),
          },
          {
            path: "cta",
            element: withPageLoading(<CtaPage />),
          },
          {
            path: "menus",
            element: withPageLoading(<MenusPage />),
          },
          {
            path: "pre-registrations",
            element: withPageLoading(<PreRegistrationsPage />),
          },
          {
            path: "contact-messages",
            element: withPageLoading(<ContactMessagesPage />),
          },
          {
            path: "newsletter",
            element: withPageLoading(<NewsletterPage />),
          },
          {
            path: "settings",
            element: withPageLoading(<SettingsPage />),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: withPageLoading(<NotFoundPage />),
  },
]);

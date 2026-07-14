import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/app/layout/AppLayout";
import { PageLoader } from "@/app/layout/PageLoader";

// Route-level code-splitting is the unit of lazy-loading (§7, §29) —
// a visitor only downloads the code for the page they actually visit.
const HomePage = lazy(() =>
  import("@/pages/HomePage").then((m) => ({ default: m.HomePage })),
);
const AboutPage = lazy(() =>
  import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const ContactPage = lazy(() =>
  import("@/pages/ContactPage").then((m) => ({ default: m.ContactPage })),
);
const SchoolsPage = lazy(() =>
  import("@/pages/SchoolsPage").then((m) => ({ default: m.SchoolsPage })),
);
const NewsPage = lazy(() =>
  import("@/pages/NewsPage").then((m) => ({ default: m.NewsPage })),
);
const GalleryPage = lazy(() =>
  import("@/pages/GalleryPage").then((m) => ({ default: m.GalleryPage })),
);
const StatisticsPage = lazy(() =>
  import("@/pages/StatisticsPage").then((m) => ({ default: m.StatisticsPage })),
);
const SitePage = lazy(() =>
  import("@/pages/SitePage").then((m) => ({ default: m.SitePage })),
);
const PreRegistrationPage = lazy(() =>
  import("@/pages/PreRegistrationPage").then((m) => ({ default: m.PreRegistrationPage })),
);
const CampusesPage = lazy(() =>
  import("@/pages/CampusesPage").then((m) => ({ default: m.CampusesPage })),
);
const TeachersPage = lazy(() =>
  import("@/pages/TeachersPage").then((m) => ({ default: m.TeachersPage })),
);
const EventsPage = lazy(() =>
  import("@/pages/EventsPage").then((m) => ({ default: m.EventsPage })),
);
const AdmissionsPage = lazy(() =>
  import("@/pages/AdmissionsPage").then((m) => ({ default: m.AdmissionsPage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

/**
 * Phase 1 ships Persian-only (§28), so routes are not locale-prefixed —
 * a `/:locale` segment would be unnecessary complexity for a
 * single-locale launch. The locale *mechanism* (`src/i18n`) still
 * exists and is unaffected, so reintroducing locale-prefixed routes
 * later (e.g. wrapping this tree in a `:locale` segment backed by
 * `isSupportedLocale`) is additive, not a rewrite.
 *
 * There is deliberately no generic catch-all "render whatever this slug
 * points to" route (§7) — every future route is added explicitly,
 * matching the backend's fixed-schema philosophy.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: withSuspense(<HomePage />),
      },
      {
        path: "about",
        element: withSuspense(<AboutPage />),
      },
      {
        path: "schools",
        element: withSuspense(<SchoolsPage />),
      },
      {
        path: "news",
        element: withSuspense(<NewsPage />),
      },
      {
        path: "gallery",
        element: withSuspense(<GalleryPage />),
      },
      {
        path: "statistics",
        element: withSuspense(<StatisticsPage />),
      },
      {
        path: "contact",
        element: withSuspense(<ContactPage />),
      },
      {
        path: "site",
        element: withSuspense(<SitePage />),
      },
      {
        path: "pre-registration",
        element: withSuspense(<PreRegistrationPage />),
      },
      {
        path: "campuses",
        element: withSuspense(<CampusesPage />),
      },
      {
        path: "teachers",
        element: withSuspense(<TeachersPage />),
      },
      {
        path: "events",
        element: withSuspense(<EventsPage />),
      },
      {
        path: "admissions",
        element: withSuspense(<AdmissionsPage />),
      },
      {
        path: "*",
        element: withSuspense(<NotFoundPage />),
      },
    ],
  },
]);

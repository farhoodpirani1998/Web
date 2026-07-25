import { ROUTE_PATHS } from "@/routes/paths";

import { fetchCampusesList } from "../campuses";
import { fetchEventsList } from "../events";
import { fetchFaqList, type CmsFaq } from "../faq";
import { fetchFeatureList } from "../features";
import { fetchGalleryList, type CmsGalleryItem } from "../gallery";
import { fetchHeroSlideList } from "../hero-slides";
import { fetchMenuList, type CmsMenu } from "../menus";
import { fetchNewsList } from "../news";
import { fetchPagesList } from "../pages";
import { fetchPortalLinkList, type CmsPortalLink } from "../portal-links";
import { fetchStatisticList } from "../statistics";
import { fetchTeachersList } from "../teachers";
import { fetchTestimonialList } from "../testimonials";
import { CMS_DEFAULT_LOCALE, type Translatable } from "../types";
import type { ContentSearchResult } from "./types";

/**
 * Content search index for the Command Palette.
 *
 * Every entry below calls a module's *existing* `fetch*List` function
 * from that module's own `api.ts` (e.g. `fetchNewsList`) — no new
 * endpoint, no new query params, per this sprint's "avoid backend
 * changes unless absolutely necessary" requirement. Each list
 * endpoint already returns its full unfiltered array (no admin CMS
 * list paginates — see `features/cms/README.md`), so filtering by the
 * search query happens entirely client-side in `useGlobalSearch`.
 *
 * Deliberately excludes:
 *  - Singleton modules with no list endpoint at all: About, CTA, Site
 *    Settings. Site Settings in particular is documented as
 *    deliberately un-list-like — one row per site, no id to link a
 *    search result to (see the `SiteSettings` entity's own doc
 *    comment) — these all just navigate via the nav search results.
 *  - Media: files identified by filename/alt text, not a title field
 *    every other module shares; a "Media" quick-nav result already
 *    covers "take me to the media library" via `navRegistry.ts`.
 *  - Pre-Registrations: lead/submission data, not CMS content.
 *
 * `SEARCHABLE_MODULES` holds one non-generic `SearchableModule` per
 * module even though each module's list returns a different concrete
 * entity type (`CmsNewsArticle`, `CmsFaq`, ...): `toResult` takes
 * `unknown` and casts back to that module's own type in exactly one
 * place, right where it's defined (either inline, or once inside
 * `statusModule` for the modules sharing the common
 * id/translatable-title/`CmsPublishStatus` shape). No `any` involved,
 * and every module's array item still flows through a real,
 * module-specific mapping — this is just how a single array can hold
 * several differently-shaped module descriptors.
 */
interface SearchableModule {
  moduleId: string;
  moduleLabel: string;
  route: string;
  fetchList(): Promise<unknown[]>;
  toResult(item: unknown): ContentSearchResult;
}

/**
 * Every module already just reads `.fa` directly off a `Translatable`
 * field for display (e.g. `NewsRow` renders `article.title.fa`) since
 * `fa` is the one locale `Translatable<T>` requires. This does the
 * same, plus a plain-string passthrough for the handful of fields
 * (`fullName`, `authorName`, `CmsMenu.name`) that were never
 * translatable in the first place.
 */
function resolveTranslatable(value: Translatable<string> | string | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[CMS_DEFAULT_LOCALE];
}

function capitalize(value: string): string {
  return value.length === 0 ? value : value[0].toUpperCase() + value.slice(1);
}

/** Builds a `SearchableModule` for the common "id + translatable title + `CmsPublishStatus`" shape most content modules share. */
function statusModule<T extends { id: string; status: string }>(
  moduleId: string,
  moduleLabel: string,
  route: string,
  fetchList: () => Promise<T[]>,
  getTitle: (item: T) => Translatable<string> | string,
): SearchableModule {
  return {
    moduleId,
    moduleLabel,
    route,
    fetchList,
    toResult(rawItem: unknown): ContentSearchResult {
      const item = rawItem as T;
      return {
        kind: "content",
        id: `${moduleId}:${item.id}`,
        moduleId,
        moduleLabel,
        title: resolveTranslatable(getTitle(item)) || "(untitled)",
        subtitle: capitalize(item.status),
        route,
      };
    },
  };
}

const SEARCHABLE_MODULES: SearchableModule[] = [
  statusModule("news", "News", ROUTE_PATHS.ADMIN_NEWS, fetchNewsList, (item) => item.title),
  statusModule("pages", "Pages", ROUTE_PATHS.ADMIN_PAGES, fetchPagesList, (item) => item.title),
  statusModule(
    "events",
    "Events",
    ROUTE_PATHS.ADMIN_EVENTS,
    fetchEventsList,
    (item) => item.title,
  ),
  statusModule(
    "teachers",
    "Teachers",
    ROUTE_PATHS.ADMIN_TEACHERS,
    fetchTeachersList,
    (item) => item.fullName,
  ),
  statusModule(
    "campuses",
    "Campuses",
    ROUTE_PATHS.ADMIN_CAMPUSES,
    fetchCampusesList,
    (item) => item.title,
  ),
  statusModule(
    "testimonials",
    "Testimonials",
    ROUTE_PATHS.ADMIN_TESTIMONIALS,
    fetchTestimonialList,
    (item) => item.authorName,
  ),
  statusModule(
    "features",
    "Features",
    ROUTE_PATHS.ADMIN_FEATURES,
    fetchFeatureList,
    (item) => item.title,
  ),
  statusModule(
    "hero-slides",
    "Hero Slides",
    ROUTE_PATHS.ADMIN_HERO_SLIDES,
    fetchHeroSlideList,
    (item) => item.heading,
  ),
  statusModule(
    "statistics",
    "Statistics",
    ROUTE_PATHS.ADMIN_STATISTICS,
    fetchStatisticList,
    (item) => item.label,
  ),
  // --- Modules with no `CmsPublishStatus` — each defines its own `toResult`. ---
  {
    moduleId: "faq",
    moduleLabel: "FAQ",
    route: ROUTE_PATHS.ADMIN_FAQS,
    fetchList: fetchFaqList,
    toResult(rawItem: unknown): ContentSearchResult {
      const item = rawItem as CmsFaq;
      return {
        kind: "content",
        id: `faq:${item.id}`,
        moduleId: "faq",
        moduleLabel: "FAQ",
        title: resolveTranslatable(item.question) || "(untitled)",
        subtitle: capitalize(item.status),
        route: ROUTE_PATHS.ADMIN_FAQS,
      };
    },
  },
  {
    moduleId: "gallery",
    moduleLabel: "Gallery",
    route: ROUTE_PATHS.ADMIN_GALLERY,
    fetchList: fetchGalleryList,
    toResult(rawItem: unknown): ContentSearchResult {
      const item = rawItem as CmsGalleryItem;
      return {
        kind: "content",
        id: `gallery:${item.id}`,
        moduleId: "gallery",
        moduleLabel: "Gallery",
        title: resolveTranslatable(item.caption) || "(untitled)",
        subtitle: capitalize(item.status),
        route: ROUTE_PATHS.ADMIN_GALLERY,
      };
    },
  },
  {
    moduleId: "portal-links",
    moduleLabel: "Portal Links",
    route: ROUTE_PATHS.ADMIN_PORTAL_LINKS,
    fetchList: fetchPortalLinkList,
    toResult(rawItem: unknown): ContentSearchResult {
      const item = rawItem as CmsPortalLink;
      return {
        kind: "content",
        id: `portal-links:${item.id}`,
        moduleId: "portal-links",
        moduleLabel: "Portal Links",
        title: resolveTranslatable(item.label) || "(untitled)",
        subtitle: item.visible ? "Visible" : "Hidden",
        route: ROUTE_PATHS.ADMIN_PORTAL_LINKS,
      };
    },
  },
  {
    moduleId: "menus",
    moduleLabel: "Menus",
    route: ROUTE_PATHS.ADMIN_MENUS,
    fetchList: fetchMenuList,
    toResult(rawItem: unknown): ContentSearchResult {
      const item = rawItem as CmsMenu;
      return {
        kind: "content",
        id: `menus:${item.id}`,
        moduleId: "menus",
        moduleLabel: "Menus",
        title: item.name || "(untitled)",
        subtitle: item.key,
        route: ROUTE_PATHS.ADMIN_MENUS,
      };
    },
  },
];

/**
 * Fetches every searchable module's list in parallel and flattens the
 * results into one array, in `SEARCHABLE_MODULES` order (so results
 * group predictably by module in the UI). Uses `Promise.allSettled`,
 * not `Promise.all` — same reasoning as `useDashboardStats`: an admin
 * missing `website.content:read` shouldn't blank out every other
 * module's results, each module's contribution just becomes empty if
 * its own request fails (permission, network, or otherwise).
 */
export async function fetchContentSearchIndex(): Promise<ContentSearchResult[]> {
  const settled = await Promise.allSettled(
    SEARCHABLE_MODULES.map((module) => module.fetchList()),
  );

  const results: ContentSearchResult[] = [];
  settled.forEach((outcome, index) => {
    if (outcome.status !== "fulfilled") return;
    const module = SEARCHABLE_MODULES[index];
    for (const item of outcome.value) {
      results.push(module.toResult(item));
    }
  });

  return results;
}

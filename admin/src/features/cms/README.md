# features/cms/

Foundation for CMS content modules (News, Pages, Gallery, Events, etc.).
Sprint 2.6 laid down architecture-only conventions; Sprint 3.4 adds the
first real module (`media/`) plus the shared-components folder, per the
Sprint 3.3 audit's recommended build order (§6: media first, since
every other module's "select an image" control depends on it).

- `types.ts` — cross-module conventions only (`CmsLocale`,
  `Translatable<T>`, `CmsPublishStatus`, `CmsEntityMeta`), mirrored from
  backend `core/` conventions every content module shares. Module-specific
  entity shapes (e.g. a future `NewsArticle` type) do NOT belong here —
  they belong in that module's own `features/cms/<module>/types.ts`,
  same as the public frontend's per-feature `types.ts` files.
- `media/` — Sprint 3.4 built the API/cache/hooks/`MediaPicker`
  foundation; Sprint 3.5 adds the actual Media Library page on top of
  it (`MediaPage`, `MediaGrid`, `MediaCard`, `MediaUploadDialog`,
  `MediaDeleteConfirm`, `MediaStatusFilter`), wired at `/admin/media`
  via `pages/MediaPage.tsx`. See `media/index.ts` for the full public
  surface — this is the reference implementation the pattern notes
  below describe — read its files before starting a second module.
- `components/` — Sprint 3.4: shared UI used by more than one CMS
  module (see its own README for what belongs there vs. a module
  folder vs. `components/ui/`). Empty today — Media is still the only
  module, so nothing has proven itself shared yet.
- `faq/` — Sprint 3.6: the FAQ module (draft/published/archived
  lifecycle, category, reorder). Reference example of a module with a
  `CmsPublishStatus` lifecycle.
- `site-settings/` — Sprint 3.7: the singleton Site Settings module
  (General/Contact/Social sections, each with its own PATCH endpoint
  and its own Save button in `SettingsForm`). SEO and Feature Flags
  are real sections on the entity but have no form yet — they're
  gated behind `website.seo:manage`/`website.feature_flags:manage`,
  outside this sprint's permission scope. `GeneralSection`'s logo/
  favicon fields are the first real consumer of `media/MediaPicker`
  outside the Media module itself.
- `portal-links/` — Sprint 3.7: Portal Links (flat ordered list,
  external URLs, no publish lifecycle — just a `visible` toggle).
  Lives in its own module folder even though its backend routes live
  on the Site Settings module (`SiteSettingsModule`) — same "own
  entity → own frontend module" split the backend's own
  `PortalLink` entity doc explains.
- `news/` — Sprint 3.10: the News module (draft/published/archived
  lifecycle, category + tags, featured image, SEO fields, scheduled
  publishing via a dedicated `/schedule` action, and a revisions
  history/restore panel). No `reorder` endpoint — News has no
  `position` field, unlike FAQ/Gallery/Hero (see `news/types.ts`'s top
  comment). First module to render `seo` fields and the first to build
  a revisions history UI, since News is the first content module whose
  own sprint scope covers both.
- `pages/` — Sprint 3.11: generic content pages (draft/published/
  archived lifecycle, template select, optional parent page for admin
  hierarchy, `showInMenu` toggle, featured image, SEO fields,
  scheduled publishing, revisions history/restore, and homepage
  designation). No `category`/`tags`/`excerpt` — the entity doesn't
  have those, unlike News. No `reorder` endpoint, same reasoning as
  News (see `pages/types.ts`'s top comment). The only module so far
  with a self-referencing hierarchy (`parentId`) and the only one with
  a homepage-designation action (`PageHomepageControl.tsx`) — both
  Pages-only concerns News has no equivalent of.
- `events/` — Sprint 3.12: calendar events (draft/published/archived
  lifecycle, category + tags, optional translatable `location` +
  `locationUrl`, required `startAt`/optional `endAt`/`allDay`,
  featured image, SEO fields, scheduled publishing via a dedicated
  `/schedule` action, and a revisions history/restore panel). Modeled
  directly on News: same category+tags/seo/featured-image/schedule/
  revisions shape, plus the handful of fields an event needs beyond an
  article (`startAt`/`endAt`/`allDay`/`location`/`locationUrl`) — see
  `events/types.ts`'s top comment. No `reorder` endpoint, same
  reasoning as News/Pages — an events list's natural order is
  chronological by `startAt`, not a manually dragged sequence.
  `EventForm` is the only form so far with real client-side date-range
  validation (`endAt` not before `startAt`), mirroring
  `EventsService.assertValidRange` server-side.
- `global-search/` — Sprint — CMS UX: Global Search + Command Palette:
  a Ctrl/Cmd+K palette searching two things — the static nav list
  (`ADMIN_NAV_ITEMS`, always available) and content across every
  list-shaped module (title/name/question/etc., via each module's own
  `fetch*List`). Pure client-side composition: no new backend
  endpoint, no new permission, no changes to any other module's files
  beyond `AdminLayout`/`AdminHeader` wiring it in. Selecting a content
  result navigates to that module's list page — there's no per-item
  detail route anywhere in this admin for it to deep-link into (see
  `global-search/types.ts`'s top comment). Excludes singleton modules
  (About, CTA, Site Settings — see the `SiteSettings` entity's own
  "no revision tracking" doc comment for the same "singleton, not a
  list" reasoning), Media (files, not a title field), and
  Pre-Registrations (lead data, not content) — see
  `global-search/contentSearchRegistry.ts`'s top comment for the full
  list and reasoning.

## Where things go, once a real module is built

Each module gets its own folder, `features/cms/<module>/`, following
the same shape `features/auth/` already established (see `media/` for
a worked example):

- **APIs** — `features/cms/<module>/api.ts`. Only this file knows the
  module's endpoint URLs (e.g. `/admin/news`); everything else calls
  its exported functions, never `apiClient` directly. Uses the shared
  `apiClient` from `@/lib/apiClient` — same client the auth feature
  uses, no per-module client. Paths are bare (`/news`, not
  `/admin/news`) since `apiClient`'s base URL already points at
  `.../admin` — see `media/api.ts`.
- **Hooks** — data-fetching/state hooks specific to one module (e.g. a
  future `useNews`) live in `features/cms/<module>/`, next to that
  module's `api.ts`, not in the shared `src/hooks/`. `src/hooks/` is
  reserved for hooks reused *across* modules (e.g. `usePermissions`,
  Sprint 2.5) — the same split the public frontend uses between its
  per-feature hooks and `shared/hooks/`. A module whose entities
  reference media by id should resolve it via `media/useMediaById`
  (Sprint 3.4) rather than fetching `/admin/media/:id` itself — see
  the audit's N+1 warning (§3).
- **Components** — module-specific UI (list tables, forms, cards) lives
  in `features/cms/<module>/`. A component only moves up to
  `features/cms/components/` once a *second CMS module* needs it too,
  or to the app-wide `components/ui/` if something outside the CMS
  admin needs it — don't pre-promote something used by exactly one
  module.
- **Permissions** — every module gates its actions with `usePermissions()`
  (or `<PermissionGate>`) from Sprint 2.5, checked against the
  `AdminPermission` values that already exist (`website.content:read`,
  `website.content:write`, `website.content:publish`,
  `website.media:manage`, etc.) — never reimplemented per module. This
  is a UI convenience only; the backend's own `RequireCmsPermission`
  guards are the actual enforcement. See `media/MediaPicker.tsx` for a
  worked example, including the audit's flagged (not fixed) gap where
  `content_editor`/`publisher` lack `website.media:manage`.
- **List data** — no module's list endpoint paginates or supports
  search (see this file's earlier comment and the audit, §3); build
  list UIs to expect a plain unbounded array, same as `media/useMediaList`.

## Explicitly out of scope for this sprint (3.4)

No News/Pages/Gallery/FAQ/etc. module yet — this sprint only builds
Media (per the audit's build-order rationale: every other module
depends on it) and the shared conventions/folders those modules will
use. See the Sprint 3.3 audit §6 for the intended order after this.

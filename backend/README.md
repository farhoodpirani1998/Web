# nhg-website-backend

Standalone backend for the public website + CMS. **Independent deployable
from the School Management System (SMS)** — separate repo, separate
database, separate process, separate scaling.

## What's here (Phase 0 — kernel)

Ported from the group's kernel design, adapted for standalone deployment:

- `core/common` — base entities (`BaseEntity`, `BaseSiteScopedEntity`)
- `core/events` — domain event names + `EventEmitterModule` wrapper
- `core/site` — `Site` root entity, `siteId` scoping (multi-site-ready, single-site today)
- `core/seo` — `SeoMetadata` embeddable, `SitemapService` registry
- `core/publishing` — draft/published/archived transitions + event emission
- `core/ordering` — shared drag-and-drop reorder helper
- `core/i18n` — `Locale` enum + `Translatable<T>` convention
- `core/media` — `Media`/`MediaUsage` entities, `MediaService`, `StorageProvider`
  interface with `LocalStorageProvider` and `S3CompatibleStorageProvider`
- `core/revisions` — `ContentRevision` shared table, scoped to the 4 modules
  that need it (`hero`, `about`, `news_article`, `static_page`)

Each kernel piece is its own NestJS module with explicit `imports`/`exports`
— no barrel module. `WebsiteModule` is a composition root only.

## What's different from the original (merged-into-SMS) design

This backend does **not** share SMS's database, RBAC tables, or audit log.
The single biggest adaptation is in `modules/website/auth/`:

- `WebsiteAuthGuard` verifies the **signature only** of a JWT issued by SMS,
  using SMS's RSA **public** key (`SMS_JWT_PUBLIC_KEY_PATH`). No shared
  secret, no call back to SMS on the request path, no shared session.
- Authorization is **this backend's own** — `WebsiteRoleAssignment` maps an
  SMS user id (`sub` claim) to one of five fixed roles
  (`WebsiteRole`), each with a fixed permission set (`ROLE_PERMISSIONS`).
  This table lives only in this database.
- Parent/teacher/admin *login* still happens in SMS; this backend only
  verifies the token SMS issued and decides website-specific permissions
  locally.

## Not yet built (next steps, in order)

1. **Content modules** (Phase 2+): Campuses,
   Stats, Achievements, CTA Banners — each importing only the
   kernel pieces it actually needs. (FAQ, Testimonials, Hero, About,
   Features, Gallery, News, Static Pages, Navigation, and Site Settings
   — which bundles General/Contact/Social/SEO/Feature Flags plus Portal
   Links — are already in place.)
2. **Public API layer**: read-only, cached, unauthenticated, aggregated
   endpoints (`/public/website/homepage`, etc.) — needs its own tighter
   throttle policy separate from admin routes (see `ThrottlerModule` note
   in `app.module.ts`).
3. **`SMS_JWT_PUBLIC_KEY_PATH`**: get the actual public key exported from
   SMS and drop it in `./keys/`. Until then, `WebsiteAuthGuard` will throw
   on startup (fails loud, not silently).
4. A real migration for `Site` seeding + first `WebsiteRoleAssignment` row
   for yourself as `website_super_admin`.

## Running locally

Network access wasn't available in the environment this was scaffolded in,
so `npm install` hasn't been run. From your machine:

```bash
npm install
cp .env.example .env   # fill in DB credentials + SMS public key path
npm run start:dev
```

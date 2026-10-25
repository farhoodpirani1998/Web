# nhg-website-backend

Standalone backend for the public website + CMS. **Independent deployable
from the School Management System (SMS)** — separate repo, separate
database, separate process, separate scaling.

## What's here

The backend includes the standalone kernel, CMS identity, content modules,
and the public API:

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
- `content/*` — admin-managed content for news, pages, events, campuses,
  teachers, media, settings, admissions, achievements, and related sections
- `public-api/*` — unauthenticated, rate-limited public content endpoints,
  sitemap, read-through Redis caching, and pre-registration submission

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

## Remaining production work

- Replace `keys/sms-public-key.pem`, which is a local-development
  placeholder, with the production SMS verification public key.
- Configure production secrets and isolated staging/production
  infrastructure; follow the operational procedures in `docs/DEPLOYMENT.md`.
- Provision the first `website_super_admin` role assignment and verify
  initial site content as a controlled deployment/onboarding step.

## Running locally

```bash
npm install
cp .env.example .env   # already done for local dev — adjust DB credentials if needed
npm run start:dev
```

A Postgres instance matching your `.env` `DATABASE_*` values must be
running and reachable — `TypeOrmModule` will retry and then fail loudly if
it isn't, same as any other missing infrastructure dependency.

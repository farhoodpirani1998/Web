# nhg-website-backend

Standalone backend for the public website and CMS, with its own API,
database, and authentication.

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

## Authentication and authorization

CMS administrators authenticate locally with email and password. Access
tokens are signed with `CMS_JWT_SECRET`; refresh tokens are stored hashed
and delivered in an httpOnly cookie. The fixed `WebsiteRole` roles map to
permissions in `ROLE_PERMISSIONS`, and CMS routes use the CMS auth and
permission guards. `npm run bootstrap:admin` creates the initial
administrator.

## Remaining production work

- Configure production secrets and isolated staging/production
  infrastructure; follow the operational procedures in `docs/DEPLOYMENT.md`.
- Provision the first CMS administrator and verify initial site content
  as a controlled deployment/onboarding step.

## Running locally

```bash
npm install
cp .env.example .env   # already done for local dev — adjust DB credentials if needed
npm run start:dev
```

A Postgres instance matching your `.env` `DATABASE_*` values must be
running and reachable — `TypeOrmModule` will retry and then fail loudly if
it isn't, same as any other missing infrastructure dependency.

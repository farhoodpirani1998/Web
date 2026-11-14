# Website Backend

NestJS API and persistence layer for the public website and CMS. This application exposes public read/form-submission endpoints and authenticated admin endpoints. PostgreSQL stores CMS data; Redis backs the cache service.

## Modules

- `core/`: shared entities and site scope, events, health, SEO, Redis, publishing, ordering, internationalized field types, media storage, revisions, and audit logging.
- `identity/`: local CMS administrator accounts, authentication, refresh sessions, and permission guards.
- `content/`: CMS-managed pages, news, events, campuses, teachers, media, navigation, settings, admissions, achievements, academic calendar, testimonials, trust badges, textbooks, and public form submissions.
- `public-api/`: public content reads, sitemap, and contact, newsletter, and pre-registration submissions.

`WebsiteModule` composes these modules. Public routes are mounted under `/public`; CMS routes are mounted under `/admin`.

## CMS authentication

Administrators sign in with a locally managed email and password. `CMS_JWT_SECRET` signs short-lived access tokens. Refresh tokens are stored hashed and sent to the browser in an httpOnly cookie. CMS roles are mapped to permissions and checked by the authentication and permission guards. The external identity/role-assignment integration is not part of this backend.

Create the initial administrator with `npm run bootstrap:admin` (or `npm run bootstrap:admin:prod` for the compiled application) and one-off `CMS_BOOTSTRAP_ADMIN_EMAIL` and `CMS_BOOTSTRAP_ADMIN_PASSWORD` environment variables.

## Requirements and local setup

The backend Docker images and GitHub Actions use Node 22. `backend/package.json` does not declare an `engines` range. A reachable PostgreSQL instance is required; Redis should also be available for the configured cache and rate-limit services.

```bash
npm ci
```

Copy `.env.example` to `.env`, configure the database, and set a random `CMS_JWT_SECRET` of at least 32 characters. Then run migrations and start the development server:

```bash
npm run migration:run
npm run start:dev
```

Local development defaults to port `3100`. Do not enable TypeORM `synchronize` in production; schema changes are managed with migrations.

## Environment configuration

`backend/.env.example` is the complete variable reference. Important settings include:

| Variables | Purpose |
| --- | --- |
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_SYNCHRONIZE` | PostgreSQL connection and schema behavior |
| `CMS_JWT_SECRET`, `CMS_JWT_ISSUER`, `CMS_JWT_EXPIRES_IN`, `CMS_REFRESH_*` | CMS access and refresh sessions |
| `CORS_ALLOWED_ORIGINS`, `TRUST_PROXY`, `HSTS_*`, `BODY_LIMIT_*` | Browser access and HTTP deployment settings |
| `STORAGE_DRIVER`, `LOCAL_STORAGE_PATH`, `S3_*`, `MEDIA_*` | Media storage provider and upload constraints |
| `REDIS_*`, `THROTTLE_*` | Redis and rate limits |
| `PUBLIC_SITE_URL`, `PORT`, `SENTRY_*`, `LOG_*`, `SWAGGER_ENABLED` | Public URLs, runtime port, diagnostics, logging, and API docs |

`CORS_ALLOWED_ORIGINS`, `CMS_JWT_SECRET`, and `SENTRY_DSN` are required for production startup/configuration as described in the example file and validation code. Never commit real environment files.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run start:dev` | Start NestJS in watch mode |
| `npm run build` | Compile the backend |
| `npm run start:prod` | Start the compiled backend |
| `npm run migration:run` | Run migrations from TypeScript |
| `npm run migration:run:prod` | Run compiled migrations |
| `npm test -- --runInBand` | Run unit tests serially |
| `npm run test:e2e -- --runInBand` | Run integration/e2e tests |
| `npm run lint` | Run ESLint with automatic fixes (`--fix`) |

The e2e suite requires the PostgreSQL and Redis services configured for it. For the production Compose setup and operational checks, see [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md).

## Textbook file cleanup

Replacing or deleting an uploaded textbook commits a cleanup intent in the same PostgreSQL transaction as the textbook change. A background worker retries storage deletion with backoff; after eight failures it retains the intent and logs an error for operator recovery.

Review exhausted cleanup intents before retrying:

```sql
SELECT file_key, attempt_count, last_error, exhausted_at
FROM textbook_file_cleanup
WHERE exhausted_at IS NOT NULL
ORDER BY exhausted_at;
```

After confirming the storage service is healthy and the referenced key is safe to remove, requeue a specific intent:

```sql
UPDATE textbook_file_cleanup
SET attempt_count = 0,
    next_attempt_at = now(),
    last_error = NULL,
    exhausted_at = NULL
WHERE file_key = '<verified-file-key>';
```

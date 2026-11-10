# Production Readiness Audit

This report replaces the historical readiness report and reflects the current repository configuration and source.

## Current status

- The repository contains three independently managed applications: `frontend/`, `admin/`, and `backend/`.
- Their current builds, lint commands, and unit-test suites pass locally. Backend lint reports 17 existing `no-console` warnings and no errors.
- CI and all Dockerfiles use Node 22. The frontend declares Node `>=18.18.0`, the admin declares `>=22.12.0`, and the backend package does not declare an `engines` range.
- The admin GitHub workflow now uses Node 22, matching the admin engine requirement.
- Local media deletion now ignores only `ENOENT`, logs other errors, and rethrows them; this previously reported issue is resolved.
- The historical production and bug reports contained claims contradicted by current routes and code. `BUGS_REPORT.md` has been removed because no independently verified finding from it remained. Confirmed findings are retained in `AUDIT_REPORT.md` and below.

## Confirmed application findings

| # | Severity | File | Lines | Finding |
|---|---|---|---|---|
| 1 | MEDIUM | `backend/src/modules/website/core/media/media.service.ts` | 184-193 | Media usage is checked separately from storage and database deletion. A concurrent usage attachment can race with `purge`, leaving a content reference to a deleted file. |
| 2 | MEDIUM | `backend/src/modules/website/core/ordering/ordering.service.ts` | 12-25 | The shared reorder helper does not validate that `orderedIds` is the complete, unique set of current item IDs. Partial or duplicate lists can leave unchanged or duplicate positions. |

## Deployment prerequisites and verification limits

- Production requires real database credentials, a unique `CMS_JWT_SECRET`, allowed CORS origins, and a production `SENTRY_DSN`; see `docker-compose.yml` and `backend/.env.example`.
- The repository does not schedule database backups. An operator must configure the daily schedule and off-host destination described in `docs/DEPLOYMENT.md:119-123`.
- The repository does not deploy to staging or production automatically (`docs/DEPLOYMENT.md:83`). This audit did not exercise a live staging host, TLS issuance, external storage, or a production recovery.
- CI runs admin lint but does not run the frontend lint or the full backend source lint script (`.github/workflows/ci.yml`). Local lint commands were run for all three applications.
- The backend e2e suite was not run locally; CI config runs it with PostgreSQL and Redis services.

## Validation performed

| Application | Build | Lint | Tests |
|---|---|---|---|
| `frontend/` | Pass | Pass | 31 files, 105 tests passed |
| `admin/` | Pass | Pass | 27 files, 84 tests passed |
| `backend/` | Pass | Pass, 17 warnings / 0 errors | 59 suites, 356 tests passed |

These local checks do not substitute for the documented staging smoke test and backup-restore verification.

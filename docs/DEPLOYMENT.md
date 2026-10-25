# Docker deployment with automatic HTTPS

This deployment runs the public site, admin app, and NestJS API behind Caddy. Caddy terminates public TLS, obtains and renews certificates automatically, and proxies requests to containers over the private Compose network. The API, PostgreSQL, and Redis are not published directly on host ports.

## Requirements

- Docker Engine and the `docker compose` plugin.
- A server with inbound TCP ports 80 and 443 available (UDP 443 is optional for HTTP/3).
- Public DNS A/AAAA records for the site, admin, and API hostnames pointing to that server. Do not publish an AAAA record unless IPv6 reaches the server.
- A production SMS JWT verification **public** key file. Never mount the SMS private key.

## Configure

1. Copy the root `.env.example` to `.env` and set real hostnames, database credentials, the public key file path, and exact allowed browser origins. The root `.env` is ignored by Git.
2. Create `backend/.env` from `backend/.env.example`. For a production deployment, supply `CMS_JWT_SECRET` from a secrets manager or generate a strong value with `openssl rand -hex 32`; keep it at least 32 characters, and do not commit the file. `setup.sh` generates a local development value when the field is blank and rejects values shorter than 32 characters.
3. Set `SMS_JWT_PUBLIC_KEY_FILE` in root `.env` to the absolute or project-relative path of the production public key. Its path must exist on the Docker host.
4. Make sure `DATABASE_NAME` and `DATABASE_USER` agree between root `.env` and `backend/.env`. Compose overrides the backend database host, credentials, Redis host, CORS origins, TLS-related cookie settings, and production mode.
5. Replace the placeholder SMS public key and any sample credentials before going live. Do not use `.env.example` values in production.

## Start

From the repository root:

```sh
docker compose config
docker compose up --build -d
docker compose ps
```

Caddy serves:

- `https://SITE_DOMAIN` — public website
- `https://ADMIN_DOMAIN` — admin application
- `https://API_DOMAIN` — backend API

Caddy requires the DNS records to resolve publicly and port 80/443 to reach the server before it can issue certificates. Certificate data is persisted in the `caddy-data` volume and renewed automatically. Do not remove that volume during routine upgrades.

## Operations

```sh
docker compose logs -f caddy backend
docker compose pull
docker compose up --build -d
```

Database migrations are not run automatically on app startup. Run the backend migration command as a controlled deployment step with the production environment and network available before switching traffic to a release that requires new schema changes.

TLS terminates at Caddy. The backend trusts one proxy hop (`TRUST_PROXY=1`), enables secure refresh cookies and HSTS in production, and is reachable only on the private Compose network. Do not expose backend, database, or Redis ports publicly.

Security response headers are issued by Caddy, not by the containers: the `Caddyfile` defines a
`(sec_headers)` snippet (HSTS with `includeSubDomains`, `X-Content-Type-Options`,
`X-Frame-Options DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`) and
a `(spa_csp)` Content-Security-Policy, both imported only into the site and admin blocks. The
backend keeps emitting its own helmet headers, so the API block deliberately does not re-declare
HSTS — two `Strict-Transport-Security` headers on one response are not merged into a stronger
policy, the browser takes the first. For the same reason the `frontend`/`admin` `nginx.conf` files
stay header-free: those containers are `expose`-only and never reached except through Caddy, so
adding a second CSP there would make browsers enforce two policies at once (the intersection),
which is how a hardening change silently breaks a working site.

Validate the config on the server before reload, and let the smoke test prove it on the wire:

```sh
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
node ops/smoke-test.mjs   # fails if site/admin HTML is served without HSTS/CSP/XFO/nosniff
```

## Staging verification

Use an isolated staging environment with separate domains, credentials, database, Redis, storage, and CMS signing secret. Never point staging at production data or reuse production signing credentials. Compose runs the API with `NODE_ENV=production`, so `backend/.env` must include a real `SENTRY_DSN` before the backend will start.

Tag each staging/production bring-up so the previous image set can be started again:

```sh
export RELEASE_TAG=$(date -u +%Y%m%dT%H%M%SZ)
export CMS_BOOTSTRAP_ADMIN_EMAIL=you@example.com
export CMS_BOOTSTRAP_ADMIN_PASSWORD='a-strong-password-at-least-12-chars'
sh ops/staging-bootstrap.sh
```

The bootstrap script builds and starts Compose, waits for `/health`, runs `npm run migration:run:prod` inside the backend container, and creates the first Super Admin when those two env vars are set. It refuses to create a second admin; that is expected on later deploys. Confirm the public site and admin shell load in the browser after DNS and certificates are in place.

This repository does not deploy to staging or production automatically.

## Smoke test

After migrations and bootstrap, run:

```sh
SITE_URL=https://staging.example.com \
ADMIN_URL=https://admin.staging.example.com \
API_URL=https://api.staging.example.com \
CMS_SMOKE_EMAIL=you@example.com \
CMS_SMOKE_PASSWORD='the-bootstrap-password' \
node ops/smoke-test.mjs
```

The script checks HTTPS URLs, TLS (via the Node HTTPS client), site/admin HTML **including the
security response headers** (HSTS with a max-age of at least six digits, Content-Security-Policy,
X-Frame-Options, X-Content-Type-Options), `/health` plus HSTS, a CORS preflight from `SITE_URL`
(override with `SMOKE_CORS_ORIGIN`; a wildcard `Access-Control-Allow-Origin` is a failure, not a
pass), public API routes, CMS login and refresh, permissioned `/admin/news`, and a PNG upload that
is then deleted. Set `SMOKE_SKIP_AUTH=1` only when you intentionally cannot use a CMS account.

Also perform a manual CMS login, refresh, logout, content publish, and upload in the admin UI before approving production rollout.

## PostgreSQL backup and restore verification

Create an archive backup from the running Compose database and validate its archive index:

```sh
sh ops/backup-postgres.sh
```

Copy successful backups off the application host to access-controlled, encrypted storage. Keep retention and deletion policy in that storage system; a backup on the same host or Compose volume is not disaster recovery.

Schedule the backup at least daily using the host's approved scheduler, and send it to a restricted backup mount that is replicated off-host. For example, a host cron entry can run the script at 02:00 UTC:

```cron
0 2 * * * cd /srv/nhg-website && BACKUP_DIR=/mnt/encrypted-backups/nhg-website sh ops/backup-postgres.sh >> /var/log/nhg-website-backup.log 2>&1
```

Configure the backup storage lifecycle separately (for example, retain 14 daily and 12 monthly copies), monitor backup-job failures, and perform a restore verification at least monthly. Align actual retention and schedule with the approved RPO/RTO and applicable data-retention requirements.

Periodically restore a backup into a disposable database and verify its TypeORM migration history:

```sh
sh ops/verify-postgres-backup.sh ./backups/nhg-website-YYYYMMDDTHHMMSSZ.dump
```

The verification script creates and drops only a uniquely named temporary database in the Compose PostgreSQL service; it does not overwrite the configured application database. Run it against a staging or dedicated recovery environment, never against production during a change window.

For an actual recovery, stop writes and preserve a fresh copy of the target database first. Restore into a **new** database (the script refuses the currently configured database, requires a typed confirmation, and removes its newly created database if restoration fails):

```sh
sh ops/restore-postgres-to-new-db.sh ./backups/nhg-website-YYYYMMDDTHHMMSSZ.dump nhg_website_recovery
```

Verify application health and representative data against the restored database before switching `DATABASE_NAME` under the approved recovery procedure. Keep the old database intact until the recovered deployment is verified.

Set and periodically review an explicit recovery point objective (RPO), recovery time objective (RTO), backup frequency, retention, encryption, and restore-test schedule before production launch.

## Rolling back a release

Record the image tag after every successful deploy (`ops/staging-bootstrap.sh` does this via `ops/record-release.sh`). Keep at least the previous tag's images on the host or in a registry.

**Application-only rollback** (schema unchanged, or the previous release is compatible with the current database):

```sh
sh ops/rollback.sh PREVIOUS_RELEASE_TAG
```

That starts the previously built `nhg-website-{backend,frontend,admin}:PREVIOUS_RELEASE_TAG` images with `--no-build`. It does not change PostgreSQL.

**Rollback that includes schema or data** (the release you are leaving applied migrations, or data is wrong):

1. Stop writes: `docker compose stop frontend admin backend`.
2. Take a fresh dump of the current database (`sh ops/backup-postgres.sh`) so the failed release can be inspected later.
3. Restore the **pre-deploy** dump into a new database (`sh ops/restore-postgres-to-new-db.sh ./backups/pre-deploy.dump nhg_website_recovery`).
4. Point `DATABASE_NAME` at the recovered database in root `.env` and `backend/.env`.
5. Start the previous application tag: `sh ops/rollback.sh PREVIOUS_RELEASE_TAG`.
6. Run the smoke test. Keep the old database until the recovered stack is verified.

Do not `migration:revert` in production unless the migration is known to be reversible and a dump already exists. Prefer restore-to-new-database over in-place revert.

If the previous images are missing, check out that git revision and rebuild:

```sh
git checkout PREVIOUS_GIT_SHA
RELEASE_TAG=PREVIOUS_RELEASE_TAG docker compose up --build -d
```

## Sentry, alerts, and logs

Production (and Compose) refuse to start the API without `SENTRY_DSN`. Set `SENTRY_ENVIRONMENT=staging` or `production` in `backend/.env` so events are labeled correctly.

In the Sentry project, before go-live:

1. Send a test event after deploy (trigger a controlled 5xx in staging, or use Sentry's test notification).
2. Alert on new high-severity issues and on error-volume spikes for the production environment.
3. Page or email the on-call when `/health` is not HTTP 200 (database, Redis, or storage down).
4. Alert when the daily `ops/backup-postgres.sh` job fails (non-zero exit or missing new dump).

Compose sets `LOG_FORMAT=json` on the backend. Ship `docker compose logs` (or the host journal) to your aggregator. Retain application logs at least as long as the backup retention you chose (for example 14 days hot, then compressed), and never log request bodies, tokens, or passwords. Request lines already include a correlation id.

Frontend and admin do not ship a Sentry SDK in this repository; unexpected API 5xx events are captured by the backend. Add a browser SDK later if you need client-side crash reports.

## Automated validation

GitHub Actions runs backend linting for the integration-test code, backend unit tests, database migrations, and application integration tests (health, public API, CMS login/refresh/permissions, and upload) against disposable PostgreSQL/Redis services. It also runs admin lint/tests/build, frontend tests/build, and Docker image builds for backend/frontend/admin on pushes to `main` and pull requests. The current backend and frontend repositories have existing full-project lint errors, so those broader lint commands are not yet CI gates; clean up the baseline before making them required checks.

To run the integration test locally, provide a disposable PostgreSQL database, Redis service, and the required backend environment variables (see `backend/.env.example`), then apply migrations and run:

```sh
cd backend
npm run migration:run
npm run test:e2e
```

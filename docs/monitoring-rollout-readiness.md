# Monitoring and controlled-rollout readiness

This runbook records the repository evidence and the checks still required before
approving a staging rollout. It is not authorization to deploy, contact an
unverified host, or send an alert to a production/on-call destination.

## Evidence observed

Verified 2026-11-11:

- `GET /health` is unauthenticated and reports database, Redis, and storage
  status. It is a dependency health endpoint, not an alerting service.
- Compose healthchecks PostgreSQL and Redis. The backend and Caddy services do
  not define Compose healthchecks.
- The backend can send unexpected exceptions to Sentry. Sentry initializes
  only when `SENTRY_DSN` is set; `SENTRY_ENVIRONMENT` is an optional label, and
  tracing is disabled (`tracesSampleRate: 0`). There are no Sentry alert rules
  or delivery recipients defined in this repository.
- `backend/.env` exists locally, but `SENTRY_DSN` is not configured there.
  Compose explicitly runs the backend as production, and backend validation
  requires `SENTRY_DSN` in production. The current local Compose environment
  therefore is not ready to start the backend as configured.
- The root `.env` has three distinct hostnames, but none is marked as staging.
  Their values were deliberately not printed or contacted. No staging-specific
  access or alert-delivery credentials were available in the process
  environment.
- CI builds/tests the applications and images; no staging deployment, runtime
  monitor, or alert-delivery gate is configured in the inspected workflow.

## Blockers to clear

- Obtain an explicitly identified, isolated staging environment and verify its
  domains, data stores, storage, and signing secrets are separate from
  production. Do not infer this from the local `.env`.
- Inject a staging-only Sentry DSN using the approved secret store, set a
  useful `SENTRY_ENVIRONMENT` such as `staging`, and confirm backend startup
  passes production environment validation. Do not put DSNs or credentials in
  this document or commit them.
- In the Sentry project (or the approved monitoring service), document and
  verify the error alert rule, delivery target, escalation/ownership, and
  recovery/resolve behavior. Repository configuration alone does not establish
  that alerts are routed or delivered.
- Configure an external availability monitor for the staging `/health` URL.
  Record its polling interval, timeout, failure threshold, notification
  destination, and the owner who acknowledges alerts. It must treat a
  non-2xx response or any dependency not `up` as unhealthy.

## Safe readiness checklist

### Before staging

- [ ] Confirm the target hostname is staging-only and approved; stop if its
  ownership or production separation is uncertain.
- [ ] Confirm credentials, database, Redis, file storage, JWT signing secret,
  CORS origins, and Sentry project/destination are all staging-specific.
- [ ] Review the release tag and commit to be tested. Preserve the previous
  known-good image tag and the approved rollback owner/decision path.
- [ ] Run `docker compose config --quiet` locally. This validates Compose
  configuration only; it does not validate Caddy's parsed configuration or
  prove that external secrets and services are correct.
- [ ] Run `sh -n ops/staging-bootstrap.sh` (or `bash -n` where `sh` is
  unavailable) and `node --check ops/smoke-test.mjs` before using those
  scripts.

### Staging-only rollout and verification

- [ ] Have the staging operator run `ops/staging-bootstrap.sh` only after
  confirming the selected Compose environment is isolated. It starts services,
  runs database migrations, and can create the first CMS administrator.
- [ ] Verify the API `/health` response is HTTP 200 with overall status `ok`
  and database, Redis, and storage all `up`.
- [ ] Validate the effective Caddy configuration on the staging host and
  inspect container logs for startup errors. Do not treat Compose syntax
  validation as a substitute for this.
- [ ] Run `ops/smoke-test.mjs` only against confirmed staging URLs with an
  approved staging CMS account. The test performs login/refresh and uploads
  then deletes a PNG; `SMOKE_SKIP_AUTH=1` omits those checks and is not a full
  rollout gate.
- [ ] Perform manual staging admin login, refresh, logout, content publish,
  upload, and public-site checks as documented in `docs/DEPLOYMENT.md`.
- [ ] Verify a non-paging alert test through an explicitly staging-only
  destination. First inspect the destination and routing; abort if any route
  can reach production/on-call. Do not use a production incident or live
  on-call notification as a test.
- [ ] Record the release tag, commit, test results, alert-delivery evidence,
  operator, and approval before any separate production change is considered.

### Abort and rollback criteria

Stop the rollout for failed health checks, missing dependencies, unresolved
startup/migration errors, failed smoke checks, or unverified alert routing.
Keep the previous image tag available. If an approved staging rollout must be
reverted, use the repository's controlled rollback procedure with the staging
operator; validate health and smoke checks again before declaring recovery.
Production rollout requires its own approval and independently verified
production monitoring and notification routes.

## Checks performed for this assessment

- `docker compose config --quiet` — passed; no services were started.
- `node --check ops/smoke-test.mjs` — passed; no network requests were made.
- Git Bash `-n` on `ops/staging-bootstrap.sh` and `ops/record-release.sh` —
  passed; neither script was executed.
- Caddyfile syntax was not validated locally because the Caddy CLI is
  unavailable; validate it on the confirmed staging host before rollout.
- No staging endpoint, alert destination, test incident, or deployment was
  contacted or triggered.

#!/usr/bin/env sh
set -eu

# Isolated staging bring-up: Compose stack, migrations, first Super Admin.
# Requires a configured root .env and backend/.env (including SENTRY_DSN,
# because Compose runs the API with NODE_ENV=production).

if [ ! -f .env ] || [ ! -f backend/.env ]; then
  echo "Create .env and backend/.env from the example files before staging bootstrap." >&2
  exit 2
fi

release_tag="${RELEASE_TAG:-$(date -u +%Y%m%dT%H%M%SZ)}"
export RELEASE_TAG="$release_tag"

docker compose config >/dev/null
docker compose up --build -d

echo "Waiting for API health inside the backend container..."
i=0
while [ "$i" -lt 30 ]; do
  if docker compose exec -T backend node -e \
    "fetch('http://127.0.0.1:3100/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" \
    >/dev/null 2>&1; then
    break
  fi
  i=$((i + 1))
  sleep 2
done

if [ "$i" -eq 30 ]; then
  echo "Backend health check did not succeed in time. Inspect: docker compose logs backend" >&2
  exit 1
fi

echo "Running database migrations..."
docker compose exec -T backend npm run migration:run:prod

if [ -n "${CMS_BOOTSTRAP_ADMIN_EMAIL:-}" ] && [ -n "${CMS_BOOTSTRAP_ADMIN_PASSWORD:-}" ]; then
  echo "Bootstrapping the first CMS Super Admin..."
  bootstrap_output="$(
    docker compose exec -T \
      -e CMS_BOOTSTRAP_ADMIN_EMAIL \
      -e CMS_BOOTSTRAP_ADMIN_PASSWORD \
      backend npm run bootstrap:admin:prod 2>&1
  )" && bootstrap_status=0 || bootstrap_status=$?
  printf '%s\n' "$bootstrap_output"
  if [ "$bootstrap_status" -ne 0 ]; then
    # Only the documented first-run refusal is benign ("N admin_users row(s)
    # already exist"). Everything else — unreachable database, failed
    # migration, password rejected by policy — used to be printed and then
    # discarded, so staging came up with no CMS identity and the script still
    # exited 0.
    case "$bootstrap_output" in
      *"already exist"*)
        echo "No first Super Admin created: one already exists. Continuing."
        ;;
      *)
        echo "Admin bootstrap FAILED (exit $bootstrap_status). The stack is up but has no usable CMS login." >&2
        exit "$bootstrap_status"
        ;;
    esac
  fi
else
  echo "Skipping admin bootstrap (set CMS_BOOTSTRAP_ADMIN_EMAIL and CMS_BOOTSTRAP_ADMIN_PASSWORD to create the first Super Admin)."
fi

sh ops/record-release.sh "$release_tag"

echo "Staging stack is up (RELEASE_TAG=$release_tag)."
echo "Verify with:"
echo "  SITE_URL=https://\$SITE_DOMAIN ADMIN_URL=https://\$ADMIN_DOMAIN API_URL=https://\$API_DOMAIN node ops/smoke-test.mjs"
echo "Then sign in to the admin app and confirm the public site loads."

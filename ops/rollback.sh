#!/usr/bin/env sh
set -eu

# Application rollback to a previously built Compose image tag.
# This does not rewrite the database. If the release you are leaving
# applied migrations, restore a pre-deploy dump first (see docs/DEPLOYMENT.md).

order_log="${RELEASE_DIR:-./backups/releases}/release-order.log"

if [ "$#" -lt 1 ]; then
  # Fall back to the previously recorded release instead of stopping. During
  # an incident the operator is not expected to recall the tag;
  # ops/record-release.sh now appends every release to release-order.log, so
  # the second-to-last line is what was live before this one.
  if [ -s "$order_log" ] && [ "$(wc -l < "$order_log")" -ge 2 ]; then
    discovered_tag="$(tail -n 2 "$order_log" | head -n 1)"
    printf 'No RELEASE_TAG given — using previous recorded release: %s\n' "$discovered_tag" >&2
    set -- "$discovered_tag"
  else
    echo "Usage: $0 <previous-RELEASE_TAG> [--with-db-restore path/to.dump new_database_name]" >&2
    echo "No previous release found in ${order_log}; pass the tag explicitly." >&2
    exit 2
  fi
fi

previous_tag="$1"

if [ "${2:-}" = "--with-db-restore" ]; then
  if [ "$#" -ne 4 ]; then
    echo "Usage: $0 <previous-RELEASE_TAG> --with-db-restore path/to.dump new_database_name" >&2
    exit 2
  fi
  echo "Restoring database into a new name before switching containers..."
  sh ops/restore-postgres-to-new-db.sh "$3" "$4"
  echo "Point DATABASE_NAME at $4 in root .env and backend/.env after you verify the restored data."
fi

if ! docker image inspect "nhg-website-backend:${previous_tag}" >/dev/null 2>&1 \
  || ! docker image inspect "nhg-website-frontend:${previous_tag}" >/dev/null 2>&1 \
  || ! docker image inspect "nhg-website-admin:${previous_tag}" >/dev/null 2>&1; then
  echo "One or more images for RELEASE_TAG=${previous_tag} are missing locally." >&2
  echo "Check out that git revision and rebuild, or load the images from your registry." >&2
  exit 1
fi

RELEASE_TAG="$previous_tag" docker compose up -d --no-build

echo "Rolled application containers back to RELEASE_TAG=${previous_tag}."
echo "Confirm health, then run the smoke test against the live URLs."

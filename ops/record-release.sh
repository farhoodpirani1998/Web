#!/usr/bin/env sh
set -eu

release_tag="${1:-${RELEASE_TAG:-local}}"
release_dir="${RELEASE_DIR:-./backups/releases}"
mkdir -p "$release_dir"
chmod 700 "$release_dir" 2>/dev/null || true

record="${release_dir%/}/release-${release_tag}.txt"
order_log="${release_dir%/}/release-order.log"

{
  printf 'recorded_at=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf 'release_tag=%s\n' "$release_tag"
  printf 'git_commit=%s\n' "$(git rev-parse HEAD 2>/dev/null || printf unknown)"
  printf '\n# docker compose images\n'
  docker compose images
} > "$record"
chmod 600 "$record"

# Append-only release history. The per-release records above were write-only:
# nothing read them, so ops/rollback.sh could not discover which tag came
# before the current one — the operator had to remember it during an incident.
if [ ! -s "$order_log" ] || [ "$(tail -n 1 "$order_log")" != "$release_tag" ]; then
  printf '%s\n' "$release_tag" >> "$order_log"
fi
chmod 600 "$order_log" 2>/dev/null || true

printf 'Release record written: %s\n' "$record"
printf 'Release order updated: %s\n' "$order_log"

printf 'Release record written: %s\n' "$record"
printf 'Keep this tag to roll application containers back with:\n'
printf '  RELEASE_TAG=%s docker compose up -d --no-build\n' "$release_tag"

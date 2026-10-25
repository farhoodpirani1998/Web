#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then
  echo "Usage: $0 path/to/nhg-website-backup.dump" >&2
  exit 2
fi

backup_file="$1"
temp_database="nhg_restore_verify_$(date -u +%Y%m%d%H%M%S)_$$"
database_created=0

cleanup() {
  if [ "$database_created" -eq 1 ]; then
    docker compose exec -T postgres sh -c \
      'dropdb --if-exists -U "$POSTGRES_USER" "$1"' sh "$temp_database"
  fi
}
trap cleanup EXIT HUP INT TERM

docker compose exec -T postgres pg_restore --list < "$backup_file" > /dev/null
docker compose exec -T postgres sh -c \
  'createdb -T template0 -U "$POSTGRES_USER" "$1"' sh "$temp_database"
database_created=1

docker compose exec -T postgres sh -c \
  'exec pg_restore --exit-on-error --no-owner --no-privileges -U "$POSTGRES_USER" -d "$1"' \
  sh "$temp_database" < "$backup_file"

# The count is an observation, not part of the restore. A dump without a
# `migrations` table made psql fail, and this script reports backup health —
# so a perfectly restorable backup was being marked as a verification failure.
migration_count="$(
  docker compose exec -T postgres sh -c \
    'psql -At -U "$POSTGRES_USER" -d "$1" -c "SELECT COUNT(*) FROM migrations"' \
    sh "$temp_database" 2>/dev/null
)" || migration_count='unavailable (no "migrations" table)'

printf 'Restore verification succeeded in isolated database %s (%s migrations).\n' \
  "$temp_database" "$migration_count"

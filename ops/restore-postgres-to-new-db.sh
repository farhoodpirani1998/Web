#!/usr/bin/env sh
set -eu

if [ "$#" -ne 2 ] || [ ! -f "$1" ]; then
  echo "Usage: $0 path/to/nhg-website-backup.dump new_database_name" >&2
  exit 2
fi

backup_file="$1"
target_database="$2"

case "$target_database" in
  [A-Za-z_]* ) ;;
  * )
    echo "Database name must start with a letter or underscore." >&2
    exit 2
    ;;
esac

case "$target_database" in
  *[!A-Za-z0-9_]* )
    echo "Database name may contain only letters, digits, and underscores." >&2
    exit 2
    ;;
esac

if [ "${#target_database}" -gt 63 ]; then
  echo "Database name must be 63 characters or fewer." >&2
  exit 2
fi

current_database="$(
  docker compose exec -T postgres sh -c 'printf "%s" "$POSTGRES_DB"'
)"
if [ "$target_database" = "$current_database" ]; then
  echo "Refusing to restore over the configured application database." >&2
  exit 1
fi

docker compose exec -T postgres pg_restore --list < "$backup_file" > /dev/null

printf 'This restores into a new database named %s. Type "CREATE %s" to continue: ' \
  "$target_database" "$target_database"
IFS= read -r confirmation
if [ "$confirmation" != "CREATE $target_database" ]; then
  echo "Restore cancelled." >&2
  exit 1
fi

database_created=0
restore_complete=0
cleanup() {
  if [ "$database_created" -eq 1 ] && [ "$restore_complete" -eq 0 ]; then
    docker compose exec -T postgres sh -c \
      'dropdb --if-exists -U "$POSTGRES_USER" "$1"' sh "$target_database"
  fi
}
trap cleanup EXIT HUP INT TERM

docker compose exec -T postgres sh -c \
  'createdb -T template0 -U "$POSTGRES_USER" "$1"' sh "$target_database"
database_created=1

docker compose exec -T postgres sh -c \
  'exec pg_restore --exit-on-error --no-owner --no-privileges -U "$POSTGRES_USER" -d "$1"' \
  sh "$target_database" < "$backup_file"

# Mark the restore complete before doing anything observational. The count
# below used to run first: a dump whose migrations table is absent or renamed
# made psql exit non-zero, `set -e` fired the EXIT trap while
# restore_complete was still 0, and the trap dropped the database that had
# just been restored successfully — destroying the one copy of the data the
# operator was trying to recover.
restore_complete=1

migration_count="$(
  docker compose exec -T postgres sh -c \
    'psql -At -U "$POSTGRES_USER" -d "$1" -c "SELECT COUNT(*) FROM migrations"' \
    sh "$target_database" 2>/dev/null
)" || migration_count='unavailable (no "migrations" table)'

printf 'Restore succeeded in new database %s (%s migrations).\n' \
  "$target_database" "$migration_count"
printf 'Verify application health and representative data before switching DATABASE_NAME.\n'

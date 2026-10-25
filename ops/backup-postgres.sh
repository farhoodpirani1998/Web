#!/usr/bin/env sh
set -eu

backup_dir="${BACKUP_DIR:-./backups}"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="${backup_dir%/}/nhg-website-${timestamp}.dump"

mkdir -p "$backup_dir"
chmod 700 "$backup_dir"

if [ -e "$backup_file" ]; then
  echo "Refusing to overwrite existing backup: $backup_file" >&2
  exit 1
fi

cleanup_partial_backup() {
  if [ -f "$backup_file" ]; then
    rm -f "$backup_file"
  fi
}
trap cleanup_partial_backup EXIT HUP INT TERM

docker compose exec -T postgres sh -c \
  'exec pg_dump --format=custom --no-owner --no-privileges -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  > "$backup_file"
chmod 600 "$backup_file"

docker compose exec -T postgres pg_restore --list < "$backup_file" > /dev/null

trap - EXIT HUP INT TERM
printf 'Database backup created and archive-validated: %s\n' "$backup_file"

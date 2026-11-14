# Backup and restore drill

## Current result

**Status: completed locally on 2026-11-11; staging/production were not used.**
The drill used Docker context `desktop-linux` and a new Compose project,
`nhg-backup-drill-20261111-1349`, containing only PostgreSQL 16. The project
created its own named volume. No existing containers were running when the
project was created, and no application services or real data were involved.

A synthetic `backup_drill_fixture` row containing `backup-drill-ok` was
created in `nhg_drill_db`. `ops/backup-postgres.sh` created
`nhg-website-20261111T102918Z.dump` (1,777 bytes) outside the repository, and
its `pg_restore --list` archive validation passed. The archive was restored
with `pg_restore --exit-on-error` into the separate database
`nhg_restore_drill_20261111_1349`. A query returned `backup-drill-ok` from
both source and restored databases.

The restore helper's interactive confirmation could not be passed reliably
through this Windows PowerShell/Git Bash invocation. After confirming the
target database did not exist, the same isolated restore was performed
directly with PostgreSQL's `createdb` and `pg_restore` tools. No credentials
or production/staging endpoints were inspected or used. The disposable
database, volume, and backup were removed after recording this evidence.

Do not run the drill against the current Compose project until its Docker
context, Compose project, and database are positively confirmed as disposable
and isolated from production. `backup-postgres.sh` dumps the database of the
selected Compose `postgres` service. The restore scripts create databases in
that same service; the production-database-name guard alone does not establish
that the service itself is non-production.

## Safe local drill procedure

Run only on a disposable local Docker engine or an explicitly approved,
isolated recovery environment. Use a separate working copy and fresh,
non-production environment files with local-only database credentials and
synthetic data. Do not copy production secrets into a local drill. The
Compose-project name isolates container and volume names; it does not make an
unsafe Docker context or production credentials safe.

From the working-copy root, with Docker running:

1. Choose a unique project name and confirm the Docker context is local and
   the environment files contain only disposable, non-production settings:

   ```sh
   docker context show
   drill_suffix="$(date -u +%Y%m%d%H%M%S)_$$"
   export COMPOSE_PROJECT_NAME="nhg-backup-drill-$drill_suffix"
   docker compose config --quiet
   ```

   Stop if the Docker context or environment cannot be positively verified.
   Do not use the project name of an existing stack.

2. Start only the isolated PostgreSQL service and confirm it is healthy:

   ```sh
   docker compose up -d postgres
   docker compose ps postgres
   ```

3. Add a synthetic fixture to the disposable database and record the expected
   value (`backup-drill-ok`). For an application-level test, use its schema
   and non-sensitive test data instead. Do not use production or personal
   data.

   ```sh
   docker compose exec -T postgres sh -c \
     "psql -v ON_ERROR_STOP=1 -U \"\$POSTGRES_USER\" -d \"\$POSTGRES_DB\" -c \"CREATE TABLE backup_drill_fixture (id integer PRIMARY KEY, marker text NOT NULL); INSERT INTO backup_drill_fixture VALUES (1, 'backup-drill-ok');\""
   ```

4. Create and archive-validate a backup. Keep the output path printed by the
   script:

   ```sh
   backup_dir="./backups/restore-drill-$drill_suffix"
   BACKUP_DIR="$backup_dir" sh ops/backup-postgres.sh
   backup_file="$(find "$backup_dir" -maxdepth 1 -type f -name 'nhg-website-*.dump' -print -quit)"
   test -n "$backup_file"
   sh ops/verify-postgres-backup.sh "$backup_file"
   ```

5. Restore the same dump into a unique, disposable database name different
   from the configured application database. The script requires the exact
   typed confirmation shown below; pipe it only after confirming the isolated
   Compose project:

   ```sh
   restore_db="nhg_restore_drill_$drill_suffix"
   printf 'CREATE %s\n' "$restore_db" |
     sh ops/restore-postgres-to-new-db.sh "$backup_file" "$restore_db"
   ```

6. Query the restored database and compare the fixture value with the
   expected `backup-drill-ok`:

   ```sh
   docker compose exec -T postgres sh -c \
     'psql -At -U "$POSTGRES_USER" -d "$1" -c "SELECT marker FROM backup_drill_fixture WHERE id = 1"' \
     sh "$restore_db"
   ```

   Record the backup filename, project/context, command outcomes,
   restored-database check, and date in this document only after successful
   observation. Do not record credentials or personal data.

The verification helper drops its temporary verification database. The
restore-to-new-database helper intentionally leaves its successfully restored
database in place. Retain the dump and restored database until evidence is
recorded; remove drill resources only after re-confirming the unique project
name and that no needed evidence remains.

## Completion evidence

- Date: 2026-11-11
- Docker context and unique Compose project: `desktop-linux`;
  `nhg-backup-drill-20261111-1349`
- Backup filename and archive validation:
  `nhg-website-20261111T102918Z.dump`, 1,777 bytes; `pg_restore --list`
  passed
- Isolated restore result: restored successfully to
  `nhg_restore_drill_20261111_1349`; `pg_restore --exit-on-error` passed
- Synthetic fixture check: `backup-drill-ok` returned from both source and
  restored databases
- Cleanup: the isolated Compose project/volume and temporary backup were
  removed after verification

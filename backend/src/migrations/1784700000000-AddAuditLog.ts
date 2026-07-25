import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `audit_log_entries` — backs the admin Dashboard's "Recent
 * Activity" section (`core/audit-log/`). Purely additive: no existing
 * table is altered. Rows are written only by `AuditLogListener`
 * reacting to events every content/media/settings service already
 * emits (`WEBSITE_EVENTS`) — no other table's write path changes.
 *
 * `action` is plain `character varying`, not a Postgres enum, since
 * it mirrors whatever string the source event reports (a `PublishStatus`
 * value, or a fixed literal like "media_uploaded") rather than a closed,
 * migration-guarded set — see `AuditLogEntry`'s own doc comment.
 *
 * `entityType`/`entityId` are nullable: a `settings_updated` row has
 * neither (see `AuditLogListener.handleSettingsUpdated`).
 *
 * Written by hand against the entity definition, same convention as
 * every other migration in this project.
 */
export class AddAuditLog1784700000000 implements MigrationInterface {
  name = 'AddAuditLog1784700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "audit_log_entries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "action" character varying NOT NULL,
        "entityType" character varying,
        "entityId" uuid,
        "metadata" jsonb,
        CONSTRAINT "PK_audit_log_entries" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_audit_log_entries_siteId" ON "audit_log_entries" ("siteId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_log_entries_siteId_createdAt" ON "audit_log_entries" ("siteId", "createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_audit_log_entries_siteId_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_log_entries_siteId"`);
    await queryRunner.query(`DROP TABLE "audit_log_entries"`);
  }
}

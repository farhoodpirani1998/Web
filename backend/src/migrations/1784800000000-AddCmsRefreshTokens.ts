import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `cms_refresh_tokens` — backs the CMS Admin "Persistent Login"
 * feature (`identity/auth/entities/cms-refresh-token.entity.ts`).
 * Purely additive: no existing table is altered.
 *
 * No foreign key to `admin_users`: same convention as
 * `audit_log_entries.siteId`, a plain indexed uuid column rather than a
 * DB-enforced FK — this codebase's migrations consistently avoid FK
 * constraints between website-module tables (see e.g.
 * `website_role_assignments`), keeping referential integrity a
 * service-layer concern.
 *
 * Written by hand against the entity definition, same convention as
 * every other migration in this project.
 */
export class AddCmsRefreshTokens1784800000000 implements MigrationInterface {
  name = 'AddCmsRefreshTokens1784800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "cms_refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "adminId" uuid NOT NULL,
        "tokenHash" character varying NOT NULL,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "revokedAt" TIMESTAMP WITH TIME ZONE,
        "replacedByTokenHash" character varying,
        CONSTRAINT "PK_cms_refresh_tokens" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_cms_refresh_tokens_adminId" ON "cms_refresh_tokens" ("adminId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cms_refresh_tokens_tokenHash" ON "cms_refresh_tokens" ("tokenHash")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_cms_refresh_tokens_tokenHash"`);
    await queryRunner.query(`DROP INDEX "IDX_cms_refresh_tokens_adminId"`);
    await queryRunner.query(`DROP TABLE "cms_refresh_tokens"`);
  }
}

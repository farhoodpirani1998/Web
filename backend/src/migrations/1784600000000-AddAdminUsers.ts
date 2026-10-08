import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `admin_users` — the identity table for locally-authenticated CMS
 * administrators (Sprint 2.2, "CMS Identity Foundation"). Purely
 * additive: no existing table is altered, dropped, or renamed, and
 * `website_role_assignments` (SMS's integration point, see
 * `auth/entities/website-role-assignment.entity.ts`) is untouched.
 *
 * `admin_users_role_enum` mirrors the same five `WebsiteRole` values as
 * `website_role_assignments_role_enum`, kept as its own distinct
 * Postgres type rather than reused across tables — same convention
 * this schema already follows for repeated value sets (e.g.
 * `about_page_status_enum` vs `faqs_status_enum`, both
 * draft/published/archived but separate types).
 *
 * No foreign keys, consistent with every other table in this schema
 * (see AddCtaBanner's note on siteId/backgroundImageMediaId being
 * plain uuid columns validated at the service layer, not TypeORM
 * relations) — not applicable here since admin_users has no relations
 * to other tables yet, but noted for consistency.
 *
 * Written by hand against the entity definition, same convention as
 * every other migration in this project (InitSchema onward).
 */
export class AddAdminUsers1784600000000 implements MigrationInterface {
  name = 'AddAdminUsers1784600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "admin_users_role_enum" AS ENUM (
        'website_super_admin', 'content_editor', 'publisher',
        'seo_marketing_manager', 'media_manager'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "admin_users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "email" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "role" "admin_users_role_enum" NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_admin_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_admin_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_admin_users_email" ON "admin_users" ("email")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_admin_users_email"`);
    await queryRunner.query(`DROP TABLE "admin_users"`);
    await queryRunner.query(`DROP TYPE "admin_users_role_enum"`);
  }
}

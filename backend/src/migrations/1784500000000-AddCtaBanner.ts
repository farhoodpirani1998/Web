import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the CTA Banner CMS module: the `cta_banner` table — a singleton
 * per site (one row, unique siteId), same shape as `about_page`
 * (translatable title, a status column) minus the SEO columns (CTA
 * isn't its own indexable page — see CtaBanner entity doc), plus the
 * fields a call-to-action banner actually needs: an optional
 * translatable `description`, a required primary button
 * (label/url), and an optional secondary button (label/url) — and the
 * `featureFlagsCtaEnabled` column on `site_settings` (see
 * SiteFeatureFlags.ctaEnabled), same pattern AddCalendarEvents already
 * used for `featureFlagsEventsEnabled`.
 *
 * Written by hand against the entity definitions, same convention as
 * InitSchema/AddCalendarEvents/AddCampuses/AddTeachers/AddStatistics —
 * no foreign-key constraints (siteId, backgroundImageMediaId are plain
 * uuid columns validated at the service layer, not TypeORM relations),
 * consistent with every other table in this schema. Does NOT touch
 * `content_revisions`/its enabled-types list — a CTA banner has no
 * long-form prose field, so it is not one of the revision-enabled
 * types (see the entity's doc comment and
 * RevisionsService.REVISION_ENABLED_TYPES).
 */
export class AddCtaBanner1784500000000 implements MigrationInterface {
  name = 'AddCtaBanner1784500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "cta_banner_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);

    await queryRunner.query(`
      CREATE TABLE "cta_banner" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "siteId" uuid NOT NULL,
        "title" jsonb NOT NULL,
        "description" jsonb,
        "primaryButtonLabel" jsonb NOT NULL,
        "primaryButtonUrl" character varying NOT NULL,
        "secondaryButtonLabel" jsonb,
        "secondaryButtonUrl" character varying,
        "backgroundImageMediaId" uuid,
        "status" "cta_banner_status_enum" NOT NULL DEFAULT 'draft',
        CONSTRAINT "UQ_cta_banner_siteId" UNIQUE ("siteId"),
        CONSTRAINT "PK_cta_banner" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_cta_banner_siteId" ON "cta_banner" ("siteId")`);

    await queryRunner.query(`
      ALTER TABLE "site_settings"
      ADD COLUMN "featureFlagsCtaEnabled" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "featureFlagsCtaEnabled"`);
    await queryRunner.query(`DROP TABLE "cta_banner"`);
    await queryRunner.query(`DROP TYPE "cta_banner_status_enum"`);
  }
}
